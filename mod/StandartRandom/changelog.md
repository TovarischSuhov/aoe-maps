# StandartRandom — Changelog

Готовые записи для поля Changelog на ageofempires.com (и для In-game
Publish Mod). Формат поля — как у описания: принимает HTML, переносы через
`<p>`/`<br>`. Английская запись — основная (портал англоязычный), русская —
для дублей на русскоязычных площадках.

---

## 0.2.0 — 2026-11-18

**EN — вставить в поле Changelog:**

```html
<p>0.2.0 — now a set of six random map scripts:</p>
<ul>
<li>Added themed randoms: StandartOpenRandom (94 open maps), StandartNomadRandom (14 nomad), StandartCloseRandom (12 closed), StandartWaterRandom (12 water) and StandartHybridRandom (40 hybrid).</li>
<li>Themed randoms use the full standard pool (126 maps) tagged by the game's own maps.json flags; a map with several tags joins several themed randoms.</li>
<li>StandartRandom now picks among 100 standard maps: Aquarena added.</li>
<li>Fixed the percentage total: it used to be 99%, which left roughly 1% of games without any map. Every script now totals exactly 100%.</li>
</ul>
```

Однострочный вариант (если поле не принимает списки):

```html
<p>0.2.0 — set of six random map scripts: added themed randoms StandartOpenRandom (open), StandartNomadRandom (nomad), StandartCloseRandom (closed), StandartWaterRandom (water) and StandartHybridRandom (hybrid) built from the game's official map tags; Aquarena joined StandartRandom (100 standard maps, 1% each); fixed the percentage total — it was 99%, leaving ~1% of games without a map.</p>
```

**RU — для русскоязычных площадок:**

```html
<p>0.2.0 — теперь набор из шести случайных карт:</p>
<ul>
<li>Добавлены тематические подборки: StandartOpenRandom (94 открытых карты), StandartNomadRandom (14 номадских), StandartCloseRandom (12 закрытых), StandartWaterRandom (12 водных) и StandartHybridRandom (40 гибридных).</li>
<li>Подборки используют весь стандартный пул (126 карт) с официальными тегами maps.json; карта с несколькими тегами попадает в несколько подборок.</li>
<li>В общую StandartRandom добавлена Aquarena — теперь 100 стандартных карт по 1%.</li>
<li>Исправлена сумма процентов: раньше было 99%, из-за чего в ~1% партий не выбиралась ни одна карта. Теперь в каждом скрипте сумма ровно 100%.</li>
</ul>
```

---

## 0.1.0 — 2026-11-15

**EN:**

```html
<p>0.1.0 — first release: one random map script that picks among 99 standard Age of Empires II: DE maps, 1% each. Maps are referenced from the game install via #include_drs, so they always match the current patch.</p>
```

**RU:**

```html
<p>0.1.0 — первый релиз: один скрипт-случайная из 99 стандартных карт Age of Empires II: DE, у каждой 1%. Карты подключаются из установки игры через #include_drs и всегда соответствуют текущему патчу.</p>
```
