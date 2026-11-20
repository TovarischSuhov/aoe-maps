---
type: Runbook
title: Автопубликация модов — API сайта ageofempires.com
description: Как устроен бэкенд модов AoE2:DE, найденный API публикации на сайте, инструмент tools/publish-mod.mjs и состояние (StandartRandom уже опубликован, modId 583593).
sources:
  - resource: "https://api.ageofempires.com/api/v4/mods/Detail/583593"
  - resource: "https://www.ageofempires.com/wp-content/themes/ageOfEmpires/public/js/main.2dd3a1.js"
  - resource: https://docs.mod.io/restapi/introduction
  - resource: "C:/Users/79105/Games/Age of Empires 2 DE/76561198060636836/mods/mod-status.json"
  - resource: tools/publish-mod.mjs
generated:
  by: claude-code/glm-5.3
  at: 2026-11-18T17:10:00Z
verified:
  - by: claude-code/glm-5.3-flash
    at: 2026-11-18T15:21:00Z
    basis: "первая реальная публикация ветки --new: DynamicRMS создан (modId 593764, Public, портал v1.1), верифицирован повторным /Detail"
---

# Автопубликация модов — API сайта ageofempires.com

Исследование 18.11.2026. **Итог: публикация автоматизируется через
внутренний API сайта** `api.ageofempires.com` — это тот же API, что
использует кнопка Submit a Mod. Инструмент — `tools/publish-mod.mjs`.
**Проверено на деле 18.11.2026**: создание нового мода (`--new`) через
инструмент сработало — DynamicRMS опубликован
([modId 593764](https://www.ageofempires.com/mods/details/593764/)), затем
три обновления (`--mod-id`) — портал v1.4. Проверенные факты об обновлении:

- **`thumbnail` и `imageUrls` — разные вещи**: превью мода — отдельное поле
  `thumbnail`; `imageUrls` — галерея. При обновлении без `modImages` сервер
  **перезаписывает превью дефолтом** `thumb_mod_default.jpeg`, даже если
  галерея не трогалась.
- **Каждому новому файлу `modImages` нужен placeholder в `ImageMetaData`**
  (`imageId: null`, `displayIndex`, `imageName` = имя файла) — файл без
  записи не привязывается (0.1.1: превью вернулось только с placeholder'ом;
  инструмент теперь добавляет их сам).
- `changeList` принимается на каждом обновлении; `modVersion` портала
  инкрементируется сервером (1.1 → 1.2 → 1.3 → 1.4 за четыре загрузки).
- Практическое правило: **при каждом обновлении передавать `--image`** с
  актуальным превью — это и восстановление, и страховка.
- **Всегда передавать `--name`** (или теперь можно опустить — имя возьмётся
  с портала): инцидент 20.11.2026 — публикация 0.2.0 без `--name` ушла с
  дефолтом `StandartRandom` и **переименовала DynamicRMS** на портале;
  откат повторной публикацией с `--name DynamicRMS` (портал 1.5 → 1.6).
  Инструмент патчен: без `--name` берёт имя из `/Detail`.
- Лишние картинки в галерее (случайный `modImages`) снимаются следующей
  публикацией: `ImageMetaData` без записи о картинке сервер удаляет.

## Текущее состояние (18.11.2026)

- **StandartRandom уже опубликован** владельцем вручную:
  [modId 583593](https://www.ageofempires.com/mods/details/583593/),
  автор портала TovarischSuhov0 (creatorId 14444569), gameTitleId 2
  («Age of Empires II DE»), статус Published/Public, тег 15 «Random Maps».
- `modVersion` портала (было 1.3) — это **счётчик загрузок файла**,
  автоматически инкрементируется сервером; версия 0.2.0 в changeList —
  то, что автор пишет сам. Не путать.
- Файлы хранятся на `cdn.ageofempires.com/aoe-mods/{gameTitleId}/{modId}/<hash>.zip`.

## Бэкенд сайта (снято с JS темы ageOfEmpires, main.2dd3a1.js)

- База модового API: `https://api.ageofempires.com/api/v4/mods`;
  логин — `auth.ageofempires.com` (Microsoft/Xbox SSO), сессия — cookie
  `.AgeOfEmpiresServices=...` (ASP.NET DataProtection).
- Эндпоинты: `/Detail/{id}`, `/Find`, `/Games`, `/Tags`, `/Types`,
  `/Featured`, `/Related`, `/Reviews`, `/Rate`, `/Like`, `/Subscribe`,
  `/UnSubscribe`, `/My`, `/Notifications`, **`/Publish`**, `/Delete`,
  `/CheckAndPublishFile`, `/Moderate`, `/Report`. Анониму — 401 даже на
  чтение.
- ID сайта = ID в игре: mod 3762 одновременно в `mod-status.json`
  (поле `WorkshopID`) и на `ageofempires.com/mods/details/3762`.
  Внутриигровой браузер читает то же хранилище (внешне похожее на mod.io —
  витрина `mods.mod.io/age-of-empires-2-de`, ID совпадают), но браузеру
  сайта запросов к mod.io/modapi.io нет: проксирует бэкенд сайта.

## Формат публикации (`POST /api/v4/mods/Publish`, multipart/form-data)

Поля из `_submitForm` сайта:

| Поле | Значение для StandartRandom |
|---|---|
| `modId` | 583593 (обновление; при создании — не слать) |
| `gameTitleId` | 2 |
| `modTags` | 15 (повторяемое поле, id тега «Random Maps») |
| `modName` | StandartRandom |
| `description` | HTML (описание, en) |
| `changeList` | HTML записи changelog (опционально) |
| `modVisibility` | `Public` (текстом) |
| `modDiscussion` | false |
| `ImageMetaData` | JSON-массив `{imageId, displayIndex, imageName, imageThumbnail}` — **все существующие картинки нужно перечислить, иначе сервер их потеряет**; новые добавляются файлами `modImages` (≤5, ≤8 МБ, jpeg/png/gif) |
| `modFiles` | zip (`.zip`/`.sga`, ≤ ~5.5 МБ одним куском; больше 4 МБ сайт грузит чанками `useChunk=true` — инструментом не поддержано) |
| `modType` | 1 (Scenario; для gameTitleId 4 — 6) |

Ответ: `{resultKey:"ModId", resultValue:"<id>"}`; `-1` или `errorMessage` —
ошибка. После загрузки сервер сам инкрементирует `modVersion`.

## Инструмент

`tools/publish-mod.mjs` (node, без зависимостей): сверяется с `/Detail`
(isOwner, сохраняет картинки), собирает multipart, публикует, верифицирует
повторным `/Detail`. По умолчанию **dry-run** — реальная отправка только с
`--yes`. С 18.11.2026 умеет и **создание** нового мода: `--new` (без
`--mod-id`; `gameTitleId` флагом, по умолчанию 2; превью — файл(ы)
`--image`, уходят в `modImages`; dry-run работает без cookie, cookie нужен
только с `--yes` и для обновления). Реальных публикаций через инструмент
пока не было (ветка создания — в частности).

```sh
# обновление существующего
AOE_COOKIE='<строка Cookie из Copy as cURL>' \
node tools/publish-mod.mjs \
  --mod-id 583593 \
  --zip dist/StandartRandom.zip \
  --description-file mod/StandartRandom/description.en.md \
  --changelog-html '<p>0.3.0 — …</p>' \
  --tags 15 --yes

# создание нового (кейс DynamicRMS)
AOE_COOKIE='<Cookie>' node tools/publish-mod.mjs \
  --new --name DynamicRMS \
  --zip dist/DynamicRMS.zip \
  --description-file mod/DynamicRMS/description.en.md \
  --image mod/DynamicRMS/icons/thumbnail.jpg \
  --tags 15 \
  --changelog-html '<p>0.1.0 — …</p>' --yes
```

Cookie целиком из заголовка `Cookie:` браузерной сессии — в переменную
`AOE_COOKIE` или файл вне репо (`--cookie-file`); **в git не класть**.
Полный цикл релиза: `bash mod/DynamicRMS/build.sh` → dry-run без cookie →
команда с `--yes` → проверить страницу мода.

## Безопасность

- Cookie-сессия и ключи светились в чате при настройке — после отладки
  перевыпустить: перелогин на сайте обновляет `.AgeOfEmpiresServices`,
  api key/OAuth-токен mod.io отозвать на `mod.io/me/access`.
- Репо открытый: секреты только в env/файлах вне репо.

## Ветка mod.io — запасной путь (не доведена)

mod.io — бэкенд внутриигрового браузера модов (витрина
`mods.mod.io/age-of-empires-2-de`, ID модов совпадают с сайтом), но игра
для mod.io приватна: публичный api_key не видит игру (проверено: `_q`,
`name_id`, прямые `/games/{id}` — пусто/404 при рабочем ключе), витрина
18.11.2026 лежала (522 весь хост). Личный OAuth-токен mod.io (JWE) валиден,
но `api.mod.io` для OAuth объявлен deprecated — токены работают на
`g-{game_id}.modapi.io` / `u-{user_id}.modapi.io`, для чего нужен game id.
Если сайт-ветка сломается — вернуться сюда: id игры появится в HTML витрины
когда она оживёт, либо в трафике внутриигрового браузера модов.
