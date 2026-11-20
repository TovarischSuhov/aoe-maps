<p><b>StandartRandom</b> is a set of six Random Map scripts: one general pick among <b>100 standard Age of Empires II: Definitive Edition maps</b> plus five themed randoms — open, nomad, closed, water and hybrid.</p>

<p>The maps are not copied. The script references the game's own .rms files by name through #include_drs and only randomises which one is loaded, so every map always matches the current game patch and no game files are redistributed.</p>

<p><b>How it works</b></p>
<ul>
<li>100 maps, each with a 1% chance: percent_chance in RMS is an exclusive pick, and a total of exactly 100 guarantees a map in every game.</li>
<li>Only standard random-style maps: no Battle Royale, Escalation Mode or Capture the Relic.</li>
<li>Works with any map size and player count that the chosen standard map supports.</li>
</ul>

<p><b>Six scripts in the set</b></p>
<ul>
<li>StandartRandom — the general random: 100 standard maps, 1% each.</li>
<li>StandartOpenRandom — "open" maps (94).</li>
<li>StandartNomadRandom — "nomad" maps (14).</li>
<li>StandartCloseRandom — "closed" maps (12).</li>
<li>StandartWaterRandom — "water" maps (12).</li>
<li>StandartHybridRandom — "hybrid" maps (40).</li>
</ul>
<p>Themed randoms use the full standard pool (126 maps) tagged by the game's official maps.json flags. A map with several tags joins several themed randoms at once. Within a random the maps are near-equal chance: 100% is spread evenly over whole percentages.</p>

<!-- AUTO:POOL_LISTS EN:START -->
<p><b>Included maps</b></p>

<p>StandartRandom — general (100 maps):</p>
<ul>
<li>Arabia</li>
<li>Archipelago</li>
<li>Baltic</li>
<li>Black Forest</li>
<li>Coastal</li>
<li>Continental</li>
<li>Crater Lake</li>
<li>Fortress</li>
<li>Gold Rush</li>
<li>Highland</li>
<li>Islands</li>
<li>Mediterranean</li>
<li>Migration</li>
<li>Rivers</li>
<li>Team Islands</li>
<li>Scandinavia</li>
<li>Mongolia</li>
<li>Yucatan</li>
<li>Salt Marsh</li>
<li>Arena</li>
<li>Oasis</li>
<li>Ghost Lake</li>
<li>Nomad</li>
<li>Canals</li>
<li>Capricious</li>
<li>Dingos</li>
<li>Metropolis</li>
<li>Moats</li>
<li>Seasons</li>
<li>Shipwreck</li>
<li>Team Glaciers</li>
<li>Acropolis</li>
<li>Budapest</li>
<li>Cenotes</li>
<li>City of Lakes</li>
<li>Golden Pit</li>
<li>Hideout</li>
<li>Hill Fort</li>
<li>Lombardia</li>
<li>Steppe</li>
<li>Valley</li>
<li>Graveyards</li>
<li>Kilimanjaro</li>
<li>Mountain Pass</li>
<li>Nile Delta</li>
<li>Serengeti</li>
<li>Socotra</li>
<li>Water Nomad</li>
<li>Alpine Lakes</li>
<li>Bogland</li>
<li>Mountain Ridge</li>
<li>Ravines</li>
<li>Wolf Hill</li>
<li>Golden Swamp</li>
<li>Four Lakes</li>
<li>Land Nomad</li>
<li>Amazon Tunnel</li>
<li>Coastal Forest</li>
<li>African Clearing</li>
<li>Atacama</li>
<li>Seize The Mountain</li>
<li>Crater</li>
<li>Crossroads</li>
<li>Michi</li>
<li>Team Moats</li>
<li>Volcanic Island</li>
<li>Acclivity</li>
<li>Eruption</li>
<li>Frigid Lake</li>
<li>Greenland</li>
<li>Lowland</li>
<li>Marketplace</li>
<li>Meadow</li>
<li>Mountain Range</li>
<li>Northern Isles</li>
<li>Ring Fortress</li>
<li>Runestones</li>
<li>Aftermath</li>
<li>Enclosed</li>
<li>Haboob</li>
<li>Kawasan</li>
<li>Land Madness</li>
<li>Sacred Springs</li>
<li>Wade</li>
<li>Morass</li>
<li>Shoals</li>
<li>Cliffbound</li>
<li>Isthmus</li>
<li>Dunesprings</li>
<li>Golden Stream</li>
<li>Mountain Dunes</li>
<li>River Divide</li>
<li>Sandrift</li>
<li>Shrubland</li>
<li>The Passage</li>
<li>Hollow Woodlands</li>
<li>Karsts</li>
<li>Glade</li>
<li>Fortified Clearing</li>
<li>Aquarena</li>
</ul>

