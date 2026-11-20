/* SilentWoods.xs - day/night cycle + night wolf packs.
   Part 4: the day/night color-mood cycle (10-minute phases).
   Part 5 will add the night wolf spawns from the cave rocks; the phase
   functions below are the hooks. Tracked in docs/silentwoods-review.md. */

// Game XS parser rules (verified 18.11.2026, docs/lsp-issues.md):
// return values in parentheses, defaults on every parameter, no ternaries.

const int cArmyTent = 1200;     // FrozenLake-style gaia tent - cave anchor building (type 80) + banner icon
const int cWolfUnit = 1965;     // Arctic Wolf - confirmed in game (2026-11-21); id 124 is a villager-like marker unit, NOT a wolf
const int cWolvesPerCave = 6;   // spec: 5-7 per cave per night; fixed for MP determinism

bool night = false; // current phase; the game starts at day

/* Prominent top-panel notice (same UI pattern as FrozenLake's
   showLakeNotice); plays the standard notification sound. Icon: the cave
   tent - verified rendering in FrozenLake. */
void showWoodsNotice(string msg = "") {
    xsDisplayInstructions(msg, 12, 0, cArmyTent, cPanelTop, false, true, "", -1);
}

void main() {
}

/* SpawnWolves: cWolvesPerCave wolves beside every cave outpost (gaia,
   dat type 80 - the only gaia buildings on the map), once per night.
   Wolf id = Arctic Wolf 1965 (confirmed in game; 124 turned out to be a
   villager-like unit). Wolves keep their boosted sight (RMS
   GAIA_SET_ATTRIBUTE on ARCTIC_WOLF) and hunt on their own predator AI -
   no scripted targeting, no despawn: packs accumulate. */
void SpawnWolves() {
    /* NOTE: game XS variables are FUNCTION-scoped (error 0014). */
    int gaia = xsGetPlayerUnitIds(0, -1, -1);
    int n = xsArrayGetSize(gaia);
    int towers = xsArrayCreateInt(n);
    int towerCount = 0;
    int i = 0;
    int uid = 0;
    int t = 0;
    while (i < n) {
        uid = xsArrayGetInt(gaia, i);
        t = xsGetUnitType(uid);
        if (t == 80) {
            xsArraySetInt(towers, towerCount, uid);
            towerCount = towerCount + 1;
        }
        i = i + 1;
    }
    i = 0;
    while (i < towerCount) {
        uid = xsArrayGetInt(towers, i);
        vector p = xsGetUnitPosition(uid);
        float ox = xsVectorGetX(p);
        float oy = xsVectorGetY(p);
        int j = 0;
        while (j < cWolvesPerCave) {
            /* small diagonal spread so the pack does not stack */
            vector sp = xsVectorSet(ox + 1.5 + j * 0.4, oy + 1.5 - j * 0.3, 0.0);
            xsCreateUnit(cWolfUnit, 0, sp, false, false, false);
            j = j + 1;
        }
        i = i + 1;
    }
    xsChatData("SW towers=" + towerCount);
}

/* Night: night color mood with a fast 2-second transition (short test
   phases). REQUIRES the "Map lighting" / "Коррекция цвета" graphics
   setting - without it color moods do not render (verified in game,
   2026-11-20). Then the wolf packs walk out of every cave. */
void EnterNight() {
    xsSetColorMood(cColorMoodNight, 2);
    showWoodsNotice("Night falls over the woods.");
    SpawnWolves();
}

/* Day: back to the default mood. Wolves are NOT despawned by design:
   they accumulate night after night and keep pressuring the players. */
void EnterDay() {
    xsSetColorMood(cColorMoodDefault, 2);
    showWoodsNotice("Dawn breaks. The woods are calm.");
}

/* hideAnchors: one-shot rule - hides the cave anchor tents via unit
   properties (cUnitVisibility=12 with the cLosInvisible=2 value,
   cUnitSelectable=10 -> 0; U185872 xsSetUnitProperty). Runs once ~10 s
   after game start, when map units exist. If value 2 is not the invisible
   one, try 0 next; if hidden tents leave the enumeration, the spawn must
   switch to explicit positions. */
rule hideAnchors
    active
    minInterval 10
    group anchors
{
    int gaia = xsGetPlayerUnitIds(0, -1, -1);
    int n = xsArrayGetSize(gaia);
    int i = 0;
    int uid = 0;
    int t = 0;
    int hidden = 0;
    float visRead = -1.0;
    while (i < n) {
        uid = xsArrayGetInt(gaia, i);
        t = xsGetUnitType(uid);
        if (t == 80) {
            xsSetUnitProperty(uid, cUnitVisibility, 0.0, 0);
            xsSetUnitProperty(uid, cUnitSelectable, 0.0, 0);
            visRead = xsGetUnitProperty(uid, cUnitVisibility, 0);
            hidden = hidden + 1;
        }
        i = i + 1;
    }
    xsChatData("SW hide: tents=" + hidden + " visRead=" + visRead);
    xsDisableSelf();
}

/* Phase switch: 5 minutes per phase (day 5 + night 5). The rule interval
   unit is SECONDS (verified in game 2026-11-20). */
rule dayNightCycle
    active
    minInterval 300
    maxInterval 300
    group dayNight
{
    if (night) {
        EnterDay();
        night = false;
    } else {
        EnterNight();
        night = true;
    }
}
