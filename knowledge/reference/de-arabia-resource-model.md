---
type: Reference
title: Модель ресурсов DE-Аравии
description: Как официальная Arabia.rms (v3.3) расставляет еду, золото, камень и живность — константы по наборам, масштабирование по размеру карты, actor_area-зоны, remote_resources, theme-зависимая живность.
sources:
  - resource: refs/game/Arabia.rms
  - resource: refs/game/includes/starting_resources.inc
  - resource: refs/game/includes/remote_resources.inc
  - resource: refs/game/includes/herdable_starting.inc
  - resource: refs/game/includes/huntable.inc
  - resource: refs/game/includes/lureable.inc
  - resource: refs/game/includes/object_groups.inc
  - resource: refs/game/includes/themes.inc
generated:
  by: claude-code/sonnet-4-6
  at: 2026-10-17T00:00:00Z
verified:
  - by: claude-code/sonnet-4-6
    at: 2026-10-16T20:30:00Z
---

# Модель ресурсов DE-Аравии

Официальная карта `Arabia.rms` из AoE2:DE (заголовок файла: «Arabia by
Forgotten Empires», **Version 3.3**) — модульная. Сама карта задаёт террейн и
расставляет `#define`-переключатели, а размещение еды, золота, камня и живности
вынесено в общие include'ы `includes/*.inc`. Это и есть «DE-стандарт», на
который следует опираться проекту.

**Основание.** Локальная копия в `refs/game/` (не коммитится — копирайт Forgotten
Empires/Microsoft). Источник: `resources/_common/drs/gamedata_x2/` в установке
Steam (`steamapps/common/AoE2DE`) — файлы `Arabia.rms` и каталог `includes/`.
Канонический способ получить копию — `scripts/corpus-official.sh` из
`aoe-rms-lsp` (стейджит официальные `.rms`/`.inc`/`.xs` в gitignored
`.corpus-official/`, сохраняя раскладку). Замечание: `refs/game/` — снимок
конкретной установки; при обновлении игры его надо переизвлечь, иначе числа
разойдутся с актуальной Аравией.

**Инструментальная оговорка.** Карта собрана на `#include_drs`, а LSP не
разворачивает это замыкание: навигация в `includes/*.inc` из `Arabia.rms` не
работает, и корпусный прогон даёт `diagnostics=0`, не анализируя include'ы
(подробности — `docs/lsp-issues.md`). Поэтому «0 диагностик» на этом файле —
не признак чистоты. Разбор ниже — по исходникам include'ов напрямую.

## Как карта включает ресурсы

Перед генерацией объектов `Arabia.rms` (блок `<OBJECTS_GENERATION>`, ~строка
1261) выставляет `#define`-переключатели наборов: `FORAGE_BUSH_PRIMARY`,
`GOLD_PRIMARY`/`GOLD_SECONDARY`/`GOLD_TERTIARY`, `STONE_PRIMARY`/`STONE_SECONDARY`,
`GOLD_ADDITIONAL`, `STONE_ADDITIONAL`. Затем подключает

```
includes/starting_resources.inc    /* стартовые еда/золото/камень */
includes/herdable_starting.inc     /* стартовые стадные */
includes/huntable.inc              /* олени / куры */
includes/lureable.inc              /* кабаны и родня */
includes/remote_resources.inc      /* рассыпанные по карте (только SPACIOUS_SETUP) */
```

Числа живут не в карте, а в `#const` внутри include'ов; отдельные значения
масштабируются по размеру карты через `includes/scaling.inc`
(`#const MAPSCALE_MODIFIER 1` подключается в шапке `Arabia.rms`).

Общие атрибуты стартовых наборов: `set_place_for_every_player`,
`set_gaia_object_only`, `set_tight_grouping`, `group_placement_radius`,
`min_distance_to_players <DISTANCE>`, `enable_tile_shuffling`. При `WALL_ENABLE`
задаётся ещё `max_distance_to_players`; иначе — `find_closest`,
`set_circular_placement`, `require_path`.

## Числа по умолчанию (`starting_resources.inc`)

| Набор (`#const *_SIZE`) | Объектов | radius | distance (`min_distance_to_players`) |
|---|---|---|---|
| Forage primary | 6 | 1 | 12 |
| Gold primary | 7 | 1 | 12 |
| Gold secondary | 4 | 1 | 22 |
| Gold tertiary | 4 | 1 | 28 |
| Stone primary | 5 | 1 | 16 |
| Stone secondary | 4 | 1 | 22 |
| Stone tertiary | 4 | 1 | 28 |
| Forage additional | 6 (1 группа) | 1 | 46, spacing 20 |
| Gold additional | 3 (1 группа) | 1 | 46, spacing 20 |
| Stone additional | 3 (1 группа) | 1 | 46, spacing 20 |

Значения `_SIZE`/`_RADIUS`/`_DISTANCE` — это отдельные `#const` (например
`GOLD_PRIMARY_SIZE 7`, `GOLD_PRIMARY_RADIUS 1`, `GOLD_PRIMARY_DISTANCE 12`);
рядом есть `*_ZONE_DISTANCE 4`, `*_FOREST_DISTANCE 2`, `*_CLIFF_DISTANCE 2`,
`*_EDGE_DISTANCE 4` — отступы от чужих зон, леса, обрывов и края карты.

