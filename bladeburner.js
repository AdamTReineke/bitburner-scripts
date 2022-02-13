const HEALING_OP = "Hyperbolic Regeneration Chamber";

const STATE = {
    IDLE: 0,
    HEAL: 1,
    CONTRACT: 2,
    TRAIN: 3
}
function readable(n) {
    switch(n) {
        case 0: return "Idle";
        case 1: return "Healing";
        case 2: return "Contract";
        case 3: return "Training";
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
            ns.print(new Date().toLocaleTimeString(), "Changing! " + readable(nextState));
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

    // Heal if we're hurt
    if (shouldHeal) {
        ns.hospitalize();
        shouldHeal = healthBelow(ns, 0.95);
    }

    if (shouldRest) {
        return STATE.TRAIN;
    }

    // Stop healing when we're full
    const doneHealing = (state === STATE.HEAL && fullyHealed);
    const doneResting = (state === STATE.TRAIN && fullyRested);
    if (state === STATE.IDLE || doneHealing || doneResting) {
        return STATE.CONTRACT;
    }

    // TODO: If city chaos > N - go to idle, we've pushed the city too high.

    // TODO: If city chaos < 2 - go to idle, we've diplomacied enough.

    // Otherwise, continue same activity.
    return state;

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
            ns.hospitalize();
            break;
        case STATE.CONTRACT:
            if(ns.bladeburner.getActionCountRemaining("Contracts", "Tracking") > 25) {
                ns.bladeburner.startAction("Contracts", "Tracking");
            }
            else if (ns.bladeburner.getCityChaos(ns.bladeburner.getCity()) < 4) {
                ns.bladeburner.startAction("General", "Incite Violence");
            }
            else {
                ns.bladeburner.startAction("General", "Diplomacy");
            }
            break;
        case STATE.TRAIN:
            ns.bladeburner.startAction("General", "Training");
            break;
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

function isTraining(ns) {
    let { name, type } = ns.bladeburner.getCurrentAction();
    return type === "General" && name === "Training";
}