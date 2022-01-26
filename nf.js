import { awaitMoney } from "./play.js";

/** @param {NS} ns **/
export async function main(ns) {
    if(ns.getPlayer().factions.length === 0) {
        throw new Error("ERROR: No factions joined.");
    }

    const AUG_NAME = "NeuroFlux Governor";
    const FACTION = getHighestRepFaction(ns);

    while(true) {
        var reqRep = ns.getAugmentationRepReq(AUG_NAME);
        var price = ns.getAugmentationPrice(AUG_NAME);

        // Buy
        if (hasRep(ns, FACTION, reqRep) && hasMoney(ns, price)) {
            ns.purchaseAugmentation(FACTION, AUG_NAME);
            continue;
        }

        // Wait 15s at a time for more money.
        while (!hasMoney(ns, price)) {
            await awaitMoney(price, ns);
        }

        // Donate 10b at a time until we have enough rep
        while(!hasRep(ns, FACTION, reqRep)) {
            await awaitMoney(250_000_000_000, ns);
            ns.donateToFaction(FACTION, 250_000_000_000);
            await ns.sleep(100);
        }
    }
}

function hasRep(ns, faction, rep) {
    return ns.getFactionRep(faction) >= rep;
}

function hasMoney(ns, price) {
    return ns.getPlayer().money >= price;
}

/**
 * 
 * @param {NS} ns 
 * @returns {string}
 */
function getHighestRepFaction(ns) {
    return ns.getPlayer().factions.reduce((pv, cv) => {
        if(pv === "")
            return cv;
        else
            return ns.getFactionRep(pv) > ns.getFactionRep(cv) ? pv : cv;
    }, "");
}