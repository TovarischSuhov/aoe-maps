---
type: Reference
title: percent_chance в start_random — эксклюзивный выбор, сумма ровно 100
description: Как работает выбор варианта через start_random/percent_chance в RMS DE, почему сумма должна быть ровно 100 и какие официальные скрипты это подтверждают.
sources:
  - resource: "C:/Program Files (x86)/Steam/steamapps/common/AoE2DE/resources/_common/drs/gamedata_x2/Arabia.rms"
  - resource: "C:/Program Files (x86)/Steam/steamapps/common/AoE2DE/resources/_common/drs/gamedata_x2/MegaRandom.rms2"
  - resource: maps/StandartRandom.rms
generated:
  by: claude-code/glm-5.3
  at: 2026-11-18T15:45:00Z
verified:
  - by: claude-code/glm-5.3
    at: 2026-11-18
---

# percent_chance в start_random — эксклюзивный выбор, сумма ровно 100

## Суть

`start_random`/`percent_chance N #define X` в DE — это **эксклюзивный
взвешенный выбор одной ветви**: строки делят 100% между собой, движок
гарантирует один `#define` на партию, если сумма равна ровно 100. При
сумме < 100 часть партий остаётся без define — если дальше стоит цепочка
`if/elseif` без `else`, карта не генерируется вовсе.

Проверено по официальным скриптам игры (каталог
`resources/_common/drs/gamedata_x2/`, чтение 18.11.2026):

- `Arabia.rms`, блок `RND_SPAWN_FOREST_*`: 5 × 20% = 100 — варианты
  взаимно исключают друг друга, каждый должен выпасть ровно один.
- `MegaRandom.rms2`: `MEGAPACK_A` 44% + `MEGAPACK_B` 56% = 100; внутри
  пачки A 20 × 5% = 100, внутри пачки B 25 × 4% = 100.
- Аналогичные блоки на сумму ровно 100 стоят во всех официальных
  скриптах с одиночным выбором (темы, размещение лесов и т.д.).

## Следствия

- **Баг суммы 99.** В `StandartRandom.rms` (v0.1.0) было 99 × 1% — в ~1%
  партий не выбиралась ни одна карта. Исправлено: добавлена 100-я карта
  (Aquarena), все ветви по 1%, сумма 100. Тот же принцип применён во всех
  специализированных картах.
- **«Предел 99 ветвей» — заблуждение** (было в старом комментарии
  `StandartRandom.rms`). Предел — сумма 100, а не число строк.
- **Вложенность легальна.** `start_random` внутри `if` работает — так
  делает сам `MegaRandom.rms2` (`if MEGAPACK_A → start_random …`). Тем
  не менее в картах семейства StandartRandom вложенность не используется:
  один плоский `start_random` + цепочка `if/elseif` проще для проверки.
- LSP не проверяет сумму: анализатор видит только диапазон одного
  `percent_chance 0..100`. Контроль суммы — на стороне генератора
  (`tools/generate-specialized.mjs`) и ручной проверки
  (`grep -o 'percent_chance [0-9]*' | awk '{s+=$2} END {print s}'`).

## Идиом для «случайная карта из списка»

```
start_random
	percent_chance 1 #define PICK_001
	…                              ; сумма ровно 100
end_random

if PICK_001
	#include_drs First.rms
elseif PICK_002
	#include_drs Second.rms
…
endif
```

Целые доли при n > 100 карт не разложатся — таких пулов в проекте нет
(максимум 94 карты в открытом пуле); остаток от деления размазывается
равномерно (см. `distribute()` в генераторе).
