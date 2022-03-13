const HEALING_OP = "Hyperbolic Regeneration Chamber";

const STATE = {
    IDLE: 0,
    HEAL: 1,
    CONTRACT: 2,
    TRAIN: 3,
    CALM: 4,
    INCITE: 5
}

function readable(n) {
    switch(n) {
        case 0: return "Idle";
        case 1: return "Healing";
        case 2: return "Contract";
        case 3: return "Training";
        case 4: return "Calm";
        case 5: return "Incite";
    }
}
const PRIMARY_TYPE = "Contracts";
const PRIMARY_NAME = "Tracking";

/** @param {NS} ns **/
function getOptions(ns) {
    var rank = ns.bladeburner.getRank();
    if(rank < 10_000) {
        return [
            "Hyperdrive", // Each level of this skill increases the experience earned from Contracts, Operations, and BlackOps by 10%
            "Cyber's Edge", // Each level of this skill increases your max stamina by 2%
            "Blade's Intuition", // Each level of this skill increases your success chance for all Contracts, Operations, and BlackOps by 3%
            "Tracer", // Each level of this skill increases your success chance in all Contracts by 4%,
        ];
    }
    /*
    if(rank < 25_000) {

    }
    if(rank < 100_000) {

    }
    if(rank < 250_000)
    */

    // Late game - level them all.
    return [
        "Blade's Intuition", // Each level of this skill increases your success chance for all Contracts, Operations, and BlackOps by 3%
        "Cloak", // Each level of this skill increases your success chance in stealth-related Contracts, Operations, and BlackOps by 5.5%
        "Short-Circuit", // Each level of this skill increases your success chance in Contracts, Operations, and BlackOps that involve retirement by 5.5%
        "Digital Observer", // Each level of this skill increases your success chance in all Operations and BlackOps by 4%
        "Tracer", // Each level of this skill increases your success chance in all Contracts by 4%
        "Overclock", // Each level of this skill decreases the time it takes to attempt a Contract, Operation, and BlackOp by 1% (Max Level: 90)
        "Reaper", // Each level of this skill increases your effective combat stats for Bladeburner actions by 2%
        "Evasive System", // Each level of this skill increases your effective dexterity and agility for Bladeburner actions by 4%
        "Datamancer", // Each level of this skill increases your effectiveness in synthoid population analysis and investigation by 5%. This affects all actions that can potentially increase the accuracy of your synthoid population/community estimates.
        "Cyber's Edge", // Each level of this skill increases your max stamina by 2%
        "Hands of Midas", // Each level of this skill increases the amount of money you receive from Contracts by 10%
        "Hyperdrive", // Each level of this skill increases the experience earned from Contracts, Operations, and BlackOps by 10%
    ];
}

/** @param {NS} ns **/
export async function main(ns) {
    ns.disableLog("sleep");
    // State Change -> Health < 50% -> Healing
    // State Change -> Stamina < 50% -> Healing
    // State Change -> Health > 98% -> Ops
    // State Change -> Stamina > 98% -> Ops

    while(true) {
        var state = getState(ns);
        var nextState = getNextState(ns, state);
        if (nextState !== state) {
            changeState(ns, nextState);
        }

        // Spend points - pick randomly each tick. Should level mostly equally.
        var options = getOptions(ns);
        var toBuy = options[Math.floor(Math.random() * options.length)];
        var cost = ns.bladeburner.getSkillUpgradeCost(toBuy);
        if(ns.bladeburner.getSkillPoints() >= cost) {
            ns.bladeburner.upgradeSkill(toBuy);
        }

        await ns.sleep(500);
    }
}

