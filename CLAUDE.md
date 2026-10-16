# aoe-maps

Random Map Scripts (RMS) для Age of Empires II: DE. Автор — Илья Сухов
(TovarischSuhov). Репо **открытый**.

Первый проект — **«открытая Аравия»** (`arabia-open`): переработка еды, золота
и камня стандартной Аравии так, чтобы карта игралась открыто и вынуждала
агрессивный феодал. Кандидат на площадку rusaok.

## Структура

```
maps/    .rms — сами карты (первый: arabia-open.rms)
docs/    ТЗ и разборы; требования — docs/arabia-open.tz.md
refs/    референсные карты и выписки
```

## Язык и инструменты

- Карты пишутся на **RMS**; `random_map.def` подключается автоматически.
- **Навигация по RMS** — LSP-сервер `aoe2-lsp` (репо
  [aoe-rms-lsp](https://github.com/TovarischSuhov/aoe-rms-lsp)), подключён к
  Claude Code плагином `aoe2-lsp@aoe2-local` (project scope, см.
  `.claude/settings.json`): goToDefinition, findReferences, hover,
  documentSymbol, workspaceSymbol по `.rms`/`.xs`.
- **Проверка скрипта** — прогон через LSP-раннер
  `aoe2-lsp/cmd/corpus` (`go run ./cmd/corpus -bin aoe2-lsp -dir <dir>`) или
  через stdio-клиент; цель — ноль диагностик, кроме известных.
- Список команд/объектов RMS — `aoe-rms-lsp/internal/kb/data/rms-commands.json`
  и `aoe-rms-lsp/docs/ref/` (zetnus-rms-guide, aoe2de-xs-rms-changelog).

## Референсы Аравии

- DE-стандарт: раздел «Standard Units and Resources» в
  `aoe-rms-lsp/docs/ref/zetnus-rms-guide.txt` (генерируется `GeneratingObjects.inc`).
- Корпусная FE-аравия: `aoe-rms-lsp/.corpus/007__Arabia.rms` (778 строк, чистая
  по диагностике) — рабочая база для правок.
- Турнирные варианты: `034__T90CG_BoA_Arabia.rms`, `067__ComGames_Arabia.rms`.

## Конвенции

- Все требования и открытые вопросы — в `docs/`, не в переписке.
- Правки RMS — маленькими проверяемыми шагами; каждый шаг — прогон через LSP.
- Репо открытый: секретов нет, приватную переписку и чужие данные в файлы не
  тащим (требования излагаем своими словами).

## Оговорки

- `.claude/settings.json` (project scope) только включает плагин по имени. Сам
  маркетплейс `aoe2-local` зарегистрирован в user-scope на этой машине и
  указывает на локальный путь `aoe-rms-lsp/editors/claude-code` —
  машинозависимо: на другой машине маркетплейс нужно зарегистрировать заново
  (`claude plugin marketplace add <путь>/aoe-rms-lsp/editors/claude-code`).
