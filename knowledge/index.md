---
okf_version: "0.2"
---

# База знаний aoe-maps

## Архитектура

* [Устройство проекта и цикл работы над картой](/architecture/overview.md) — что где лежит (`maps/`, `refs/`, `docs/`), роль `aoe2-lsp`, путь от ТЗ до площадки rusaok

## Справочники

* [Модель ресурсов DE-Аравии](/reference/de-arabia-resource-model.md) — как официальная `Arabia.rms` (v3.3) расставляет еду, золото, камень и живность: константы по наборам, масштабирование по размеру карты, `actor_area`-зоны, `remote_resources`
* [percent_chance — эксклюзивный выбор](/reference/percent-chance-selection.md) — семантика `start_random`, почему сумма должна быть ровно 100; доказательства из официальных `Arabia.rms`/`MegaRandom.rms2`
* [Семейство StandartRandom](/reference/standart-random-family.md) — пулы шести случайных карт мода, классификация по флагам `maps.json`, исключения и регенерация
* [Размеры карт DE](/reference/de-map-sizes.md) — тайлы по условным `TINY_MAP..LUDIKRIS_MAP`, проверка фиксированной геометрии через side/2, `override_map_size`
* [Заметные уведомления из XS](/reference/xs-notifications.md) — `xsDisplayInstructions`/`xsSendChat`/`xsPlaySound` (U177723): баннеры со звуком вместо `xsChatData`, sync-безопасность
* [Динамические карты — рантайм-факты](/reference/dynamic-map-runtime.md) — проверено в игре на SilentWoods: секунды в `rule minInterval`, Map lighting, перечисление юнитов и якоря-здания, ID волков, ловушки парсера XS

## Контракты

* [Требования открытой Аравии](/contracts/arabia-open-requirements.md) — что меняем (еда/золото/камень) и что обязано остаться неизменным; таблица значений и открытые вопросы

## Процедуры

* [Проверка карты](/runbooks/verification.md) — LSP-прогон через `cmd/corpus`, разбор диагностик, проверка в игре
* [Фиксация странностей LSP](/runbooks/lsp-diagnostics.md) — как оформить воспроизводимый пример в `docs/lsp-issues.md` и завести баг-репорт
* [Сборка и публикация карты модом](/runbooks/publishing.md) — структура `info.json`/`resources`, иконки карт (`<Карта>.png` рядом с `.rms`), превью мода, правила zip, локальная проверка, поля портала
* [Автоматизация публикации (mod.io API)](/runbooks/publishing-automation.md) — куда попадает мод, три пути публикации, схема загрузки через mod.io REST API и шаги проверки
