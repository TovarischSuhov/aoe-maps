DynamicRMS
==========

A collection of dynamic Random Map scripts for Age of Empires II: Definitive
Edition. These are not just terrain and resources: each map carries its own
.xs script with living mechanics - weather auras, scripted events, changing
conditions. Every map in the collection is described in detail in the mod
description and grows over time.

Maps
----

- FrozenLake - a circular frozen lake ringed by an autumn-snow forest.
  Periodic frozen winds damage every unit near the lake; safe thaw phases
  alternate with them and every change is announced with an on-screen notice.
  On Tiny the lake is drawn compact so two players fit comfortably.

Install
-------
Subscribe to the mod and enable it in the in-game Mod Manager, then select
one of the collection's scripts in the map list.

Manual install: put the .rms (and .png icon) files into
resources/_common/random-map-scripts/ and the .xs files into
resources/_common/xs/ inside your game profile folder. The game loads
#includeXS scripts only from resources/_common/xs/.

Uninstall
---------
Disable or unsubscribe from the mod in the Mod Manager; for manual install,
delete the map files from resources/_common/random-map-scripts/.

Multiplayer: every player in the lobby needs the mod (or the same map files).
