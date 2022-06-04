/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog("sleep");
	while(true) {
		ns.hacknet.spendHashes("Exchange for Bladeburner SP");
		await ns.sleep(10000);
	}

}