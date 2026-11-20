StandartRandom
==============

A set of six Random Map scripts for Age of Empires II: Definitive Edition:

- StandartRandom       — picks one of 100 standard game maps (1% each).
- StandartOpenRandom   — themed random: "open" maps (94).
- StandartNomadRandom  — themed random: "nomad" maps (14).
- StandartCloseRandom  — themed random: "closed" maps (12).
- StandartWaterRandom  — themed random: "water" maps (12).
- StandartHybridRandom — themed random: "hybrid" maps (40).

The maps are not copied. Each script references the game's own .rms files by
name through #include_drs and only randomises which one is loaded, so every
map always matches the current game patch and no game files are redistributed.

Themed randoms use the full standard pool (126 maps) tagged by the game's
official maps.json flags; a map with several tags joins several themed
randoms at once.

Install
-------
Subscribe to the mod and enable it in the in-game Mod Manager, then select
one of the six scripts in the map list.

Manual install: put the six .rms files into
resources/_common/random-map-scripts/ inside your game profile folder.

Uninstall
---------
Disable or unsubscribe the mod. For a manual install, delete the six .rms
files.

Notes
-----
- Random map; single-player and multiplayer.
- Every player in a lobby needs the mod (or the same .rms files). The
  referenced standard maps are part of the base game.
- MegaRandom and Empire Wars variants (EM*) are intentionally excluded:
  the former is already a random pick, the latter belong to another mode.
- percent_chance is an exclusive pick in RMS; each script totals exactly
  100%, so a map is guaranteed in every game.

Credits
-------
Standard map scripts (c) Forgotten Empires / Microsoft.
Wrapper scripts by Ilya Sukhov (TovarischSuhov).
No game files are redistributed.

Version 0.2.0
