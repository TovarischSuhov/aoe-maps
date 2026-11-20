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

## Диагностика пропускает `return` без скобок — игра такое отклоняет — 2026-11-18

- Файл: `maps/FrozenLake.xs`
- Позиция: строка 165 (`return 34.0;` в теле `if` функции `lakeAuraRadius`)
- Операция: diagnostics
- Запрос: пуш диагностик на файл с `return 34.0;` / `return cAuraRadius;`
  (значение без круглых скобок)
- Ожидалось: ошибка парсера — парсер игры требует `return (value);`
  (ugc-guide, programmer.md, «the return value must always be inside
  parantheses»); в игре файл даёт `XS: Error 0324: invalid expression…`,
  `0141: parseReturn failed`, `0047: could not parse the code for … function`
  и не грузится
- Получили: 0 диагностик — файл считается чистым
- Версия aoe2-lsp: `dev`
- Лог: не снимал (пассивный пропуск, не сбой сервера)
- Статус: заведён
  [TovarischSuhov/aoe-rms-lsp#195](https://github.com/TovarischSuhov/aoe-rms-lsp/issues/195)

Воспроизведение:

```xs
float f() {
    return 34.0;   // LSP: чисто; игра: Error 0324/0141, функция не парсится
}
float g() {
    return (34.0); // и LSP, и игра: ок
}
```

Замечание: вендорная библиотека в этом же файле последовательно использует
`return (true);`/`return (false);` — прогон игры 18.11.2026 был первым, где
расхождение проявилось. Правило для наших `.xs`: значение `return` — всегда
в скобках. LSP не ловит — гейт карт валиден только для RMS-части.

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

## `#includeXS` + `if` на верхнем уровне → ложная синтаксическая ошибка — 2026-11-20

- Файлы: `tmp-lsp/A_const_before_if.rms`, `tmp-lsp/B_no_include.rms`,
  `tmp-lsp/C_include_only.rms` (каталог удалён, содержимое ниже), реальный
  случай — первые строки `maps/SilentWoods.rms`.
- Позиция: строка с первым top-level `if` после `#includeXS` (столбец 1).
- Операция: диагностика (пуш после didOpen; прогон через `tools/lsp-check.mjs`).
- Ожидалось: top-level `if`/`elseif`/`#const` валидны в RMS (arabia-open.rms
  держит такую цепочку на верхнем уровне и чист по диагностикам).
- Получили: `[sev 1] syntax L3:1 unexpected identifier "if" at top level`,
  далее `"...else" without a matching opening block`. Если после `#includeXS`
  стоит хотя бы один `#const` до `if` — ошибка исчезает.
- Версия aoe2-lsp: локальная сборка `aoe2-lsp.exe` (2026-11).
- Лог: stdout LSP чистый.
- Статус: не заведён; обходим локально (правило ниже), при удобстве —
  заводить issue.

Минимальное воспроизведение:

```
# C_include_only.rms          | # A_const_before_if.rms
#includeXS SilentWoods.xs     | #includeXS SilentWoods.xs
                              |
if TINY_MAP                   | #const TEST_DUMMY 0
	#const SIZE_FACTOR 1      |
else                          | if TINY_MAP
	#const SIZE_FACTOR 2      | 	#const SIZE_FACTOR 1
endif                         | else
                              | 	#const SIZE_FACTOR 2
→ 2 syntax-ошибки             | endif
                              |
                              | → 0 ошибок (кроме missing-include
                              |   при отсутствии .xs рядом)
```

Правило для наших карт: цепочки `if` с `#const` держать внутри секций
(например, `<PLAYER_SETUP>`), а не на верхнем уровне после `#includeXS`.

## `vector()` принимает только литеральные float — LSP пропускает, игра падает — 2026-11-20

- Файл: `maps/SilentWoods.xs` (функция `SpawnWolves`, строка 39 в версии с
  ошибкой); тот же паттерн остаётся в `maps/ProbeMap.xs:174` (проба P6 упадёт
  так же — при прогоне ProbeMap исправить).
- Позиция: вызов `xsCreateUnit(..., vector(p.x + 1.0 + j * 0.4, ...), ...)`.
- Операция: диагностика LSP (0 ошибок) vs парсер игры.
- Ожидалось: `vector(expr, expr, expr)` — сборка вектора из выражений.
- Получили: каскад в игре — `XS: Error 0340: 'p' is not a const float
  variable`, `0180: expected float x value and found 'p'`, `0160:
  parseVectorConstant failed`, далее parseWhile/parseCode — функция
  `SpawnWolves` не разобрана («could not parse the code for 'SpawnWolves'
  function»), правило с её вызовом не работает.
- Причина (подтверждена ugc-guide, beginner.md «vector initialisation»):
  конструктор `vector(...)` в парсере игры принимает **только литеральные
  float-константы**; переменные и выражения нельзя.
- Обход: динамические векторы собирать через `vector xsVectorSet(float x,
  float y, float z)` (functions.md §2.7), компоненты читать через
  `xsVectorGetX/Y/Z`.
- Версия aoe2-lsp: локальная сборка `aoe2-lsp.exe` (2026-11).
- Статус: не заведён; правило для наших `.xs` — «вектор из переменных только
  через xsVectorSet». При удобстве — заводить issue (LSP мог бы ругаться на
  не-литералы внутри `vector()`).
