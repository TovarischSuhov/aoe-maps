---
type: Runbook
title: Сборка и публикация карты модом
description: Как упаковать .rms в локальный мод AoE2 DE (info.json, thumbnail, resources), проверить его в игре и подготовить поля для публикации на портале.
sources:
  - resource: mod/StandartRandom/info.json
  - resource: mod/StandartRandom/build.sh
  - resource: https://www.ageofempires.com/mods/
generated:
  by: claude-code/sonnet-4-6
  at: 2026-11-15T13:27:43Z
status: draft
---

# Сборка и публикация карты модом

## Пакет мода

Минимальная структура, которую понимает игра (сверено с subscribed-модами
в профиле 15.11.2026):

```
StandartRandom/
├── info.json
├── thumbnail.jpg
└── resources/_common/random-map-scripts/StandartRandom.rms
```

`info.json` — плоский JSON с полями `Author`, `CacheStatus`, `Description`,
`Title`; `Description` — одна строка. Пример:

```json
{"Author":"TovarischSuhov","CacheStatus":0,"Description":"...","Title":"StandartRandom"}
```

В репозитории источник лежит в `mod/StandartRandom/`, сборка —
`mod/StandartRandom/build.sh`: она кладёт пакет в `dist/StandartRandom/` и
архив `dist/StandartRandom.zip`. `dist/` — генерируемый каталог, в git не
идёт.

## Правила архива

- Корень zip — сразу `resources/...`; обёрточная папка с именем мода внутри
  архива не нужна и ломает установку.
- Допустимы служебные файлы рядом с `resources/` (`info.json`,
  `thumbnail.jpg`, `README.txt`).
- Превью: JPEG 1280×720; на портале — до 5 изображений ≤ 8 МБ каждое,
  zip ≤ 500 МБ (требования портала, локально не перепроверены).

## Локальная проверка

```sh
mod/StandartRandom/build.sh
cp -r dist/StandartRandom \
  "$HOME/.steam/steam/steamapps/compatdata/813780/pfx/drive_c/users/steamuser/Games/Age of Empires 2 DE/76561198060636836/mods/local/"
```

Перезапустить игру, включить мод в меню Mods. Быстрая проверка без мода —
положить `.rms` прямо в
`.../76561198060636836/resources/_common/random-map-scripts/`; такой файл
виден в списке карт сразу.

## Публикация

Два пути, оба требуют аккаунта Microsoft/Xbox Live владельца — публикацию
выполняет человек, не агент:

1. **Из игры:** Mods → My Mods → Publish Mod.
2. **Через сайт:** ageofempires.com → MODS → Submit a Mod; поля — Title,
   Game, Category, Tags, Description, Changelog, Thumbnail, ZIP.

Описание на сайте принимает HTML (`<p>`, `<br>`, списки); литеральные
переводы строк лучше не использовать — для вставки держим однострочные
варианты `description.*.oneline.html`.

## Подводные камни

- Имя файла `.rms` — это имя карты в списке лобби; переименование меняет
  отображаемое название.
- В мультиплеере мод (или тот же `.rms`) нужен всем игрокам лобби.
- `CacheStatus` в `info.json` оставляем `0`; инкремент — забота игры.
- `mod-status.json` руками не правим: игру перезапускаем, она сама
  регистрирует локальный мод.