<p>StandartOpenRandom — open (94 maps):</p>
<ul>
<li>Arabia</li>
<li>Baltic</li>
<li>Coastal</li>
<li>Gold Rush</li>
<li>Mediterranean</li>
<li>Scandinavia</li>
<li>Mongolia</li>
<li>Yucatan</li>
<li>Salt Marsh</li>
<li>Oasis</li>
<li>Ghost Lake</li>
<li>Nomad</li>
<li>Canals</li>
<li>Capricious</li>
<li>Dingos</li>
<li>Graveyards</li>
<li>Metropolis</li>
<li>Moats</li>
<li>Paradise Island</li>
<li>Pilgrims</li>
<li>Prairie</li>
<li>Seasons</li>
<li>Sherwood Forest</li>
<li>Shipwreck</li>
<li>Team Glaciers</li>
<li>Acropolis</li>
<li>Cenotes</li>
<li>Golden Pit</li>
<li>Hill Fort</li>
<li>Lombardia</li>
<li>Steppe</li>
<li>Valley</li>
<li>Kilimanjaro</li>
<li>Serengeti</li>
<li>Socotra</li>
<li>Bog Islands</li>
<li>Water Nomad</li>
<li>Alpine Lakes</li>
<li>Bogland</li>
<li>Mountain Ridge</li>
<li>Ravines</li>
<li>Wolf Hill</li>
<li>Golden Swamp</li>
<li>Four Lakes</li>
<li>Coastal Forest</li>
<li>African Clearing</li>
<li>Atacama</li>
<li>Seize The Mountain</li>
<li>Crater</li>
<li>Crossroads</li>
<li>Volcanic Island</li>
<li>Acclivity</li>
<li>Eruption</li>
<li>Frigid Lake</li>
<li>Lowland</li>
<li>Marketplace</li>
<li>Meadow</li>
<li>Mountain Range</li>
<li>Runestones</li>
<li>Aftermath</li>
<li>Haboob</li>
<li>Kawasan</li>
<li>Land Madness</li>
<li>Sacred Springs</li>
<li>Wade</li>
<li>Morass</li>
<li>Shoals</li>
<li>Cliffbound</li>
<li>Isthmus</li>
<li>Dunesprings</li>
<li>Golden Stream</li>
<li>Mountain Dunes</li>
<li>Sandrift</li>
<li>Shrubland</li>
<li>Hollow Woodlands</li>
<li>Karsts</li>
<li>Glade</li>
<li>Border Dispute</li>
<li>Graupel</li>
<li>Stranded</li>
<li>Sardis</li>
<li>Chaos Pit</li>
<li>Mired</li>
<li>Murkwood</li>
<li>Crownwood</li>
<li>Dorothea Quarry</li>
<li>Glacis</li>
<li>Hengehold</li>
<li>Loch Ness</li>
<li>Rampart</li>
<li>Stonefront</li>
<li>Thames</li>
<li>Vulpine</li>
<li>Arabian Desert</li>
</ul>

<p>StandartNomadRandom — nomad (14 maps):</p>
<ul>
<li>Nomad</li>
<li>Pilgrims</li>
<li>Shipwreck</li>
<li>Steppe</li>
<li>Mountain Pass</li>
<li>Nile Delta</li>
<li>Water Nomad</li>
<li>Bogland</li>
<li>Land Nomad</li>
<li>African Clearing</li>
<li>Graupel</li>
<li>Stranded</li>
<li>Mired</li>
<li>Murkwood</li>
</ul>

