StandartRandom
==============

A single Random Map script that picks one of 99 standard Age of Empires II:
Definitive Edition maps.

The maps are not copied. The script references the game's own .rms files by
name through #include_drs and only randomises which one is loaded, so every
map always matches the current game patch and no game files are redistributed.

Install
-------
Subscribe to the mod and enable it in the in-game Mod Manager, then select
"StandartRandom" in the map list.

Manual install: put StandartRandom.rms into
resources/_common/random-map-scripts/ inside your game profile folder.

Uninstall
---------
Disable or unsubscribe the mod. For a manual install, delete
StandartRandom.rms.

Notes
-----
- Random map; single-player and multiplayer.
- Every player in a lobby needs the mod (or the same .rms file). The
  referenced standard maps are part of the base game.
- MegaRandom is included, so occasionally you get a random inside a random.

Credits
-------
Standard map scripts (c) Forgotten Empires / Microsoft.
Wrapper script by Ilya Sukhov (TovarischSuhov).
No game files are redistributed.

Version 0.1.0
