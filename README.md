# aoe-maps

Random Map Scripts (RMS) for Age of Empires II: DE.

Projects:

- **Open Arabia** — a rework of standard Arabia's food, gold and stone
  distribution so the map plays open and forces an aggressive Feudal Age
  instead of a walled-up game. Requirements and open questions live in
  [`docs/arabia-open.tz.md`](docs/arabia-open.tz.md). Status: work in progress.
- **StandartRandom** — one Random Map script that picks one of 99 standard
  Age of Empires II: DE maps. The maps are not copied: the script references
  the game's own `.rms` files via `#include_drs`. Sources in
  [`maps/StandartRandom.rms`](maps/StandartRandom.rms), mod package in
  [`mod/StandartRandom/`](mod/StandartRandom/).

Developed with the
[`aoe2-lsp`](https://github.com/TovarischSuhov/aoe-rms-lsp) language server
(navigation, diagnostics).
