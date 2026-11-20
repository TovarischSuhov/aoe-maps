extern const int cAuraEffectBitMultiply = 1; /* if not added, value is added instead */
extern const int cAuraEffectBitCircular = 2; /* if not added, aura is square shaped */
extern const int cAuraEffectBitRangeIndicator = 4;
extern const int cAuraEffectBitTemporary = 8;
extern const int cAuraEffectBitAppliedWhenActivatedOnly = 16; /* only works with cAuraEffectBitTemporary */
extern const int cAuraEffectBitAdvancedRangeIndicator = 32;

extern const int cAuraDiplomacyAll = 0;
extern const int cAuraDiplomacyYou = 1;
extern const int cAuraDiplomacyNeutralEnemy = 2;
extern const int cAuraDiplomacyGaia = 3;
extern const int cAuraDiplomacyGaiaYouAlly = 4;
extern const int cAuraDiplomacyGaiaNeutralAlly = 5;
extern const int cAuraDiplomacyAllButYou = 6;

bool xsAddAura(
    int auraUnit = -1, /* unit to add the aura to */
    int affectedUnit = -1, /* unit or unit class (9xx) to be affected by the aura */
    int player = -1, /* aura unit player, does not work with -1, make multiple calls to all players instead */
    int attribute = -1, /* aura attribute, not all attributes supported by auras */
    float value = 0, /* aura value */ 
    float range = 0,  /* aura range */
    int auraEffectsBitField = 0, /* bit field for aura effects, constants are provided, add them together for multiple effects */
    int targetDiplomacy = 0, /* aura target diplomacy, controls what diplomacy target unit needs to be to be affected, constants are provided */
    int tempAuraDuration = 0, /* only works with cAuraEffectBitTemporary effect, specifies how long the temp aura lasts in seconds */
    int tempAuraCooldown = 0, /* only works with cAuraEffectBitTemporary effect, specifies how long the cooldown period lasts is in seconds */
    int unitsInRangeToTurnOn = 1, /* how many units need to be in range for aura to turn on */
    bool affectSelf = false /* if set makes aura affect auraUnit instead, affectedUnit still needs to be in range to activate */
) {
    /* Function adds an aura to the provided unit based on a your config. 
    Note that adding auras "freezes" the unit for further non task modifications.
    To work around that can respawn the unit or do a double replace with another unit and itself.
    Adding an aura to a unit of the same player that already has an aura for the same attribute and affectedUnit will overwrite it instead.
    Function returns `true` if function parameter validation passed and `false` if it did not (no aura added). */

    /* Validation */
    if (auraUnit < 0 || affectedUnit < 0 || player < 0 || player > 8) {
        return (false);
    }
    if (range < 0 || auraEffectsBitField < 0 || targetDiplomacy < 0 || targetDiplomacy > 6 
        || unitsInRangeToTurnOn < 0 || tempAuraDuration < 0 || tempAuraCooldown < 0) {
        return (false);
    }

    /* Handling gaia player */
    int setCommand = cSetAttribute;
    if (player == 0) {
        setCommand = cGaiaSetAttribute;
    }

    /* Setting right combat ability flags */
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

    /* Setting temporary aura values if enabled */
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

    /* Setting aura task */
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

bool xsRemoveAura(
    int auraUnit = -1, /* unit from which remove the aura */
    int affectedUnit = -1, /* unit or unit class (9xx) to be affected by the aura */
    int player = -1, /* aura unit player, does not work with -1, make multiple calls to all players instead */
    int attribute = -1, /* aura attribute, not all attributes supported by auras */
    bool removeTempAuraAttributes = false, /* if set removes temp aura attributes from unit */
    bool removeAllAuraAbilities = false /* if set removes unit aura ability disabling all auras and removing indicators */
) { 
    /* Function removes the aura added by xsAddAura. Leaves combat ability unchanged. 
    Removing auras "freezes" the unit for further non task modifications.
    Function returns `true` if function parameter validation passed and `false` if it did not (no aura removed). */

    /* Validation */
    if (auraUnit < 0 || affectedUnit < 0 || player < 0 || player > 8) {
        return (false);
    }

    /* Handling gaia player */
    int setCommand = cSetAttribute;
    if (player == 0) {
        setCommand = cGaiaSetAttribute;
    }

    /* Remove temporary aura values */
    if (removeTempAuraAttributes) {
        float ct = xsGetObjectAttribute(player, auraUnit, cChargeType, 0);
        if (ct == -3) {
            xsEffectAmount(setCommand, auraUnit, cMaxCharge, 0.0, player);
            xsEffectAmount(setCommand, auraUnit, cRechargeRate, 0.0, player);
            xsEffectAmount(setCommand, auraUnit, cChargeEvent, 0.0, player);
            xsEffectAmount(setCommand, auraUnit, cChargeType, 0.0, player);
        }
    }

    /* Remove combat ability */
    if (removeAllAuraAbilities) {
        float ca = xsGetObjectAttribute(player, auraUnit, cCombatAbility, 0);
        float caMod = 0;
        float auraBit = (ca / 32) % 2;
        if (auraBit == 1) {
            caMod = -32;
        }
        float selfBit = (ca / 64) % 2;
        if (selfBit == 1) {
            caMod = caMod - 64;
        }
        if (caMod != 0) {
            xsEffectAmount(setCommand, auraUnit, cCombatAbility, ca + caMod, player);
        }
    }

    /* Setting aura task */
    xsTaskAmount(cTaskAttrSearchWaitTime, 0.0 + attribute);
    xsRemoveTask(auraUnit, 155, affectedUnit, player);

    return (true);
}

const int cArmyTent = 1200;
bool auraEnabled = false;

/* The frost aura covers the whole snow ring and nothing beyond: the ring
   scales with the map side (see FrozenLake.rms RING_*) — linear fit
   ring ~= 23 + width * 0.105 for width > 120, Tiny hand-tuned to 30. The
   aura radius tracks the ring with a small margin, so home zones stay
   clear of the frost on every size. */
float lakeAuraRadius() {
    if (xsGetMapWidth() <= 120) {
        return (32.0);
    }
    return (27.0 + xsGetMapWidth() * 0.105);
}

/* Prominent top-panel notice (same UI as the Display Instructions editor
   effect) instead of a plain chat line; plays the standard notification sound. */
void showLakeNotice(string msg = "") {
    xsDisplayInstructions(msg, 12, 0, cArmyTent, cPanelTop, false, true, "", -1);
}

void main() {
}

void ActivateAura() {
    xsAddAura(cArmyTent, cScoutCavalryClass, 0, cRegenerationRate, -45.0, lakeAuraRadius(), 6, 0);
    xsAddAura(cArmyTent, cInfantryClass, 0, cRegenerationRate, -45.0, lakeAuraRadius(), 6, 0);
    xsAddAura(cArmyTent, cMonkClass, 0, cRegenerationRate, -45.0, lakeAuraRadius(), 6, 0);
    xsAddAura(cArmyTent, cTradeCartClass, 0, cRegenerationRate, -45.0, lakeAuraRadius(), 6, 0);  
    xsAddAura(cArmyTent, cPetardClass, 0, cRegenerationRate, -45.0, lakeAuraRadius(), 6, 0);
    xsAddAura(cArmyTent, cCavalryArcherClass, 0, cRegenerationRate, -45.0, lakeAuraRadius(), 6, 0);
    xsAddAura(cArmyTent, cMonkWithRelicClass, 0, cRegenerationRate, -45.0, lakeAuraRadius(), 6, 0);
    xsAddAura(cArmyTent, cArcherClass, 0, cRegenerationRate, -45.0, lakeAuraRadius(), 6, 0);
    xsAddAura(cArmyTent, cHandCannoneerClass, 0, cRegenerationRate, -45.0, lakeAuraRadius(), 6, 0);
    xsAddAura(cArmyTent, cKingClass, 0, cRegenerationRate, -45.0, lakeAuraRadius(), 6, 0);
    xsAddAura(cArmyTent, cCavalryClass, 0, cRegenerationRate, -45.0, lakeAuraRadius(), 6, 0);
    xsAddAura(cArmyTent, cVillagerClass, 0, cRegenerationRate, -45.0, lakeAuraRadius(), 6, 0);
    showLakeNotice("Frozen winds appear near the lake.");
}

void DeactivateAura() {
    xsRemoveAura(cArmyTent, cScoutCavalryClass, 0, cRegenerationRate);
    xsRemoveAura(cArmyTent, cInfantryClass, 0, cRegenerationRate);
    xsRemoveAura(cArmyTent, cMonkClass, 0, cRegenerationRate);
    xsRemoveAura(cArmyTent, cTradeCartClass, 0, cRegenerationRate);  
    xsRemoveAura(cArmyTent, cPetardClass, 0, cRegenerationRate);
    xsRemoveAura(cArmyTent, cCavalryArcherClass, 0, cRegenerationRate);
    xsRemoveAura(cArmyTent, cMonkWithRelicClass, 0, cRegenerationRate);
    xsRemoveAura(cArmyTent, cArcherClass, 0, cRegenerationRate);
    xsRemoveAura(cArmyTent, cHandCannoneerClass, 0, cRegenerationRate);
    xsRemoveAura(cArmyTent, cKingClass, 0, cRegenerationRate);
    xsRemoveAura(cArmyTent, cCavalryClass, 0, cRegenerationRate);
    xsRemoveAura(cArmyTent, cVillagerClass, 0, cRegenerationRate);
    showLakeNotice("Sun is shining. Lake is safe.");
}

rule auraChange
	active
	minInterval 300
	maxInterval 400
	group aura
{
    if (auraEnabled) {
        DeactivateAura();
        auraEnabled = false;
    } else {
        ActivateAura();
        auraEnabled = true;
    }
}