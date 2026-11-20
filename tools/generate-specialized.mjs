#!/usr/bin/env node
/* Генерирует специализированные случайные карты Standart{Open,Nomad,Close,Water,Hybrid}Random.rms
 * из официального maps.json игры. Запуск:
 *   node tools/generate-specialized.mjs [<путь к maps.json>] [<папка вывода>]
 * По умолчанию: maps.json из Steam-установки, вывод — maps/.
 *
 * Правила классификации: карта попадает в КАЖДЫЙ пул, чей флаг у неё есть
 * (closed -> Close, nomad -> Nomad, water -> Water, mixed -> Hybrid, open ->
 * Open) — пересечения допустимы, одна карта может играть в нескольких
 * подборках. Карты без флагов (land-only) раскладываются вручную (LAND_ONLY).
 * Исключаются: megarandom.rms2, EM * (варианты quickplay/Empire Wars), CtR * (Capture the Relic).
 * Проценты: одна карта на партию гарантирована — сумма percent_chance ровно 100
 * (идиом официальных скриптов: см. Arabia.rms RND_SPAWN_FOREST_*, MegaRandom.rms2).
 */
import fs from 'node:fs';
import path from 'node:path';

const gameMapsJson = process.argv[2] ??
	'C:/Program Files (x86)/Steam/steamapps/common/AoE2DE/resources/_common/dat/maps.json';
