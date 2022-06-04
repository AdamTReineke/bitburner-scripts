import { awaitMoney } from "./lib.js";

/** @param {NS} ns **/
export async function main(ns) {
    if(ns.getPlayer().factions.length === 0) {
        throw new Error("ERROR: No factions joined.");
    }

    const AUG_NAME = "NeuroFlux Governor";
    const FACTION = ns.args[0] || getHighestRepFaction(ns);

    var i = 0;
    while(true) {
        var reqRep = ns.getAugmentationRepReq(AUG_NAME);
        var price = ns.getAugmentationPrice(AUG_NAME);

        // Buy
        if (hasRep(ns, FACTION, reqRep) && hasMoney(ns, price)) {
            i++;
            ns.purchaseAugmentation(FACTION, AUG_NAME);

            if(ns.getPlayer().hacking > 100000) {
                // temp: stop after buying 255
                return;
            }
            if(i > 9 && ns.getPlayer().hacking > 25000) {
                ns.kill("install.js");
                ns.spawn("install.js");
            }
            continue;
        }

        // Donate money as we earn it until we have enough rep
        while(!hasRep(ns, FACTION, reqRep)) {
            ns.donateToFaction(FACTION, ns.getPlayer().money);
            await ns.sleep(1000);
        }

        // Wait 15s at a time for more money.
        while (!hasMoney(ns, price)) {
            await awaitMoney(price, ns);
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