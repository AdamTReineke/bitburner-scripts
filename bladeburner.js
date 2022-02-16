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

        // Spend points
        var cost = ns.bladeburner.getSkillUpgradeCost("Short-Circuit");
        if(ns.bladeburner.getSkillPoints() >= cost) {
            ns.bladeburner.upgradeSkill("Short-Circuit");
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
    var isCityCrazy = !chaosBelow(ns, 8);
    var isCityPeaceful = chaosBelow(ns, 3);
    var keepCalming = state == STATE.CALM && !isCityPeaceful;
    if (isCityCrazy || keepCalming) {
        return STATE.CALM;
    }

    // 3rd - Get more contracts if we need them. Stamina will regen during this.
    var needContracts = ns.bladeburner.getActionCountRemaining("Contracts", "Tracking") < 5;
    if (needContracts) {
        return STATE.INCITE;
    }

    // 4th - Train, to both regen stamina and raise max stamina so it eventually regens as fast as we spend it.
    if (shouldRest) {
        return STATE.TRAIN;
    }

    // Stop healing when we're full
    // Resume contracts.
    if (state === STATE.IDLE || (fullyHealed && fullyRested && isCityPeaceful)) {
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
            ns.bladeburner.startAction("Contracts", "Tracking");
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
