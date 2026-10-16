---
type: Runbook
title: Фиксация странностей LSP
description: Что делать, когда aoe2-lsp ведёт себя не так, как должен — зафиксировать воспроизводимый пример в docs/lsp-issues.md в момент наблюдения и завести баг-репорт.
sources:
  - resource: CLAUDE.md
  - resource: docs/lsp-issues.md
generated:
  by: claude-code/sonnet-4-6
  at: 2026-10-16T20:30:00Z
verified:
  - by: claude-code/sonnet-4-6
    at: 2026-10-16T20:30:00Z
---

# Фиксация странностей LSP

Если `aoe2-lsp` не отдаёт ожидаемое — пустой goToDefinition/references, нет
hover, неверная диагностика, ошибка на валидном файле — **сразу пишем
воспроизводимый пример** в `docs/lsp-issues.md`. Правило: пример фиксируем в
момент наблюдения, пока живой; не «заметил и пошёл дальше».

## Куда

`docs/lsp-issues.md` — журнал наблюдений. Из этих записей заводятся баг-репорты
в Issues репо
[`TovarischSuhov/aoe-rms-lsp`](https://github.com/TovarischSuhov/aoe-rms-lsp/issues)
(там трекер).

## Формат записи

```
## <кратко: что не так> — ГГГГ-ММ-ДД

- Файл: maps/….rms
- Позиция: строка:столбец (1-based, как в редакторе)
- Операция: goToDefinition | findReferences | hover | documentSymbol | workspaceSymbol | diagnostics
- Запрос: что именно запросили
- Ожидалось: …
- Получили: …
- Версия aoe2-lsp: `aoe2-lsp --version`
- Лог: фрагмент stderr от `aoe2-lsp -debug`
- Статус: не заведён | заведён <ссылка на issue> | исправлен
```

## Минимум для воспроизводимости

- точный **файл** и **позиция** (строка:столбец);
- **операция** LSP и **запрос**;
- **ожидалось / получили**;
- **версия** сервера и, по возможности, **stderr** с `aoe2-lsp -debug`.

Без версии и stderr баг часто не воспроизводится на стороне сервера — это первое,
что спросят при разборе.
