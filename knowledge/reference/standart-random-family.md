---
type: Reference
title: Семейство StandartRandom — пулы, классификация, регенерация
description: Как устроены шесть случайных карт мода StandartRandom (общая + пять тематических), правила классификации карт по флагам maps.json и как перегенерировать пулы после обновлений игры.
sources:
  - resource: "C:/Program Files (x86)/Steam/steamapps/common/AoE2DE/resources/_common/dat/maps.json"
  - resource: tools/generate-specialized.mjs
  - resource: maps/StandartOpenRandom.rms
generated:
  by: claude-code/glm-5.3
  at: 2026-11-18T15:47:00Z
verified:
  - by: claude-code/glm-5.3
    at: 2026-11-18
---

# Семейство StandartRandom — пулы, классификация, регенерация

## Состав мода

Один мод `StandartRandom` несёт шесть `.rms` (сборка —
`mod/StandartRandom/build.sh`): имя каждого файла = имя карты в лобби.

| Скрипт | Пул | Карт | Доли |
|---|---|---|---|
| StandartRandom | общая: 100 стандартных карт | 100 | по 1% |
| StandartOpenRandom | флаг `open` | 94 | 1–2% |
| StandartNomadRandom | флаг `nomad` | 14 | 7–8% |
| StandartCloseRandom | флаг `closed` | 12 | 8–9% |
| StandartWaterRandom | флаг `water` | 12 | 8–9% |
| StandartHybridRandom | флаг `mixed` | 40 | 2–3% |

## Пул и классификация

Источник истины — `resources/_common/dat/maps.json` из установки игры
(машина-зависимый путь, передаётся генератору аргументом).

- **Пул**: `style == "random"` и `random_map == true`.
- **Исключения**: `megarandom.rms2` (сам случайный выбор), `EM *` (7 карт —
  варианты quickplay/Empire Wars, `const` вида `qp-*`), `CtR Pyramid
  Descent` (режим Capture the Relic). Итого 126 карт.
- **Классификация**: карта попадает в **каждый** пул, чей флаг у неё есть —
  пересечения допустимы по решению владельца (Baltic = open+water играет в
  обеих подборках). Поэтому суммарно вхождений 172, а не 126.
- **Land-only карты** (нет ни одного флага в maps.json, 12 штук)
  раскладываются вручную по характеру геймплея — таблица `LAND_ONLY` в
  генераторе: открытые Mongolia, Yucatan, Oasis, Alpine_Lakes, Shrubland,
  Glade, hillfort; закрытые hideout, TeamMoats, RingFortress, Enclosed,
  fortified_clearing.
- В общую `StandartRandom` входят 100 «основных» карт по выбору владельца
  (исходный список 99 + Aquarena); 26 нишевых карт пула играют только в
  тематических подборках.
- Каждое имя обязано существовать в `resources/_common/drs/gamedata_x2/` —
  генератор проверяет это перед записью (иначе `#include_drs` не
  разрешился бы в игре).

## Регенерация после обновления игры

```sh
node tools/generate-specialized.mjs "<путь к maps.json>" maps/
```

Генератор делает больше, чем запись `.rms`:

- общий список имён читает из `maps/StandartRandom.rms` (единственный
  источник состава общей карты);
- пишет `mod/StandartRandom/pool-lists.md` — списки карт всех шести
  скриптов человеческими именами (переопределения имён — `NAME_OVERRIDES`
  в генераторе: исторические имена лобби вроде «Hill Fort», «Golden Pit»,
  «Scandinavia»);
- обновляет разделы «Состав»/«Included maps» в `description.ru.md`/
  `description.en.md` между маркерами `AUTO:POOL_LISTS RU|EN` — эти
  разделы руками не править, только через генератор.

После генерации: сумма процентов каждого файла = 100, прогон
LSP-гейта (`tools/lsp-check.mjs`), пересборка мода
(`mod/StandartRandom/build.sh`) и однострочных описаний (склейка `.md` в
`.oneline.html`, см. [публикацию](/runbooks/publishing.md)). Если в пуле
станет > 100 карт, генератор упадёт с ошибкой — потребуется двухуровневый
выбор (идиом MegaRandom,
см. [percent_chance](/reference/percent-chance-selection.md)).

## Проверено

- 18.11.2026: пул 126 карт (135 style=random минус megarandom, 7 EM, 1 CtR),
  все имена присутствуют в gamedata_x2; LSP-гейт — ноль диагностик на всех
  шести файлах; zip содержит 6 скриптов.
- В игре (генерация партии, соответствие подборки тегам) — **ещё не
  проверено человеком**.
