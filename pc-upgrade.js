/** @param {NS} ns **/
export async function main(ns) {
	ns.disableLog("sleep");
	ns.disableLog("upgradeHomeRam");
	while(true) {
		if(ns.upgradeHomeRam()) {
			ns.print("Upgraded RAM...");
			ns.run("deploy.js", 1, "home", "jgn-dumb.js");
		}

		await ns.sleep(1000);
	}

}