/** @param {NS} ns */
export async function main(ns) {
	while(true) {
		ns.hacknet.spendHashes("Sell for Corporation Funds");

		await ns.sleep(15000);
	}
}