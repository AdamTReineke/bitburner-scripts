import { format } from './lib.js';

/** @param {NS} ns **/
export async function main(ns) {
    ns.disableLog("sleep");
    while (true) {
        if(ns.args[0] === "gym" && ns.hacknet.hashCost("Improve Gym Training") < 700) {
            workOut(ns);
        }
        else {
            improveHacknet(ns);
        }
        await ns.sleep(100);
    }
};

/** @param {NS} ns **/
function workOut(ns) {
    ns.hacknet.spendHashes("Improve Gym Training");
}

/** @param {NS} ns **/
function improveHacknet(ns) {
    var nodes = ns.hacknet.numNodes();
    var production = 0;

    for (var i = 0; i < nodes; i++) {
        // Unblock first by buying more cache
        if((ns.hacknet.hashCapacity() * 0.8) < ns.hacknet.numHashes() // need more storage
            && ns.hacknet.getCacheUpgradeCost(i, 1) < ns.getPlayer().money // have money
        ) {
            ns.hacknet.upgradeCache(i, 1);
        }

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

    if(production > 5200) {
        ns.spawn("nf.js", 1, "ECorp");
    }

    if (ns.hacknet.numNodes() < ns.hacknet.maxNumNodes()) {
        ns.hacknet.purchaseNode();
    }
}