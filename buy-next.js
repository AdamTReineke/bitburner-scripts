/** @param {NS} ns **/
export async function main(ns) {
	while(true) {
		if(ns.upgradeHomeRam()) {
			ns.exec("deploy.js", "home", 1, "home", "jgn-smart.js");
		}

		await ns.sleep(60000);
	}
}