# DynamicRMS — поля для публикации

Версия: **0.1.1 опубликована** 18.11.2026 (`tools/publish-mod.mjs --mod-id`):
[modId 593764](https://www.ageofempires.com/mods/details/593764/) (Public,
тег 15 «Random Maps», портал v1.4 — счётчик загрузок файла). Состав 0.1.1:
фикс раскладки `.xs` (`resources/_common/xs/`), синтаксис XS под парсер
игры (return в скобках, дефолты параметров), масштабирование озера по
размеру карты. Пакет собирается `mod/DynamicRMS/build.sh`:
`dist/DynamicRMS/` + `dist/DynamicRMS.zip` (~79 КБ; корень архива —
`resources/`). В пакете: карты — пара `.rms` + `.png` в
`random-map-scripts/` и `.xs` в `_common/xs/`, `thumbnail.jpg`.

Автопубликация нового мода (dry-run без cookie, отправка с `--yes`):

```sh
node tools/publish-mod.mjs --new --name DynamicRMS \
  --zip dist/DynamicRMS.zip \
  --description-file mod/DynamicRMS/description.en.md \
  --image mod/DynamicRMS/icons/thumbnail.jpg \
  --tags 15 \
  --changelog-html '<p>0.1.0 — FrozenLake added: a frozen lake with periodic frost winds (announced on screen), Explosive King in Regicide, compact lake on Tiny.</p>' --yes
```

Описания: `description.ru.md` / `description.en.md` (портал принимает HTML);
после правки пересобрать однострочники:

```sh
awk '{printf "%s", $0}' description.ru.md > description.ru.oneline.html
awk '{printf "%s", $0}' description.en.md > description.en.oneline.html
```

Changelog — в `changelog.md` (EN основная, RU дубль).

## Чек-лист перед публикацией

- [x] Иконка карты: `icons/FrozenLake.png` (генератор `tools/generate-map-icons.mjs`),
      попадает в пакет рядом с `.rms`.
- [x] Превью: `icons/thumbnail.jpg` 1280×720 (тот же генератор, jpeg-js).
- [x] Раскладка `.xs`: в пакете `resources/_common/xs/FrozenLake.xs` (не рядом
      с `.rms` — игра ищет `#includeXS` только в `_common/xs/`; ошибка
      «Failed to open FrozenLake.xs» 18.11.2026, пакет пересобран).
- [x] Опубликована 0.1.1 (портал v1.4, превью восстановлено — см. заметку
      про `--image` в publishing-automation).
- [x] Проверка в игре: аура FrozenLake работает из мода (подтверждено
      18.11.2026 после фиксов раскладки и синтаксиса XS).
- [x] Проверка в игре: PNG-иконка показывается в UI при выборе карты
      (подтверждено 18.11.2026, установка в профиль).
- [x] Масштабирование озера по размерам карты — проверено в игре
      (Tiny/Medium/Huge, 18.11.2026, версия 0.1.1): кольцо не задевает
      домашние зоны, аура накрывает всю зону озера.
- [ ] Открытые вопросы `docs/frozen-lake-review.md` (ритм ауры, зоны
      подключений `-9..-2`) закрыты или осознанно отложены.

## In-game Mod Manager (My Mods → Publish Mod)

| Поле | Значение |
|---|---|
| Title | `DynamicRMS` |
| Author | `TovarischSuhov` |
| Description | одна строка из `info.json` |
| Thumbnail | `thumbnail.jpg` |

Публикация из игры требует входа в Xbox Live; действие выполняет владелец
аккаунта.

## Сайт ageofempires.com → MODS → SUBMIT A MOD

| Поле | Значение |
|---|---|
| Game | Age of Empires II: Definitive Edition |
| Title | `DynamicRMS` |
| Author | `Ilya Sukhov (TovarischSuhov)` |
| Category | Maps |
| Tags | Random Map, Maps, Multiplayer (уточнить по доступным тегам) |
| Version | `0.1.0` |
| Thumbnail | `thumbnail.jpg` (1280×720, JPEG) |
| ZIP | `dist/DynamicRMS.zip` |

Обновление опубликованного мода автоматизируется `tools/publish-mod.mjs` —
процедура в [автоматизации публикации](/runbooks/publishing-automation.md).
