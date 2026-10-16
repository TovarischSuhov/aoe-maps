---
type: Runbook
title: Проверка карты
description: Как проверить .rms перед заявкой о готовности — навигация и диагностика через aoe2-lsp, прогон cmd/corpus на ноль диагностик, проверка в игре.
sources:
  - resource: CLAUDE.md
  - resource: docs/arabia-open.tz.md
  - resource: go run ./cmd/corpus (aoe-rms-lsp)
generated:
  by: claude-code/sonnet-4-6
  at: 2026-10-17T00:00:00Z
verified:
  - by: claude-code/sonnet-4-6
    at: 2026-10-16T20:30:00Z
---

# Проверка карты

Карта считается готовой, только если прошла LSP-гейт и проверена в игре. Прогон
делается **маленькими проверяемыми шагами** — после каждой правки, а не один раз
в конце.

## 1. LSP-гейт (диагностика)

Сервер `aoe2-lsp` живёт в отдельном репо
[`aoe-rms-lsp`](https://github.com/TovarischSuhov/aoe-rms-lsp). Прогон карт по
каталогу — утилитой `cmd/corpus`:

```sh
cd <путь>/aoe-rms-lsp
go run ./cmd/corpus -bin ./aoe2-lsp -dir <каталог-с-.rms>
```

- `-bin` — путь к собранному бинарнику сервера; `-dir` — каталог с `.rms`/`.xs`.
- Сводка: `N files: ok …, panic …, exit …, timeout …, transport …`.
- Утилита возвращает **ненулевой код при hard-failures** (panic/exit/timeout/
  transport) — это отказ парсера на реальном скрипте, а не просто диагностика.
- `-json` — машиночитаемый отчёт вместо сводки.

**Цель — ноль диагностик, кроме известных.** Известные (принимаются, не чиним):
ТЗ называет `effect_percent is deprecated` (легаси-команда; см.
`docs/ref/map-scripting-practices.md` в `aoe-rms-lsp` — `effect_percent` →
`effect_amount`). На текущей плоской основе (`maps/arabia-open.rms`) гейт даёт
ровно **146** диагностик, **все** одного кода `deprecated-effect-percent` —
все в развёрнутом `includes/constants.inc` (блоки выравнивания объектов).
Неизвестных диагностик — ноль.

**Ловушка `#include_drs`.** `cmd/corpus` сообщает только hard-failures; число
диагностик видно в `-json` (поле `Diagnostics` на файл). Но на картах, собранных
через `#include_drs` (в том числе на официальной Аравии v3.3), LSP **не
разворачивает include-замыкание** — содержимое `.inc` не анализируется. Такой
файл даёт `diagnostics=0` не потому, что чист, а потому что проверено пусто.
Вывод «ноль диагностик» на модульной карте ничего не доказывает: либо подавайте
LSP плоский (`self-contained`) файл, либо расширьте `aoe2-lsp`. Подробности и
воспроизведение — [фиксация странностей LSP](/runbooks/lsp-diagnostics.md) и
`docs/lsp-issues.md`.

Также доступна навигация по `.rms` через LSP-клиент: goToDefinition,
findReferences, hover, documentSymbol, workspaceSymbol (языковые конфигурации
едят `.rms`/`.xs` и `random_map.def`). Через `#include_drs` навигация не
проходит (переход на цель include пуст) — это то же ограничение замыкания, что
описано выше.

## 2. Проверка в игре

Автоматика не заменяет игру: открытость карты, симметрию и фактическое число
пачек смотрим в Scenario Editor или в партии против ИИ. Для проекта
`arabia-open` критерий — карта играется открыто и вынуждает агрессивный феодал.

## 3. Внешняя оценка

Готовый вариант оценивается на площадке rusaok (см.
[устройство проекта](/architecture/overview.md)).

## Если LSP ведёт себя странно

Не «замечаем и идём дальше» — фиксируем воспроизводимый пример по
[процедуре](/runbooks/lsp-diagnostics.md).
