#!/usr/bin/env node
/* Публикация/обновление мода StandartRandom на портале ageofempires.com
 * через внутренний API сайта (api.ageofempires.com/api/v4/mods/Publish) —
 * те же запросы, что делает кнопка Submit a Mod. Формат запроса снят с
 * JS сайта (main.2dd3a1.js, _submitForm); ответ: {resultKey:"ModId",...}.
 *
 * Использование:
 *   AOE_COOKIE="<Cookie: ...>" node tools/publish-mod.mjs [опции]
 * Опции:
 *   --mod-id 583593        id мода на портале (обновление)
 *   --new                  создать новый мод (modId не задаётся; gameTitleId 2)
 *   --zip dist/StandartRandom.zip   путь к архиву (≤ 4 МБ, иначе чанки)
 *   --name "StandartRandom"
 *   --description-file mod/StandartRandom/description.en.md
 *   --changelog-html '<p>0.3.0 — ...</p>'
 *   --tags 15              id тегов (можно несколько флагов); 15 = Random Maps
 *   --image <файл>         картинка для modImages (можно несколько; jpeg/png/gif ≤8МБ;
 *                          для нового мода — превью)
 *   --game-title-id 2      только с --new (2 = AoE2 DE)
 *   --visibility Public    | Private
 *   --discussion false
 *   --yes                  реально отправить (без флага — только показать)
 * Cookie целиком (строка из Copy as cURL, заголовок Cookie) — в переменной
 * окружения AOE_COOKIE или в файле, указанном в --cookie-file. В git не
 * класть: репо открытый. Dry-run (--yes нет) работает без cookie.
 */
import fs from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2);
function arg(name, def) {
	const i = argv.indexOf(name);
	return i >= 0 ? argv[i + 1] : def;
}
const flag = name => argv.includes(name);