/** @param {NS} ns **/
function getNextState(ns, state) {
    var shouldHeal = healthBelow(ns, 0.5);
    var shouldRest = staminaBelow(ns, 0.5);
    var fullyHealed = !healthBelow(ns, 0.95);
    var fullyRested = !staminaBelow(ns, 0.95);

    // 1st - Heal if we're hurt. We pay money, so no state change.
    // TODO: Support healing via task if we can't afford.
    if (shouldHeal) {
        ns.hospitalize();
        shouldHeal = healthBelow(ns, 0.95);
    }

    // 2nd - Calm the city. Should prevent runaway chaos.
    // RIP my chaos on 2/13: 9,371,617,329,222,234,000
    var isCityCrazy = !chaosBelow(ns, getChaosLimits(ns).max);
    var isCityPeaceful = chaosBelow(ns, getChaosLimits(ns).max);
    var keepCalming = state == STATE.CALM && !isCityPeaceful;
    if (isCityCrazy || keepCalming) {
        return STATE.CALM;
    }

    //ns.print(JSON.stringify({shouldHeal, shouldRest, fullyHealed, fullyRested, isCityPeaceful, isCityCrazy }));

    // 3rd - Get more contracts if we need them. Stamina will regen during this.
    var needContracts = ns.bladeburner.getActionCountRemaining(PRIMARY_TYPE, PRIMARY_NAME) < 5;
    if (needContracts) {
        return STATE.INCITE;
    }

    // 4th - Train, to both regen stamina and raise max stamina so it eventually regens as fast as we spend it.
    if (shouldRest) {
        return STATE.TRAIN;
    }

    // Stop resting/calming/whatever when we're good enough and resume primary activity.
    if (state === STATE.IDLE || fullyRested) {
        return STATE.CONTRACT;
    }

    // Otherwise, continue same activity.
    return state;

}

/**
 * @param {NS} ns 
 * @param {number} n 
 */
 function chaosBelow(ns, n) {
    return ns.bladeburner.getCityChaos(ns.bladeburner.getCity()) < n;
}

/**
 * @param {NS} ns 
 * @param {number} n 
 */
function staminaBelow(ns, n) {
    return ns.bladeburner.getStamina()[0] < ns.bladeburner.getStamina()[1] * n;
}

/**
 * @param {NS} ns 
 * @param {number} n 
 */
 function healthBelow(ns, n) {
    return ns.getPlayer().hp < ns.getPlayer().max_hp * n;
}

/**
 * @param {NS} ns 
 * @param {number} nextState 
 */
function changeState(ns, nextState) {
    ns.bladeburner.stopBladeburnerAction();
    switch(nextState) {
        case STATE.HEAL:
            ns.bladeburner.startAction("General", HEALING_OP);
            break;
        case STATE.CONTRACT:
            ns.bladeburner.startAction(PRIMARY_TYPE, PRIMARY_NAME);
            return;
        case STATE.CALM:
            ns.bladeburner.startAction("General", "Diplomacy");
            return;
        case STATE.INCITE:
            ns.bladeburner.startAction("General", "Incite Violence");
            return;
        case STATE.TRAIN:
            ns.bladeburner.startAction("General", "Training");
            return;
    }
}

/** @param {NS} ns **/
function getState(ns) {
    if (isIdle(ns)) {
        return STATE.IDLE;
    }

    if (isHealing(ns)) {
        return STATE.HEAL;
    }

    if (isTraining(ns)) {
        return STATE.TRAIN;
    }

    if (isCalming(ns)) {
        return STATE.CALM;
    }

    if(isInciting(ns)) {
        return STATE.INCITE;
    }

    // TODO: Needs to be accurate.
    return STATE.CONTRACT;

}

/** @param {NS} ns **/
function isIdle(ns) {
    let { name, type } = ns.bladeburner.getCurrentAction();
    return type === "Idle";
}

/** @param {NS} ns **/
function isHealing(ns) {
    let { name, type } = ns.bladeburner.getCurrentAction();
    return type === "General" && name === HEALING_OP;
}

/** @param {NS} ns **/
function isTraining(ns) {
    let { name, type } = ns.bladeburner.getCurrentAction();
    return type === "General" && name === "Training";
}

/** @param {NS} ns **/
function isCalming(ns) {
    let { name, type } = ns.bladeburner.getCurrentAction();
    return type === "General" && name === "Diplomacy";
}

/** @param {NS} ns **/
function isInciting(ns) {
    let { name, type } = ns.bladeburner.getCurrentAction();
    return type === "General" && name === "Incite Violence";
}

/**
 * Chaos limit is scaled by player strength.
 * @param {NS} ns
 */
function getChaosLimits(ns) {
    return {
        min: 1 * (getMinCombatSkill(ns) / 10),
        max: 5 * (getMinCombatSkill(ns) / 10)
    };
}

/**
 * Get the player's min combat skill
 * @param {NS} ns
 */
function getMinCombatSkill(ns) {
    return Math.min(ns.getPlayer().strength, Math.min(ns.getPlayer().defense, Math.min(ns.getPlayer().dexterity, ns.getPlayer().agility)));
}