const gameScriptsDir = path.join(path.dirname(gameMapsJson), '../drs/gamedata_x2');
const outDir = process.argv[3] ?? new URL('../maps', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const modDir = path.join(outDir, '..', 'mod', 'StandartRandom');
const today = new Date().toISOString().slice(0, 10);

/* Человеческие имена карт для списков в описаниях: механика (расширение
 * снять, _ -> пробел, camelCase развести, первые буквы поднять) плюс
 * переопределения там, где историческое имя в лобби отличается. */
const NAME_OVERRIDES = {
	'Scandanavia.rms': 'Scandinavia',   // в скрипте игры имя с опечаткой
	'hillfort.rms2': 'Hill Fort',
	'cityoflakes.rms2': 'City of Lakes',
	'goldenpit.rms2': 'Golden Pit',
	'hamburger.rms2': 'Hamburger',
};
function displayName(f) {
	if (NAME_OVERRIDES[f]) return NAME_OVERRIDES[f];
	let s = f.replace(/\.(rms2?|inc)$/i, '').replace(/_/g, ' ');
	s = s.replace(/(?<=[a-z])(?=[A-Z])/g, ' ');
	return s.split(' ').map(w => w ? w[0].toUpperCase() + w.slice(1) : w).join(' ');
}

/* land-only карты (нет ни одного флага в maps.json) — раскладка вручную по
 * фактическому характеру геймплея; помечены комментарием в шапке пула. */
const LAND_ONLY = {
	Open: [
		'Mongolia.rms', 'Yucatan.rms', 'Oasis.rms', 'Alpine_Lakes.rms',
		'Shrubland.rms', 'Glade.rms', 'hillfort.rms2',
	],
	Close: [
		'hideout.rms2', 'TeamMoats.rms', 'RingFortress.rms',
		'Enclosed.rms', 'fortified_clearing.rms',
	],
};

const EXCLUDE = new Set([
	'megarandom.rms2',          // случайный «всё подряд» — он и есть глобальный вариант
	'CtR Pyramid Descent.rms2', // режим Capture the Relic
	'EM Arabia.rms', 'EM Arena.rms', 'EM Black Forest.rms', 'EM Nomad.rms',
	'EM Runestones.rms', 'EM Glade.rms', 'EM Fortified Clearing.rms', // quickplay/EW
]);

const POOLS = [
	{ suffix: 'Open',   title: 'открытые',     flag: 'open'   },
	{ suffix: 'Nomad',  title: 'номадские',    flag: 'nomad'  },
	{ suffix: 'Close',  title: 'закрытые',     flag: 'closed' },
	{ suffix: 'Water',  title: 'водные',       flag: 'water'  },
	{ suffix: 'Hybrid', title: 'гибридные',    flag: 'mixed'  },
];

// Пересечения допустимы: одна карта может попасть в несколько пулов.
function classify(e) {
	const cats = [];
	if (e.closed) cats.push('Close');
	if (e.nomad) cats.push('Nomad');
	if (e.water) cats.push('Water');
	if (e.mixed) cats.push('Hybrid');
	if (e.open) cats.push('Open');
	return cats; // пусто -> land-only, ручная раскладка
}

/* Ровно 100% на пул из n карт: базовая доля floor(100/n), остаток размазан
 * равномерно (каждая k-я карта получает +1%). */
function distribute(n) {
	const base = Math.floor(100 / n), rem = 100 % n;
	const pct = [];
	let acc = 0;
	for (let i = 0; i < n; i++) {
		const target = Math.round(((i + 1) * rem) / n);
		pct.push(base + target - acc);
		acc = target;
	}
	return pct;
}

const db = JSON.parse(fs.readFileSync(gameMapsJson, 'utf8'));
const std = db.map_list.filter(e =>
	e.style === 'random' && e.random_map === true && e.script_filename && !EXCLUDE.has(e.script_filename));

// Каждое имя скрипта обязано физически существовать в gamedata_x2 — иначе
// include_drs в игре не разрешился бы.
const onDisk = new Set(fs.readdirSync(gameScriptsDir));
for (const e of std) {
	if (!onDisk.has(e.script_filename)) {
		throw new Error(`script ${e.script_filename} отсутствует в ${gameScriptsDir}`);
	}
}

const pools = Object.fromEntries(POOLS.map(p => [p.suffix, []]));
for (const e of std) {
	const cats = classify(e);
	if (cats.length) {
		for (const c of cats) pools[c].push(e);
		continue;
	}
	const manual = LAND_ONLY.Open.includes(e.script_filename) ? 'Open'
		: LAND_ONLY.Close.includes(e.script_filename) ? 'Close' : null;
	if (!manual) {
		throw new Error(`land-only карта без ручной раскладки: ${e.script_filename}`);
	}
	pools[manual].push(e);
}

let total = 0;
for (const p of POOLS) {
	const maps = pools[p.suffix];
	total += maps.length;
	if (maps.length > 100) {
		throw new Error(`пул ${p.suffix} больше 100 карт (${maps.length}) — проценты не разложатся`);
	}
	const pct = distribute(maps.length);
	const lines = [];
	for (let i = 0; i < maps.length; i++) {
		lines.push(`	percent_chance ${pct[i]} #define PICK_${String(i + 1).padStart(3, '0')}`);
	}
	// цепочка if/elseif — первая выпавшая ветка включает свою карту
	const chainLines = maps.map((m, i) => {
		const inc = m.script_filename.includes(' ') ? `"${m.script_filename}"` : m.script_filename;
		const kw = i === 0 ? 'if' : 'elseif';
		return `${kw} PICK_${String(i + 1).padStart(3, '0')}\n	#include_drs ${inc}`;
	}).join('\n');

	const manualNote = (LAND_ONLY[p.suffix] ?? []).length
		? `\n * ${p.suffix === 'Close' ? 'Закрытые' : 'Открытые'} land-only карты без флагов в maps.json (ручная\n * раскладка по характеру геймплея): ${LAND_ONLY[p.suffix].join(', ')}.`
		: '';
	const body = `/* Standart${p.suffix}Random.rms — случайная «${p.title}» карта из стандартного пула AoE2: DE.
 *
 * Сгенерировано tools/generate-specialized.mjs из resources/_common/dat/maps.json
 * (${today}). Пул: style=random, все карты с флагом ${p.flag} из maps.json
 * (пересечения допустимы: карта с несколькими флагами играет в нескольких
 * подборках).${manualNote}
 * Исключены: megarandom, EM* (quickplay/Empire Wars), CtR* (Capture the Relic).
 *
 * Карты не копируются: каждая подключается из установки игры через
 * #include_drs (резолв по имени из resources/_common/drs/gamedata_x2/).
 * percent_chance — эксклюзивный выбор, сумма ровно 100: одна карта на партию
 * гарантирована (идиом официальных скриптов — Arabia.rms, MegaRandom.rms2).
 * В пуле ${maps.length} карт; доли ${Math.min(...pct)}–${Math.max(...pct)}% разбросаны равномерно.
 */

start_random
${lines.join('\n')}
end_random

${chainLines}
endif
`;
	fs.writeFileSync(path.join(outDir, `Standart${p.suffix}Random.rms`), body);
	console.log(`Standart${p.suffix}Random.rms: ${maps.length} карт, проценты ${Math.min(...pct)}-${Math.max(...pct)}%`);
}
console.log(`итого в пулах: ${total} карт`);

/* ---- Составы пулов: pool-lists.md + описания между маркерами AUTO ---- */

// Общий список берём из самого StandartRandom.rms — единственный источник.
const generalRms = fs.readFileSync(path.join(outDir, 'StandartRandom.rms'), 'utf8');
const generalNames = [...generalRms.matchAll(/^\t#include_drs (.+)$/gm)]
	.map(m => m[1].replaceAll('"', ''));

const sections = [
	{ script: 'StandartRandom', ru: 'общая', en: 'general', names: generalNames },
	...POOLS.map(p => ({
		script: `Standart${p.suffix}Random`,
		ru: `«${p.title}»`,
		en: p.flag,
		names: pools[p.suffix].map(m => m.script_filename),
	})),
];

const ruPlural = n => (n % 10 === 1 && n % 100 !== 11 ? 'карта'
	: [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100) ? 'карты' : 'карт');

const htmlList = s => {
	const n = s.names.length;
	const cnt = {
		ru: `(${n} ${ruPlural(n)})`,
		en: `(${n} ${n === 1 ? 'map' : 'maps'})`,
	};
	return lang => `<p>${s.script} — ${lang === 'ru' ? s.ru : s.en} ${cnt[lang]}:</p>\n<ul>\n`
		+ s.names.map(f => `<li>${displayName(f)}</li>`).join('\n')
		+ `\n</ul>`;
};

let poolLists = `<!-- Генерируется tools/generate-specialized.mjs (${today}); не править руками.
     Описания мода получают те же списки между маркерами AUTO:POOL_LISTS. -->\n`;
for (const s of sections) {
	poolLists += `\n## ${s.script} — ${s.ru} (${s.names.length} ${ruPlural(s.names.length)})\n\n`
		+ s.names.map(f => `- ${displayName(f)}`).join('\n') + '\n';
}
fs.writeFileSync(path.join(modDir, 'pool-lists.md'), poolLists);

for (const [lang, file] of [['ru', 'description.ru.md'], ['en', 'description.en.md']]) {
	const descPath = path.join(modDir, file);
	if (!fs.existsSync(descPath)) continue;
	const desc = fs.readFileSync(descPath, 'utf8');
	const start = `<!-- AUTO:POOL_LISTS ${lang.toUpperCase()}:START -->`;
	const end = `<!-- AUTO:POOL_LISTS ${lang.toUpperCase()}:END -->`;
	if (!desc.includes(start) || !desc.includes(end)) {
		console.log(`${file}: маркеров AUTO:POOL_LISTS нет — раздел «Состав» не обновлён`);
		continue;
	}
	const block = `<p><b>${lang === 'ru' ? 'Состав' : 'Included maps'}</b></p>\n\n`
		+ sections.map(s => htmlList(s)(lang)).join('\n\n');
	fs.writeFileSync(descPath,
		desc.slice(0, desc.indexOf(start) + start.length) + '\n' + block + '\n'
		+ desc.slice(desc.indexOf(end)));
	console.log(`${file}: раздел «${lang === 'ru' ? 'Состав' : 'Included maps'}» обновлён (${sections.length} списков)`);
}
