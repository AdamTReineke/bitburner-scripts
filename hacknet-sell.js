/** @param {NS} ns **/
export async function main(ns) {
	ns.disableLog("ALL")
	while(true) {
		while(ns.hacknet.numHashes() > 4) {
			ns.hacknet.spendHashes("Sell for Money");
		}

		await ns.sleep(250);
	}
}