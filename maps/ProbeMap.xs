/* ProbeMap.xs — серия проб движка, результаты в чат с префиксом [PRB].
   Правила парсера игры (проверены 18.11.2026): return в скобках, дефолты у
   всех параметров функций, никаких тернарников.
   Часть API (xsGetMapTileAttribute, xsSetUnitOwner, xsTaskUnits,
   xsSetUnitCaption) появилась в U185872 и отсутствует в prelude LSP —
   диагностика на них игнорируется, в игре они есть. */

const int cTent = 1200;
/* в Constants.xs нет константы unit-id поселянина (только cVillagerClass=904) */
const int cVillagerUnit = 83;

int probeStep = 0;
int spawnedId = -1;
float spawnX = -1.0;
float spawnY = -1.0;

void probeChat(string msg = "") {
    xsChatData("[PRB] " + msg);
}

string boolStr(bool b = false) {
    if (b) {
        return ("OK");
    }
    return ("FAIL");
}

void main() {
}

/* копия xsAddAura из FrozenLake.xs (общая библиотека ещё не вынесена) */
bool xsAddAura(
    int auraUnit = -1,
    int affectedUnit = -1,
    int player = -1,
    int attribute = -1,
    float value = 0,
    float range = 0,
    int auraEffectsBitField = 0,
    int targetDiplomacy = 0,
    int tempAuraDuration = 0,
    int tempAuraCooldown = 0,
    int unitsInRangeToTurnOn = 1,
    bool affectSelf = false
) {
    if (auraUnit < 0 || affectedUnit < 0 || player < 0 || player > 8) {
        return (false);
    }
    if (range < 0 || auraEffectsBitField < 0 || targetDiplomacy < 0 || targetDiplomacy > 6
        || unitsInRangeToTurnOn < 0 || tempAuraDuration < 0 || tempAuraCooldown < 0) {
        return (false);
    }
    int setCommand = cSetAttribute;
    if (player == 0) {
        setCommand = cGaiaSetAttribute;
    }
    float ca = xsGetObjectAttribute(player, auraUnit, cCombatAbility, 0);
    if (ca < 0) {
        ca = 0;
    }
    float caMod = 0;
    float auraBit = (ca / 32) % 2;
    if (auraBit == 0) {
        caMod = 32;
    }
    float selfBit = (ca / 64) % 2;
    if (affectSelf && selfBit == 0) {
        caMod = caMod + 64;
    } else if (affectSelf == false && selfBit == 1) {
        caMod = caMod - 64;
    }
    if (caMod != 0) {
        xsEffectAmount(setCommand, auraUnit, cCombatAbility, ca + caMod, player);
    }
    int tempEffectBit = (auraEffectsBitField / 8) % 2;
    if (tempEffectBit == 1) {
        float maxCharge = 1;
        float cdRatio = 1000;
        if (tempAuraCooldown > 0) {
            float tacf = tempAuraCooldown;
            cdRatio = maxCharge / tacf;
        }
        xsEffectAmount(setCommand, auraUnit, cMaxCharge, maxCharge, player);
        xsEffectAmount(setCommand, auraUnit, cRechargeRate, cdRatio, player);
        xsEffectAmount(setCommand, auraUnit, cChargeEvent, 0.0 + tempAuraDuration, player);
        xsEffectAmount(setCommand, auraUnit, cChargeType, -3.0, player);
    }
    xsResetTaskAmount();
    xsTaskAmount(cTaskAttrWorkValue1, value);
    xsTaskAmount(cTaskAttrWorkValue2, 0.0 + unitsInRangeToTurnOn);
    xsTaskAmount(cTaskAttrWorkRange, range);
    xsTaskAmount(cTaskAttrSearchWaitTime, 0.0 + attribute);
    xsTaskAmount(cTaskAttrCombatLevelFlag, 0.0 + auraEffectsBitField);
    xsTaskAmount(cTaskAttrOwnerType, 0.0 + targetDiplomacy);
    xsTask(auraUnit, 155, affectedUnit, player);
    return (true);
}

