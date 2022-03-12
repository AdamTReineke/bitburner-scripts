import { format } from './lib.js';

/** @param {NS} ns **/
export async function main(ns) {
    while (true) {
        if(ns.hacknet.hashCost("Improve Gym Training") < 700) {
            workOut(ns);
        }
        else {
            improveHacknet(ns);
        }
        await ns.sleep(1000);
    }
};

/** @param {NS} ns **/
function workOut(ns) {
    ns.hacknet.spendHashes("Improve Gym Training");
}

/** @param {NS} ns **/
function improveHacknet(ns) {
    ns.hacknet.spendHashes("Sell for Money");

    var nodes = ns.hacknet.numNodes();
    var production = 0;
    for (var i = 0; i < nodes; i++) {
        // Level is weaker, so we lie about how much it costs once we pass 20.
        var levelScalar = (ns.hacknet.getNodeStats(i).level > 20) ? 3 : 1; // todo: sq rt? log based?
        if (ns.hacknet.getLevelUpgradeCost(i, 1) * levelScalar <= ns.getPlayer().money) {
            ns.hacknet.upgradeLevel(i, 1);
        }

        if(ns.hacknet.getCoreUpgradeCost(i, 1) <= ns.getPlayer().money) {
            ns.hacknet.upgradeCore(i, 1);
        }
        if(ns.hacknet.getRamUpgradeCost(i, 1) <= ns.getPlayer().money) {
            ns.hacknet.upgradeRam(i, 1);
        }
        production += ns.hacknet.getNodeStats(i).production;
    }
    ns.print(`${nodes} nodes creating ${format(production)} / sec.`);

    if (ns.hacknet.numNodes() < ns.hacknet.maxNumNodes()) {
        ns.hacknet.purchaseNode();
    }
}