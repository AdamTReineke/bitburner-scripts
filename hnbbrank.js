/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog("sleep");
	while(true) {
		ns.hacknet.spendHashes("Exchange for Bladeburner Rank");
		await ns.sleep(1000);
	}

}