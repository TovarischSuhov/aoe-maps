#!/usr/bin/env node
/* LSP-гейт для .rms/.xs: прогон каталога через aoe2-lsp и сбор диагностик.
 * Замена `go run ./cmd/corpus` там, где Go не установлен (runbook допускает
 * stdio-клиент). Протокол повторяет internal/corpus/runner.go: одна сессия
 * сервера на файл, initialize с workspaceFolders, didOpen, ожидание пуша
 * диагностик (diagWait 10 c), shutdown/exit; таймауты как в corpus.
 * Запуск:
 *   node tools/lsp-check.mjs [<каталог>] [<путь к aoe2-lsp(.exe)>]
 * Код возврата ненулевой, если есть диагностики или сервер пал (timeout/exit).
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const dir = path.resolve(process.argv[2] ?? new URL('../maps', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const bin = process.argv[3] ?? path.join(process.env.USERPROFILE ?? process.env.HOME, 'aoe2-lsp', 'aoe2-lsp.exe');

const SESSION_TIMEOUT = 60_000; // sessionTimeout
const DIAG_WAIT = 10_000;       // diagWait
const EXIT_GRACE = 5_000;       // exitGrace

function toUri(p) {
	return 'file:///' + p.replaceAll('\\', '/').split('/').map(encodeURIComponent).join('/');
}
const languageID = p => (/\.xs$/i.test(p) ? 'xs' : 'rms');

/* Одна сессия: свежий процесс сервера на один файл — как в corpus. */
async function runFile(f) {
	const child = spawn(bin, [], { stdio: ['pipe', 'pipe', 'pipe'] });
	let stderr = '';
	child.stderr.on('data', d => { stderr += d; });

	let buf = Buffer.alloc(0);
	let done = false;
	const diags = [];
	const pending = new Map();
	let nextId = 1;
	let msgWaiters = [];

	const deadline = Date.now() + SESSION_TIMEOUT;
	let timedOut = false;
	const timer = setTimeout(() => { timedOut = true; finish(); }, SESSION_TIMEOUT);

	function finish() {
		if (done) return;
		done = true;
		clearTimeout(timer);
		try { child.stdin.close(); } catch {}
		setTimeout(() => { try { child.kill(); } catch {} }, EXIT_GRACE).unref?.();
	}

	child.stdout.on('data', chunk => {
		buf = Buffer.concat([buf, chunk]);
		for (;;) {
			const head = buf.indexOf('\r\n\r\n');
			if (head < 0) break;
			const m = buf.slice(0, head).toString('ascii').match(/Content-Length:\s*(\d+)/i);
			const len = m ? parseInt(m[1], 10) : -1;
			if (len < 0) { buf = buf.slice(head + 4); continue; }
			if (buf.length < head + 4 + len) break;
			const body = buf.slice(head + 4, head + 4 + len).toString('utf8');
			buf = buf.slice(head + 4 + len);
			let msg;
			try { msg = JSON.parse(body); } catch { continue; }
			if (msg.id !== undefined && pending.has(msg.id)) {
				pending.get(msg.id)(msg);
				pending.delete(msg.id);
			}
			if (msg.method === 'textDocument/publishDiagnostics') {
				diags.push(...msg.params.diagnostics);
			}
			const ws = msgWaiters; msgWaiters = [];
			for (const w of ws) w();
		}
	});

	function send(method, params) {
		const id = nextId++;
		const body = JSON.stringify({ jsonrpc: '2.0', id, method, params });
		child.stdin.write(`Content-Length: ${Buffer.byteLength(body)}\r\n\r\n${body}`);
		return new Promise(res => pending.set(id, res));
	}
	function notify(method, params) {
		const body = JSON.stringify({ jsonrpc: '2.0', method, params });
		child.stdin.write(`Content-Length: ${Buffer.byteLength(body)}\r\n\r\n${body}`);
	}
	const sleep = ms => new Promise(r => setTimeout(r, ms));
	const waitMsg = async ms => {
		if (done) return false;
		const t = setTimeout(() => { const ws = msgWaiters; msgWaiters = msgWaiters.filter(x => x !== res); res(); }, ms);
		const res = () => { clearTimeout(t); };
		// упрощённо: просто ждём указанное время или первый пуш
		await new Promise(r => {
			msgWaiters.push(() => { clearTimeout(t); r(); });
			setTimeout(() => r(), ms);
		});
		return !done;
	};

	const result = { file: path.basename(f), diags, status: 'ok' };
	try {
		await send('initialize', {
			processId: process.pid,
			workspaceFolders: [{ uri: toUri(dir), name: 'maps' }],
			capabilities: { general: { positionEncodings: ['utf-8'] } },
		});
		notify('initialized', {});
		notify('textDocument/didOpen', {
			textDocument: { uri: toUri(f), languageId: languageID(f), version: 1, text: fs.readFileSync(f, 'utf8') },
		});
		// ждём первый пуш диагностик, как awaitDiagnostics: до DIAG_WAIT
		const waitStart = diags.length;
		const until = Date.now() + DIAG_WAIT;
		while (diags.length === waitStart && Date.now() < until && !done) {
			await waitMsg(Math.min(200, until - Date.now()));
		}
		await send('shutdown', {});
		notify('exit', {});
	} catch (e) {
		result.status = 'transport: ' + e.message;
	}
	finish();
	const exited = await Promise.race([
		new Promise(r => child.on('exit', r)),
		sleep(EXIT_GRACE + 1000).then(() => false),
	]);
	if (timedOut) result.status = 'timeout';
	else if (!exited && result.status === 'ok') result.status = 'ok'; // убили по грейсу
	else if (typeof exited === 'object' && exited?.code > 0 && result.status === 'ok') {
		result.status = `exit ${exited.code}`;
	}
	result.stderr = stderr;
	return result;
}

const files = fs.readdirSync(dir)
	.filter(x => /\.(rms|xs)$/i.test(x))
	.sort()
	.map(x => path.join(dir, x));

let bad = 0;
for (const f of files) {
	const r = await runFile(f);
	const lines = [];
	if (r.diags.length) {
		for (const d of r.diags.slice(0, 20)) {
			const { line, character } = d.range?.start ?? { line: 0, character: 0 };
			lines.push(`    [sev ${d.severity}] ${d.code ?? ''} L${line + 1}:${character + 1} ${(d.message ?? '').split('\n')[0]}`);
		}
		if (r.diags.length > 20) lines.push(`    … и ещё ${r.diags.length - 20}`);
	}
	const flag = r.status !== 'ok' || r.diags.length ? 'ДИАГНОСТИКИ/СБОЙ' : 'ok';
	console.log(`${r.file}: ${r.diags.length} диагностик, статус ${r.status} — ${flag}`);
	for (const l of lines) console.log(l);
	if (r.status !== 'ok' && r.stderr.trim()) console.log(`    stderr: ${r.stderr.trim().split('\n').slice(-3).join(' | ')}`);
	if (flag !== 'ok') bad++;
}
console.log(`\nфайлов: ${files.length}, с диагностиками/сбоем: ${bad}`);
process.exit(bad ? 1 : 0);
