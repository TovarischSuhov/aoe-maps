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
архив `dist/StandartRandom.zip`. В пакет входят все шесть `.rms` семейства
StandartRandom (список в переменной `scripts` внутри build.sh).
`dist/` — генерируемый каталог, в git не идёт. Если `zip` не установлен
(типично для Git Bash на Windows), скрипт собирает архив системным bsdtar
(`C:\Windows\System32\tar.exe`, флаг `-a` выбирает формат по расширению);
корень архива тот же — `resources/...` без обёрточной папки
(проверено 18.11.2026).

## Правила архива

- Корень zip — сразу `resources/...`; обёрточная папка с именем мода внутри
  архива не нужна и ломает установку.
- Допустимы служебные файлы рядом с `resources/` (`info.json`,
  `thumbnail.jpg`, `README.txt`).
- Превью: JPEG 1280×720; на портале — до 5 изображений ≤ 8 МБ каждое,
  zip ≤ 500 МБ (требования портала, локально не перепроверены).

## Локальная проверка

Профиль игры лежит в пользовательской папке Windows (на машине автора —
нативный Steam-клиент; Proton-путь
`~/.steam/steam/steamapps/compatdata/813780/...` здесь не существует):

```
C:\Users\<user>\Games\Age of Empires 2 DE\<steamid>\
  resources\_common\random-map-scripts\   # .rms + иконки
  resources\_common\xs\                   # .xs (#includeXS грузится только отсюда)
  mods\local\                             # распакованные моды
```

Быстрая проверка карты без мода:

```sh
P="$HOME/Games/Age of Empires 2 DE/76561198060636836/resources/_common"
cp maps/ИмяКарты.rms "$P/random-map-scripts/"
cp maps/ИмяКарты.xs  "$P/xs/"        # если карта с механикой
```

Карта видна в списке сразу, без перезапуска игры. Полная проверка мода:

```sh
mod/StandartRandom/build.sh
cp -r dist/StandartRandom \
  "$HOME/Games/Age of Empires 2 DE/76561198060636836/mods/local/"
```

Перезапустить игру, включить мод в меню Mods.

## Публикация

Два пути, оба требуют аккаунта Microsoft/Xbox Live владельца — публикацию
выполняет человек, не агент:

1. **Из игры:** Mods → My Mods → Publish Mod.
2. **Через сайт:** ageofempires.com → MODS → Submit a Mod; поля — Title,
   Game, Category, Tags, Description, Changelog, Thumbnail, ZIP.

Исследование про скриптовую публикацию через mod.io API (бэкенд внутриигровых
модов) — в [автоматизации публикации](/runbooks/publishing-automation.md);
кратко: автоматизировать можно, но нужно разово получить токен mod.io и
подтвердить game id.

Описание на сайте принимает HTML (`<p>`, `<br>`, списки); литеральные
переводы строк лучше не использовать — для вставки держим однострочные
варианты `description.*.oneline.html`. Разделы «Состав» в описаниях
генерируются (`AUTO:POOL_LISTS` в `tools/generate-specialized.mjs`,
человеческие имена — `pool-lists.md`). Однострочник после правки `.md`
пересобирается склейкой строк:
`awk '{printf "%s", $0}' description.ru.md > description.ru.oneline.html`.
Для поля Changelog — готовые записи
в `mod/StandartRandom/changelog.md` (EN основная, RU дубль; там же
однострочный вариант 0.2.0 на случай, если поле не принимает списки).

## Иконки карт и превью мода

Два разных изображения, оба обязательны для презентабельного мода:

**Иконка карты** (картинка в UI при выборе карты):
- квадратный PNG с именем, **в точности** совпадающим с `.rms`
  (`FrozenLake.png` ↔ `FrozenLake.rms`), лежит рядом с ним в
  `resources/_common/random-map-scripts/`;
- конвенция сверена по живым модам из подписок 18.11.2026 (`Rage Forest 5`:
  пара `*.rms`+`*.png` 1920×1920; турнирные карты: 420×420, 615×615) и
  **подтверждена в игре** 18.11.2026 (FrozenLake.png из профиля показывается
  при выборе карты) — размер не критичен, квадрат обязателен;
- у нас генерируется `tools/generate-map-icons.mjs` (чистый node: PNG через
  zlib; схематичный вид карты сверху с ромбами игроков) → пишет в
  `mod/<Мод>/icons/`, `build.sh` копирует в пакет.

**Превью мода** (страница мода и Mod Manager): JPEG 1280×720 `thumbnail.jpg`
в корне пакета; тот же генератор делает его из той же композиции (JPEG —
через `jpeg-js`, ставится `npm install` в `tools/`).

Проверка иконки в игре (пока не сделана): PNG из мода должен показываться
в списке карт — по итогам подтвердить или скорректировать конвенцию здесь.

## Подводные камни

- Имя файла `.rms` — это имя карты в списке лобби; переименование меняет
  отображаемое название.
- **`.xs` живёт в `resources/_common/xs/`, не рядом с `.rms`** (установлено
  18.11.2026): `#includeXS` резолвится по каталогу xs — в установке игры и в
  профиле (`<профиль>/resources/_common/xs/`, там же `default0.xs`-времянка
  игры); в мод-пакете `.xs` кладётся в `resources/_common/xs/` (build.sh
  DynamicRMS). Ошибка «Failed to open *.xs» = файл лежит не там; рядом с
  `.rms` в `random-map-scripts/` игра его не ищет. Основание: ugc-guide
  (beginner/programmer, раздел «create the file in
  `resources/_common/xs`») + живая ошибка и фикс установки.
- В мультиплеере мод (или тот же `.rms`) нужен всем игрокам лобби.
- `CacheStatus` в `info.json` оставляем `0`; инкремент — забота игры.
- `mod-status.json` руками не правим: игру перезапускаем, она сама
  регистрирует локальный мод.
