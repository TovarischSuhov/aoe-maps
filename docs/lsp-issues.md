# LSP — наблюдения и баги

Сюда пишем воспроизводимые примеры, когда `aoe2-lsp` ведёт себя странно или не
отдаёт ожидаемое. Из этих записей заводим баг-репорты в Issues репо
[TovarischSuhov/aoe-rms-lsp](https://github.com/TovarischSuhov/aoe-rms-lsp/issues).

Правило: пример фиксируем в момент наблюдения, пока живой, — не «заметил и
пошёл дальше».

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

## Записи

## `#include_drs` не создаёт include-ребро — переход к цели не работает — 2026-10-16

- Файл: `refs/game/Arabia.rms` (официальная DE-Аравия) и минимальный
  `/tmp/probe_inc/via_drs.rms`.
- Позиция: `refs/game/Arabia.rms` — строка 1300, столбец 25 (1-based, на пути
  `includes/starting_resources.inc`); минимальный пример — строка 1, столбец 16
  (на пути `lib.inc`).
- Операция: goToDefinition.
- Запрос: переход к определению по аргументу-пути директивы `#include_drs`.
- Ожидалось: переход на файл по пути (как для `#include "lib.inc"`), т.е.
  непустой результат с `uri` цели.
- Получили: пустой результат (`[]`).
- Версия aoe2-lsp: `dev` (`aoe2-lsp --version` → `dev`).
- Лог: stdout LSP чистый (`-debug` не понадобился).
- Статус: заведён (2026-10-17, отправлен на доработку; связано с issue #98
  «#include_drs legacy directive → hint», backlog).

Минимальное воспроизведение (сравнение директив на одинаковом содержимом):

```
# lib.inc
#const FOO 40

# via_include.rms            | # via_drs.rms
#include "lib.inc"            | #include_drs lib.inc
<LAND_GENERATION>            | <LAND_GENERATION>
create_land                  | create_land
{                            | {
land_percent FOO             | land_percent FOO
}                            | }
</LAND_GENERATION>           | </LAND_GENERATION>
```

- `via_include.rms`, goToDefinition по `lib.inc` (1:11) → `file:///…/lib.inc` (ребро есть).
- `via_drs.rms`, goToDefinition по `lib.inc` (1:16) → `[]` (ребра нет).

Разбор по коду (`aoe-rms-lsp`): директиву понимает только лексер/парсер —
`#include_drs` уходит в `default` ветку обработчика директив и остаётся
оператором (`internal/rms/parse.go:589-591`); рёбра include создают лишь
`#include` и `#includeXS` (`parse.go:573-584`), а резолвер замыкания идёт
только по `Includes`+`XsIncludes` (`internal/include/resolver.go:128-130`,
`:353-355`). Это закреплено тестом `TestParse_IncludeDrs`
(`internal/rms/parse_test.go:277`): директива даёт `Statement`, а не `Include`.

Практическое следствие: официальная Аравия v3.3 построена **только** на
`#include_drs`, поэтому её include-замыкание для LSP пусто — навигация в
включённые `.inc` не работает, а корпусный прогон даёт `diagnostics=0`, не
анализируя содержимое include'ов. См.
[проверку карты](/knowledge/runbooks/verification.md) и
[модель ресурсов DE-Аравии](/knowledge/reference/de-arabia-resource-model.md).
