# DynamicRMS — Changelog

Формат как у StandartRandom: EN основная запись для портала, RU дубль.
Версия 0.1.0 — опубликована 18.11.2026;
[modId 593764](https://www.ageofempires.com/mods/details/593764/).
Версия 0.1.1 — опубликована 18.11.2026 (портал v1.4).

## 0.2.0

### EN

- New map: SilentWoods — an open temperate-woods map with hilltop starts
  and a day/night cycle (5-minute phases, announced by on-screen notices).
- The map's neutral gold and stone live on cave hills: two gold caves and
  one stone cave per player, plus a personal cave by the distant gold
  mine. Every nightfall a pack of six sharp-sighted Arctic wolves leaves
  each cave; wolves hunt on their own, do not vanish at dawn, and the
  packs accumulate night over night.
- Day/night effects require the "Map lighting" graphics setting
  (Options → Graphics).
- FrozenLake: removed the Explosive King gimmick (Regicide games now play
  without the detonation; kings and houses still spawn).

### RU

- Новая карта: SilentWoods — открытый умеренный лес с холмистыми стартами
  и циклом дня и ночи (фазы по 5 минут, уведомления на экране).
- Нейтральное золото и камень живут на пещерных холмах: две золотые и
  одна каменная пещера на игрока, плюс личная пещера у дальнего золота.
  Каждую ночь из пещер выходит стая из шести острозрящих арктических
  волков; волки охотятся сами, с рассветом не исчезают, стаи копятся.
- Дневным/ночным эффектам нужна настройка графики «Коррекция цвета»
  (Map lighting).
- FrozenLake: убран «Взрывной король» (Regicide играется без детонации;
  король и дом остаются).

### Однострочник (если поле Changelog не принимает списки)

- 0.2.0: new map SilentWoods (day/night cycle, cave hills hold the neutral gold/stone, wolf packs accumulate); FrozenLake Explosive King removed.

## 0.1.0

### EN

- Initial draft: FrozenLake, a circular frozen lake with a periodic frost
  aura (announced by on-screen notices), invulnerable lake fauna, and an
  Explosive King gimmick in Regicide games (off in standard Random Map).
- The lake is drawn compact on Tiny so two players fit comfortably.
- FrozenLake ships with a map icon; the mod has a 1280x720 preview.

### RU

- Черновик первой версии: FrozenLake — круглое замёрзшее озеро с
  периодическими морозными ветрами (каждая смена погоды — уведомление на
  экране), неубиваемой озёрной фауной и режимом «взрывного короля» в
  Regicide (в обычном Random Map отключён).
- На Tiny озеро рисуется компактно, чтобы вдвоём было комфортно.
- FrozenLake идёт с иконкой карты; у мода есть превью 1280x720.

### Однострочник (если поле Changelog не принимает списки)

- 0.1.0: FrozenLake added — a frozen lake with periodic frost winds, announced; Explosive King in Regicide; compact lake on Tiny.

## 0.1.1

### EN

- Fixed XS script loading: the game resolves #includeXS only from
  resources/_common/xs/, the package now ships FrozenLake.xs there.
- XS syntax fixes for the game parser: parenthesized return values,
  default values for all function parameters.
- The lake now scales with the map size; the frost aura covers exactly the
  lake zone and never reaches player home areas.

### RU

- Исправлена загрузка XS-скрипта: игра ищет #includeXS только в
  resources/_common/xs/ — пакет теперь кладёт FrozenLake.xs туда.
- Синтаксис XS приведён к требованиям парсера игры: return в скобках,
  значения по умолчанию у всех параметров.
- Озеро масштабируется вместе с картой; аура мороза накрывает ровно зону
  озера и никогда не достаёт до домашних зон игроков.

### Однострочник

- 0.1.1: fixed XS loading (resources/_common/xs/) and XS syntax; the lake scales with map size, aura covers exactly the lake zone.
