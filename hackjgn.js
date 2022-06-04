import { format } from 'lib.js';

/** @param {NS} ns **/
export async function main(ns) {
	ns.disableLog("sleep");
	ns.disableLog("getServerMaxMoney");
	ns.disableLog("getServerMinSecurityLevel");
	while(true) {
		if(ns.getServerMinSecurityLevel("joesguns") > 1
			&& ns.hacknet.spendHashes("Reduce Minimum Security", "joesguns")) {
			ns.print(new Date().toLocaleTimeString());
			ns.print(`Purchased, now at ${ns.hacknet.getHashUpgradeLevel("Reduce Minimum Security")}.`);
			ns.print(ns.getServerMinSecurityLevel("joesguns"));
		} else if (
			//ns.getServerMinSecurityLevel("joesguns") < 1.1 &&
			ns.hacknet.spendHashes("Increase Maximum Money", "joesguns")
		) {
			ns.print(new Date().toLocaleTimeString());
			ns.print(`Purchased, now at ${ns.hacknet.getHashUpgradeLevel("Increase Maximum Money")}.`);
			ns.print(`joesguns max money: ${format(ns.getServerMaxMoney("joesguns"))}`);
		}
		await ns.sleep(500);
	}
}