---
type: Reference
title: Динамические карты — рантайм-факты XS/RMS (SilentWoods)
description: Проверенные в игре факты SilentWoods (2026-11-20/21) — единицы rule-интервалов, Map lighting, перечисление юнитов, классы и типы, xsCreateUnit и ID волков, ловушки парсера; что переиспользовать следующей динамической карте.
sources:
  - resource: "/maps/SilentWoods.rms + /maps/SilentWoods.xs — рабочая реализация (спавн по типу 80, mood-цикл, гейтинг P_C*)"
  - resource: "/docs/silentwoods-review.md — полная сводка находок и открытых вопросов"
  - resource: "aoe-rms-lsp docs/ref/ugc-guide/xs/prelude.xs — классы 9xx, cUnit*-properties, cColorMood*"
  - resource: "aoe-rms-lsp docs/ref/aoe2de-xs-rms-changelog.md — U169123/U177723/U185872 сигнатуры"
generated:
  by: claude-code/glm-5.3-flash
  at: 2026-11-21T00:00:00Z
verified:
  - by: human:TovarischSuhov
    at: 2026-11-21T00:00:00Z
    basis: серии прогонов SilentWoods в игре 2026-11-20/21 (диагностика чатом, визуальные проверки)
---

# Динамические карты — рантайм-факты

Факты проверены прогонами SilentWoods в игре (не LSP!). Часть ловушек LSP
не видит — они же заведены в `docs/lsp-issues.md`.

## Циклы и настроение

- `rule minInterval` меряется **секундами** (проверено: 20 → ~20-секундные
  фазы). Фаза 300 с = 5 минут.
- `xsSetColorMood(mood, interval)` рендерится **только при включённой
  настройке графики «Коррекция цвета» (Map lighting)** — без неё mood не
  виден; в описании мода это требование прописано.
- Рабочая ночь: `cColorMoodNight` (5); `cColorMoodDarkness` (18) не
  проверен отдельно. `xsSetColorMood` — чистый UI, sync по построению.
- RMS `color_correction <SeasonType>` (сезоны = те же id 0–18) — статика;
  XS-настроение её перекрывает.

## Перечисление юнитов и якоря

- `xsGetPlayerUnitIds(playerId, objectOrClassId, arrayId)` — порядок
  аргументов по ugc-guide (чаглог-строка 284 перепутала их местами).
  Третий аргумент — **переиспользование существующего массива**: передавать
  `-1` (авто-создание); голый несуществующий id даёт пустой результат.
- **Tree-class объекты не перечисляются** (деревья, скалы) — «гaiaAll»
  их не содержит; фильтр по их object id возвращает `-1`.
- Надёжный якорь динамического спавна — **гаia-здание** (палатка 1200,
  вышка): dat-тип **80 (Building)** — единственные гаia-здания на карте.
  Скан: перечислить всех, отобрать `xsGetUnitType(uid) == 80`.
- `xsGetUnitType` возвращает **dat-категорию**, не object id (10 EyeCandy,
  30 Moving, 80 Building); класс — `xsGetUnitClass` (907 кусты, 908 камень,
  909 кабаны, 910 хищники, 911 прочее, 929 овцы, 932 золото, 942 реликвии).
- `xsGetPlayerUnitIds` с фильтром по классу (objectOrClassId=9xx) не
  проверен — проверен только общий список + ручной разбор.
- PLACEHOLDER-подложки (1902/1543): рендерятся фигуркой «крестьянина»,
  сбиваются в кластеры от `find_closest`, для мёртвых `land_id` дают
  случайные точки на карте. Блоки под них гейтить теми же флагами, что и
  земли, либо не использовать.

## Спавн юнитов

- `xsCreateUnit(objectId, playerId, vector, foundation, sound, collision)`
  → int unitId. **Arctic Wolf = 1965** (белый волк); классический
  `WOLF`/124 даёт поселяноподобный юнит. `checkCollision=false` для
  спавна пачкой.
- Спавн в гаию (playerId=0) работает; заспавненные волки наследуют
  `GAIA_SET_ATTRIBUTE ARCTIC_WOLF ATTR_LINE_OF_SIGHT` (правка дефиниции
  юнита действует и на будущие инстансы).
- Векторы: `vector(a, b, c)` — **только литеральные float**; из переменных
  — `xsVectorSet(x, y, z)` / `xsVectorGetX|Y|Z`.

## Ловушки игрового парсера XS (LSP их не видит)

- Переменные **function-scoped**: повторное `int x` в другом цикле —
  ошибка 0014; все объявления поднимать наверх функции.
- `else if`, не `elseif` (это RMS-синтаксис).
- `return` только в скобках (см. `docs/lsp-issues.md`).
- `xsSetUnitProperty(unitId, property, value, typeOrForce)` / 
  `xsGetUnitProperty(unitId, property, typeOrPlayer)` (U185872):
  `cUnitVisibility=12` применяется (читается назад), но на рендер здания
  не влияет (значения 0 и 2). `cUnitSelectable=10`/`cUnitTargetable=8` —
  не проверены на рендер-эффект.

## RMS-идиомы динамических карт

- Гейтинг количества по игрокам: кумулятивные `#define`-флаги от
  `_PLAYER_GAME` (сравнений в условиях нет). Все зависимые блоки (земли,
  объекты, маркеры) гейтить **теми же флагами** — блоки с мёртвым
  `land_id` расползаются по карте.
- `zone N` + `land_id N` в паре: без зоны `other_zone_avoidance_distance`
  между землями не работает (холмы сливаются).
- Уникальный террейн как привязь: пачки/маркеры держатся на холмах через
  `terrain_to_place_on DIRT`, если DIRT на карте больше нигде нет.
- `second_object` ставит объект **поверх** основного (не чередует).
- `actor_area`/`actor_area_to_place_in`: пара «резервирующий →
  размещённый» работает для юнитов и зданий; scenery-приёмник не работает.
- Tree-class scenery при `set_place_for_every_player` требует
  `ignore_terrain_restrictions` — иначе молчу не ставится.
- Стандартные константы: `PLACEHOLDER_GENERIC = 1902` (arabia-open),
  `SHEEP`/`FORAGE`/`WOLF`/`FOREST`/`ROCK_MOSSY`/`ARCTIC_WOLF` — валидны.
