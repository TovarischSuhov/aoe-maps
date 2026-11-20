---
type: Reference
title: Размеры карт DE (в тайлах) и условные RMS
description: Таблица размеров AoE2 DE в тайлах по условным TINY_MAP..LUDIKRIS_MAP, как проверять фиксированную геометрию по side/2, кейс FrozenLake.
status: draft
sources:
  - resource: "AoE2 Series Wiki — Random map, раздел Sizes (https://ageofempires.fandom.com/wiki/Random_map)"
  - resource: "/maps/FrozenLake.rms — блок create_actor_area (X=Y=side/2 по веткам размеров)"
  - resource: "aoe-rms-lsp internal/kb/data/rms-commands.json — «Unscaled value refers to a 100x100 map»"
generated:
  by: claude-code/glm-5.3-flash
  at: 2026-11-18T00:00:00Z
verified:
  - by: claude-code/glm-5.3-flash
    at: 2026-11-18T00:00:00Z
    basis: два независимых источника сходятся (вики-таблица и координаты актор-зон FrozenLake = side/2 каждой ветки)
---

# Размеры карт DE (в тайлах)

| RMS-условное | Сторона (тайлы) | side/2 |
|---|---|---|
| `TINY_MAP` | 120 | 60 |
| `SMALL_MAP` | 144 | 72 |
| `MEDIUM_MAP` | 168 | 84 |
| `LARGE_MAP` | 200 | 100 |
| `HUGE_MAP` | 220 | 110 |
| `GIGANTIC_MAP` | 240 | 120 |
| `LUDIKRIS_MAP` | 480 | 240 |

Имена RMS-условных — легаси-АоК; в вики (DE) те же размеры называются иначе
(Tiny 120, Small 144, Medium 168, Normal 200, Large 220, Huge 240, Ludicrous
480) — сопоставлять по размерности, не по имени. Вики перечисляет и
промежуточные размеры (Miniature 80, Giant 252 … Monstrous 400) — те доступны
только с launch-параметром `MORE_MAP_SIZES`, RMS-условных под них нет.

## Как использовать

- Любая фиксированная в тайлах геометрия (озеро, центральный объект) должна
  проверяться неравенством: `внешний_радиус + other_zone_avoidance_distance +
  base_size игрока ≤ side/2`, иначе базы прижимаются к краю и режутся.
- `land_percent` в `create_player_lands` — суммарный на всех игроков: при 2
  игроках каждый получает половину, blobs вырастают — это норма, не баг.
- Кейс FrozenLake (обновлено 2026-11-18, версия 0.1.1, проверено в игре на
  Tiny/Medium/Huge): геометрия озера **масштабируется по стороне карты** —
  кольцо ≈ 23 + 0.105×S (Tiny 30 hand-tuned, Small 38, Medium 42, Large 45,
  Huge 48, Gigantic 50, Ludikris 74), внутренние зоны фиксированной ширины
  (12/5/5), XS-аура следует за кольцом через `xsGetMapWidth()`. Радиусы
  игрока (`circle_radius`) тоже по размерам — иначе блобы 1v1
  (land_percent делится на игроков) лезут на кольцо. Ранний вариант
  «фиксированное озеро, компактный Tiny» был заменён: фиксированный радиус
  48 на Ludikris выглядел теряющимся.
- Альтернатива масштабированию — `override_map_size` (RMS, section
  player_setup): принудительно задаёт сторону карты независимо от лобби, так
  делают официальные водные карты. Не выбран для FrozenLake осознанно (выбрано
  масштабирование).
