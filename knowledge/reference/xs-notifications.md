---
type: Reference
title: Заметные уведомления из XS (аналоги триггерных эффектов)
description: xsDisplayInstructions/xsSendChat/xsPlaySound (DE U177723, 2026-06-02) — баннеры и звук вместо xsChatData; сигнатуры, панель, sync-безопасность, кейс FrozenLake.
sources:
  - resource: "aoe-rms-lsp docs/ref/aoe2de-xs-rms-changelog.md — Update 177723 (2026-06-02), «Функции, работающие как аналоги триггерных эффектов»"
  - resource: "aoe-rms-lsp docs/ref/ugc-guide/xs/prelude.xs — сигнатуры и константы cPanel*"
  - resource: "/maps/FrozenLake.xs — showLakeNotice()"
generated:
  by: claude-code/glm-5.3-flash
  at: 2026-11-18T00:00:00Z
verified:
  - by: process:lsp-check.mjs
    at: 2026-11-18T00:00:00Z
    basis: FrozenLake.xs с xsDisplayInstructions/cPanelTop/xsGetMapWidth — 0 диагностик на LSP-гейте
---

# Заметные уведомления из XS

С DE Update 177723 (2026-06-02) XS получил прямые аналоги триггерных эффектов —
это путь к «заметным» уведомлениям из RMS-карт (баннер в панели с иконкой и
звуком, как при игровых событиях), вместо строчки `xsChatData`.

## API

- `bool xsDisplayInstructions(string msg, int time, int sourcePlayer,
  int iconObjectId, int panelPosition, bool useTagColorForIcon,
  bool playNotificationSound, string soundFilename, int playerId = -1)` —
  баннер «Display Instructions»: `time` в секундах, `sourcePlayer` даёт иконке
  цвет/цивилизацию, `iconObjectId` — иконка юнита, `panelPosition` —
  `cPanelTop`(0)/`cPanelMiddle`(1)/`cPanelBottom`(2), `playNotificationSound` —
  стандартный звук нотификации.
- `bool xsClearInstructions(int panelPosition, int playerId = -1)` — убрать баннер.
- `bool xsDisplayTimer(...)` / `bool xsClearTimer(...)` — таймер на экране.
- `bool xsSendChat(string msg, int playerId = -1, bool silent = false)` —
  чат с контролем звука.
- `bool xsPlaySound(string eventOrSoundFileName, int playerId, vector position,
  float angle, int objectId, bool global = false)` — произвольный звук.

## Правила применения

- `playerId = -1` — показать всем (sync-безопасно, это чистый UI). Локальные
  чтения (кто видит, зум, выбор) — только функции `xsUnsync*`; их результат
  нельзя использовать в игровой логике (рассинхрон).
- С U185872 (2026-09-22) `xsGetLocalPlayerId` и `xsGetTimerTimeRemaining`
  переименованы в `xsUnsyncGetLocalPlayerId`/`xsUnsyncGetTimerTimeRemaining`.
- U177723 фикс: цвет `<TAG>` больше не красит иконку автоматически — за это
  отвечает отдельный параметр `useTagColorForIcon`.
- Пример-шаблон: `showLakeNotice()` в `/maps/FrozenLake.xs` — баннер на 12 с,
  иконка юнита-носителя, звук нотификации, всем игрокам.
