/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog("sleep");
	while(true) {
		var stats = ns.hacknet.getNodeStats(0);

		for(var i = 0; i < ns.hacknet.numNodes(); i++) {
			if(ns.hacknet.getNodeStats(i).level < stats.level) {
				ns.hacknet.upgradeLevel(i, 1);
			}
			if(ns.hacknet.getNodeStats(i).ram < stats.ram) {
				ns.hacknet.upgradeRam(i, 1);
			}
			if(ns.hacknet.getNodeStats(i).cores < stats.cores) {
				ns.hacknet.upgradeCore(i, 1);
			}
		}

		await ns.sleep(30);
	}
}