const root = path.resolve(new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const modId = arg('--mod-id', null);
const isNew = flag('--new');
if (!modId && !isNew) {
	console.error('Укажите --mod-id <id> (обновление) или --new (создание нового мода)');
	process.exit(2);
}
const zipPath = path.resolve(arg('--zip', 'dist/StandartRandom.zip'));
let name = arg('--name', isNew ? '' : null); // resolved from portal Detail after fetch; do NOT default to another mod's name
if (!name) {
	console.error('Для нового мода задайте --name');
	process.exit(2);
}
const descFile = path.resolve(arg('--description-file', 'mod/StandartRandom/description.en.md'));
const changelogHtml = arg('--changelog-html', null);
const tags = argv.filter(a => a === '--tags').map(a => argv[argv.indexOf(a) + 1]);
const images = argv.filter(a => a === '--image').map(a => path.resolve(argv[argv.indexOf(a) + 1]));
const gameTitleId = arg('--game-title-id', '2');
const visibility = arg('--visibility', 'Public');
const discussion = (arg('--discussion', 'false')) === 'true';
const cookieFile = arg('--cookie-file', null);
const yes = flag('--yes');

let cookie = process.env.AOE_COOKIE ?? '';
if (cookieFile) cookie = fs.readFileSync(cookieFile, 'utf8').trim();
if (!cookie && (yes || modId)) {
	console.error('Нет cookie: задайте AOE_COOKIE=<строка Cookie из Copy as cURL> или --cookie-file <файл>');
	process.exit(2);
}

const description = fs.readFileSync(descFile, 'utf8');
const zipBuf = fs.readFileSync(zipPath);
if (zipBuf.length > 4 * 1024 * 1024) {
	console.error(`Архив ${zipBuf.length} байт > 4 МБ — на сайте такой грузится чанками, инструмент это не умеет`);
	process.exit(2);
}
const imageBufs = images.map(p => ({ p, buf: fs.readFileSync(p) }));
for (const im of imageBufs) {
	if (im.buf.length > 8 * 1024 * 1024) {
		console.error(`Картинка ${im.p} > 8 МБ`);
		process.exit(2);
	}
}

const base = 'https://api.ageofempires.com/api/v4/mods';
const headers = {
	Cookie: cookie,
	Origin: 'https://www.ageofempires.com',
	Referer: 'https://www.ageofempires.com/',
	'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) aoemaps-publish/0.1',
	Accept: '*/*',
};

/* 1. Обновление: текущее состояние мода (владелец + сохранение картинок) */
let detail = null;
let imageMeta = [];
if (modId) {
	detail = await (await fetch(`${base}/Detail/${modId}`, { headers })).json();
	if (!detail.modId) {
		console.error('Detail не вернул мод (сессия протухла? не тот modId?):', JSON.stringify(detail).slice(0, 200));
		process.exit(2);
	}
	if (!detail.isOwner) {
		console.error(`Мод ${detail.modName} не принадлежит этой сессии (creator ${detail.creatorName})`);
		process.exit(2);
	}
	if (!name) name = detail.modName; // keep the portal name unless --name given
	imageMeta = (detail.imageUrls ?? []).map((im, i) => ({
		imageId: im.imageId ?? null,
		displayIndex: im.displayIndex ?? i,
		imageName: im.imageName ?? '',
		imageThumbnail: im.imageThumbnail ?? '',
	}));
}

/* 2. Сборка multipart (поля — точно как _submitForm на сайте) */
function mimeOf(p) {
	return { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif' }[path.extname(p).toLowerCase()] ?? 'application/octet-stream';
}
/* каждый новый файл modImages получает placeholder в ImageMetaData — иначе
 * сервер картинку не привязывает (кейс DynamicRMS 0.1.1: превью слетало) */
imageBufs.forEach((im, i) => {
	imageMeta.push({
		imageId: null,
		displayIndex: imageMeta.length + i,
		imageName: path.basename(im.p),
		imageThumbnail: '',
	});
});
const fd = new FormData();
if (modId) fd.append('modId', modId);
fd.append('gameTitleId', modId ? String(detail.gameTitleId) : gameTitleId);
for (const t of tags) fd.append('modTags', t);
fd.append('modName', name);
fd.append('description', description);
if (changelogHtml) fd.append('changeList', changelogHtml);
fd.append('modVisibility', visibility);
fd.append('modDiscussion', String(discussion));
fd.append('ImageMetaData', JSON.stringify(imageMeta));
for (const im of imageBufs) {
	fd.append('modImages', new File([im.buf], path.basename(im.p), { type: mimeOf(im.p) }));
}
fd.append('modFiles', new File([zipBuf], path.basename(zipPath), { type: 'application/zip' }));
fd.append('modType', '1');

console.log(`${modId ? `Мод ${modId} «${detail.modName}» (v портала: ${detail.modVersion}, обновлён ${detail.lastUpdate})` : 'НОВЫЙ мод'}`);
console.log(`Отправка: name=${name}, zip=${zipBuf.length} байт, tags=[${tags}], visibility=${visibility}, images сохраняются: ${imageMeta.length}, новых картинок: ${imageBufs.length}`);
console.log(`Changelog: ${changelogHtml ? changelogHtml.slice(0, 80) + '…' : '(не меняется)'}`);
if (!yes) {
	console.log('\n[--dry] Не отправлено. Добавьте --yes для реальной публикации.');
	process.exit(0);
}

/* 3. Публикация */
const res = await fetch(`${base}/Publish`, { method: 'POST', headers, body: fd });
const out = await res.json().catch(() => ({}));
if (res.status !== 200 || out.resultKey !== 'ModId' || out.resultValue === '-1') {
	console.error(`Ошибка публикации (HTTP ${res.status}):`, JSON.stringify(out).slice(0, 300));
	process.exit(1);
}

/* 4. Верификация */
const after = await (await fetch(`${base}/Detail/${out.resultValue}`, { headers })).json();
console.log(`\nОпубликовано: modId ${out.resultValue}, версия портала ${after.modVersion}, размер ${after.modFileSize} байт, обновлён ${after.lastUpdate}`);
console.log(`Страница: https://www.ageofempires.com/mods/details/${out.resultValue}/`);