**`actor_area`-зоны.** У каждого набора свой номер зоны (`actor_area 200`
Primary Gold, 210 Secondary, 220 Tertiary; аналогично 100/110/120 для ягод,
300-е для камня, 10 — ТЦ, 20 — виллы, 30 — скаут). Это резервированные
области: последующие объекты расставляются с `avoid_actor_area <N>`, поэтому
набор ресурсов не наезжает на ТЦ, виллов и друг на друга.

## Живность — theme-зависимая

Аравия выбирает **биом** (`BIOME_TEMPERATE`/`DESERT`/`TROPICAL`/`TAIGA`/
`TUNDRA` в `includes/themes.inc`), а объекты живности зависят от биома. Поэтому
«классических 4 овец и 2 кабанов» в текущей Аравии может и не быть — вместо
овец стадными ставят гуся/индейку/свинью/корову/капибару.

- **Стартовые стадные** (`herdable_starting.inc`): `HERDABLE_STARTING_COUNT_FOUR`
  задаёт 4 головы, `HERDABLE_STARTING_DISTANCE 8`. Объект — группа `HERDABLE_A`
  (`object_groups.inc`): `COW*` или `LLAMA*`, а `themes.inc` переопределяет на
  `Sheep` (594), `Pig` (1245), `Goose` (1243), `Turkey` (833), `Capybara` (2590)
  по биому.
- **Мелкая дичь** — выбор 50/50 между `GAME_HUNTABLE` и `GAME_CHICKEN`
  (`Arabia.rms` ~1310-1365):
  - `GAME_HUNTABLE`: группа `HUNTABLE_A`, 2–4 головы @20–28, плюс доп. группа
    2–4 @36–40;
  - `GAME_CHICKEN`: `HUNTABLE_SMALL_A`, 6–8 голов (1 группа) @18, плюс доп.
    6–8 @36–40.
  Объекты (`object_groups.inc`): `HUNTABLE_A` — олень (`Deer` 65), `Guanaco`,
  `Rhea`, `Seal`; `HUNTABLE_SMALL_A` — `WILD_CHICKEN_BROWN/WHITE/BLACK` или
  `HARE_BROWN/GREY`.
- **Приманиваемая дичь (кабаны)** (`lureable.inc`): `LUREABLE_COUNT 1`,
  `LUREABLE_GROUPS 2`, distance 18, spacing 16. Объект — `LUREABLE_A`:
  `Wild Boar` (48) в пустынном/умеренном биоме, иначе `Elk` (2737),
  `Walrus` (1924).

Отсюда ответ на открытый вопрос ТЗ «курица — какой объект RMS»: у охотничьей
мелкой дичи это `WILD_CHICKEN_BROWN/WHITE/BLACK`; `CHICKEN_BROWN/WHITE/BLACK` —
это *стадная* группа `HERDABLE_SMALL_A` (домашние куры, другой класс).

## Рассыпанные ресурсы (`remote_resources.inc`)

Подключается **только при `if SPACIOUS_SETUP`** (`Arabia.rms` ~1396). Задаёт
ресурсы, рассыпанные далеко от игроков (`#const REMOTE_DISTANCE 100`,
`REMOTE_SPACING 48`, `min_distance_to_map_edge 6`, `set_circular_placement`):

| Объект | Объектов в группе | Групп | actor_area |
|---|---|---|---|
| GOLD | 4 | 1024 | 1910 |
| STONE | 4 | 1024 | 1920 |
| FORAGE_BUSH (+`second_object PLANT_DEAD`) | 6 | 1024 | 1930 |
| HUNTABLE_B | 3 | 1024 | 1940 |

`number_of_groups 1024` — практический максимум: движок размещает столько
групп, сколько влезает. Это готовый механизм «рассыпания» ресурсов по карте,
релевантный цели проекта, — но включается он лишь в конфигурации
`SPACIOUS_SETUP`, а не на дефолтной Аравии.

## Плоская сборка (`maps/arabia-open.rms`)

Рабочая карта проекта — плоская: `#include_drs`-замыкание официальной карты
разворачивается скриптом на месте, и файл становится самодостаточным (LSP
видит его целиком). Правила развёртывания:

- Обход рекурсивный; уже развёрнутый файл при повторе отбрасывается с пометкой
  `/* dropped duplicate #include_drs … */` (так отброшен `includes/town_herdable.inc`).
- Отсутствующий на диске include обезвреживается пометкой
  `/* dropped missing #include_drs … */`, а не остаётся директивой.
- Инлайнены 47 уникальных `.inc`.

**Висячая ссылка.** `Arabia.rms:1279` (v3.3) подключает
`includes/defend_wonder.inc`, которого **нет** ни в `includes/` (54 файла), ни
где-либо ещё в установке. Движок такую ссылку молча игнорирует; в плоской
сборке она сохраняется как `dropped missing`. Это единственный такой include в
карте.

Сборка сделана скриптом-флаттенером (в репозиторий не кладётся); при обновлении
игры основу надо пересобрать из свежего `refs/game/`.

## Что это значит для проекта

- Целевые объекты проекта (еда/золото/камень) задаются константами, а не
  литералами в карте: правка — это изменение `#const` в соответствующем
  include или собственных include'ах поверх стандартных.
- «Рассыпать пачки» — это паттерн `number_of_groups` +
  `set_circular_placement` + `temp_min_distance_group_placement`
  (см. `remote_resources.inc`), а не отдельные `create_object` на каждую пачку.
- Стартовая живность не фиксирована (биом), поэтому требование «4 овцы + 2
  кабана» надо формулировать через группы `HERDABLE_*`/`LUREABLE_*`, а не через
  конкретные объекты `SHEEP`/`BOAR`.
