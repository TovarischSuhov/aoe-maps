# StandartRandom — поля для публикации

Версия: 0.2.0 — **уже опубликована** вручную 18.11.2026:
[ageofempires.com/mods/details/583593](https://www.ageofempires.com/mods/details/583593/)
(modId **583593**, gameTitleId 2, тег 15 «Random Maps»). Пакет собирается
`mod/StandartRandom/build.sh`: `dist/StandartRandom/` (распакованный мод)
и `dist/StandartRandom.zip` (архив для загрузки; корень архива —
`resources/`, без обёрточной папки). В пакете шесть `.rms` семейства
StandartRandom. Записи Changelog для портала — в `changelog.md` (EN
основная, RU дублируется).

Обновление уже опубликованного мода автоматизируется инструментом
`tools/publish-mod.mjs` (сайт-API `api.ageofempires.com`, нужен cookie
сессии) — процедура и формат запроса в
[автоматизации публикации](/runbooks/publishing-automation.md).

## In-game Mod Manager (My Mods → Publish Mod)

| Поле | Значение |
|---|---|
| Title | `StandartRandom` |
| Author | `TovarischSuhov` |
| Description | одна строка из `info.json` |
| Thumbnail | `thumbnail.jpg` |

Публикация из игры требует входа в Xbox Live; действие выполняет владелец
аккаунта.

## Сайт ageofempires.com → MODS → SUBMIT A MOD

| Поле | Значение |
|---|---|
| Game | Age of Empires II: Definitive Edition |
| Title | `StandartRandom` |
| Author | `Ilya Sukhov (TovarischSuhov)` |
| Category | Maps |
| Tags | Random Map, Standard Maps, Maps, Multiplayer |
| Version | `0.2.0` |
| Thumbnail | `thumbnail.jpg` (1280×720, JPEG) |
| ZIP | `dist/StandartRandom.zip` |
| Description | `description.en.md` (англ.) или `description.ru.md` (рус.) |
| Changelog | запись 0.2.0 из `changelog.md` (готовые EN/RU варианты) |
| Credits | `Standard map scripts © Forgotten Empires / Microsoft. Wrapper script by Ilya Sukhov (TovarischSuhov). No game files are redistributed.` |

Описание на сайте поддерживает HTML; переносы строк — через `<p>`/`<br>`,
а не литеральные переводы строк. Ограничения площадки: до 5 изображений
JPEG ≤ 8 МБ каждое (рекомендуется 1280×720), ZIP ≤ 500 МБ.

## Локальная проверка

```sh
mod/StandartRandom/build.sh
cp -r dist/StandartRandom \
  "$HOME/.steam/steam/steamapps/compatdata/813780/pfx/drive_c/users/steamuser/Games/Age of Empires 2 DE/76561198060636836/mods/local/"
```

Перезапустить игру и включить мод в меню Mods. Для проверки без мода
достаточно положить `StandartRandom.rms` в
`.../76561198060636836/resources/_common/random-map-scripts/`.