<p>StandartCloseRandom — closed (12 maps):</p>
<ul>
<li>Black Forest</li>
<li>Fortress</li>
<li>Arena</li>
<li>Hideout</li>
<li>Mangrove Jungle</li>
<li>Sandbank</li>
<li>Amazon Tunnel</li>
<li>Michi</li>
<li>Team Moats</li>
<li>Ring Fortress</li>
<li>Enclosed</li>
<li>Fortified Clearing</li>
</ul>

<p>StandartWaterRandom — water (12 maps):</p>
<ul>
<li>Archipelago</li>
<li>Baltic</li>
<li>Crater Lake</li>
<li>Islands</li>
<li>Migration</li>
<li>Team Islands</li>
<li>Pacific Islands</li>
<li>Sandbank</li>
<li>Northern Isles</li>
<li>Isthmus</li>
<li>The Passage</li>
<li>Aquarena</li>
</ul>

<p>StandartHybridRandom — mixed (40 maps):</p>
<ul>
<li>Coastal</li>
<li>Continental</li>
<li>Highland</li>
<li>Mediterranean</li>
<li>Rivers</li>
<li>Scandinavia</li>
<li>Nomad</li>
<li>Canals</li>
<li>Capricious</li>
<li>Dingos</li>
<li>Metropolis</li>
<li>Paradise Island</li>
<li>Pilgrims</li>
<li>Seasons</li>
<li>Shipwreck</li>
<li>Team Glaciers</li>
<li>Budapest</li>
<li>City of Lakes</li>
<li>Hamburger</li>
<li>Nile Delta</li>
<li>Bog Islands</li>
<li>Mangrove Jungle</li>
<li>Water Nomad</li>
<li>Golden Swamp</li>
<li>Four Lakes</li>
<li>Coastal Forest</li>
<li>Crossroads</li>
<li>Volcanic Island</li>
<li>Frigid Lake</li>
<li>Greenland</li>
<li>Kawasan</li>
<li>Shoals</li>
<li>Dunesprings</li>
<li>Golden Stream</li>
<li>River Divide</li>
<li>Graupel</li>
<li>Stranded</li>
<li>Murkwood</li>
<li>Dorothea Quarry</li>
<li>Loch Ness</li>
</ul>
<!-- AUTO:POOL_LISTS EN:END -->
<p><b>Not included</b></p>
<p>26 standard maps from the newest and most niche parts of the pool are not in the general StandartRandom, but all of them take part in the themed randoms. MegaRandom and Empire Wars variants (EM*) are excluded on purpose: this is already a random pick, or a different game mode.</p>

<p><b>Compatibility</b></p>
<ul>
<li>Age of Empires II: Definitive Edition, current version.</li>
<li>Random map; single-player and multiplayer.</li>
<li>Every player in a lobby needs the mod (or the same .rms file). The referenced standard maps are part of the base game.</li>
</ul>

<p><b>Installation</b></p>
<p>Subscribe to the mod, enable it in the in-game Mod Manager, then select one of the six scripts (StandartRandom, StandartOpenRandom, StandartNomadRandom, StandartCloseRandom, StandartWaterRandom or StandartHybridRandom) in the map list.</p>
<p>Manual install: put the set's .rms files into resources/_common/random-map-scripts/ inside your game profile folder.</p>

<p><b>Uninstallation</b></p>
<p>Disable or unsubscribe the mod. For a manual install, delete the set's six .rms files.</p>

<p><b>Credits</b></p>
<p>Standard map scripts © Forgotten Empires / Microsoft. Only the wrapper script that selects among them is original work by Ilya Sukhov (TovarischSuhov). No game files are redistributed.</p>

<p><b>Changelog</b></p>
<p>0.2.0 — a set of six randoms: added themed randoms StandartOpenRandom, StandartNomadRandom, StandartCloseRandom, StandartWaterRandom and StandartHybridRandom; Aquarena joined the general list (100 maps); fixed the percentage total — it used to be 99%, leaving 1% of games without a map.</p>
<p>0.1.0 — first release: 99 standard maps, 1% each.</p>