rule probeRunner
    active
    minInterval 2500
    group probe
{
    if (probeStep == 0) {
        /* A: перечисление юнитов игрока 1 + позиция первого */
        int arr1 = xsGetPlayerUnitIds(1, -1, -1);
        int n1 = xsArrayGetSize(arr1);
        probeChat("P0: player1 units = " + n1);
        if (n1 > 0) {
            int id0 = xsArrayGetInt(arr1, 0);
            vector v0 = xsGetUnitPosition(id0);
            probeChat("P0: first id=" + id0 + " pos=" + v0.x + "," + v0.y);
        }
    } else if (probeStep == 1) {
        /* B: перечисление по objectId — ровно 2 тента; и все gaia */
        int arrT = xsGetPlayerUnitIds(0, cTent, -1);
        int arrG = xsGetPlayerUnitIds(0, -1, -1);
        probeChat("P1: gaia tents = " + xsArrayGetSize(arrT) + " (expect 2), gaia total = " + xsArrayGetSize(arrG));
    } else if (probeStep == 2) {
        /* C: тайл-атрибуты: вода (25%,25%) vs центр (50%,50%) — печатаются
           только отличающиеся атрибуты 0..15 */
        int w = xsGetMapWidth();
        int a = 0;
        while (a < 16) {
            float wv = xsGetMapTileAttribute(w / 4, w / 4, a);
            float lv = xsGetMapTileAttribute(w / 2, w / 2, a);
            if (wv != lv) {
                probeChat("P2: tileAttr " + a + ": water=" + wv + " land=" + lv);
            }
            a = a + 1;
        }
        probeChat("P2: tile scan done");
    } else if (probeStep == 3) {
        /* D: до — читаем LOS/Regen/Range первого тента; вешаем ауры на
           самого носителя (affectSelf), активируются вторым тентом в радиусе */
        int arrT = xsGetPlayerUnitIds(0, cTent, -1);
        int cnt = xsArrayGetSize(arrT);
        if (cnt < 2) {
            probeChat("P3: FAIL need 2 tents, got " + cnt);
        } else {
            int t1 = xsArrayGetInt(arrT, 0);
            float losB = xsGetObjectAttribute(0, t1, cLineOfSight, -1);
            float regenB = xsGetObjectAttribute(0, t1, cRegenerationRate, -1);
            float rangeB = xsGetObjectAttribute(0, t1, cMaxRange, -1);
            bool a1 = xsAddAura(t1, cTent, 0, cLineOfSight, -3.0, 12.0, 0, 0, 0, 0, 1, true);
            bool a2 = xsAddAura(t1, cTent, 0, cRegenerationRate, -7.0, 12.0, 0, 0, 0, 0, 1, true);
            bool a3 = xsAddAura(t1, cTent, 0, cMaxRange, -5.0, 12.0, 0, 0, 0, 0, 1, true);
            probeChat("P3: before los=" + losB + " regen=" + regenB + " range=" + rangeB);
            probeChat("P3: aura calls los=" + boolStr(a1) + " regen=" + boolStr(a2) + " range=" + boolStr(a3));
        }
    } else if (probeStep == 4) {
        /* D: после — изменилось => атрибут поддержан аурой */
        int arrT = xsGetPlayerUnitIds(0, cTent, -1);
        int t1 = xsArrayGetInt(arrT, 0);
        float losA = xsGetObjectAttribute(0, t1, cLineOfSight, -1);
        float regenA = xsGetObjectAttribute(0, t1, cRegenerationRate, -1);
        float rangeA = xsGetObjectAttribute(0, t1, cMaxRange, -1);
        probeChat("P4: after los=" + losA + " (changed => SUPPORTED)");
        probeChat("P4: after regen=" + regenA + " (control, must change)");
        probeChat("P4: after range=" + rangeA + " (changed => SUPPORTED)");
    } else if (probeStep == 5) {
        /* E: владение + подпись */
        int arrT = xsGetPlayerUnitIds(0, cTent, -1);
        int t2 = xsArrayGetInt(arrT, xsArrayGetSize(arrT) - 1);
        bool own = xsSetUnitOwner(t2, 1, false);
        bool cap = xsSetUnitCaption(t2, "PROBE MARK");
        int arrP1 = xsGetPlayerUnitIds(1, cTent, -1);
        probeChat("P5: setOwner=" + boolStr(own) + " caption=" + boolStr(cap) + " player1 tents now = " + xsArrayGetSize(arrP1) + " (1 => ownership OK)");
    } else if (probeStep == 6) {
        /* F: спавн поселянина в центре + приказ движения на восток */
        int w = xsGetMapWidth();
        spawnX = w * 0.5;
        spawnY = w * 0.5;
        spawnedId = xsCreateUnit(cVillagerUnit, 1, vector(spawnX, spawnY, 0.0), false, false, false);
        probeChat("P6: spawned villager id=" + spawnedId + " at " + spawnX + "," + spawnY);
        if (spawnedId > 0) {
            int arrM = xsArrayCreateInt(1, 0, "probeMove");
            xsArraySetInt(arrM, 0, spawnedId);
            xsTaskUnits(arrM, cTaskTypeMoveTo, vector(w * 0.75, spawnY, 0.0), -1, false, false, false, 0);
            probeChat("P6: move order sent to " + w * 0.75 + "," + spawnY);
        }
    } else if (probeStep == 7) {
        /* F: проверка, что юнит сдвинулся, и удаление */
        if (spawnedId > 0) {
            vector mv = xsGetUnitPosition(spawnedId);
            bool moved = mv.x > spawnX + 2.0;
            bool rm = xsRemoveUnit(spawnedId);
            probeChat("P7: pos now " + mv.x + "," + mv.y + " moved=" + boolStr(moved) + " removed=" + boolStr(rm));
        }
        probeChat("PROBE DONE");
        xsDisableSelf();
    }
    probeStep = probeStep + 1;
}
