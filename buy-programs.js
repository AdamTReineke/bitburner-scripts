import { awaitMoney } from "lib.js";

/** @param {NS} ns **/
export async function main(ns) {
	buyPrograms(ns);
}

/**
 * @param {NS} ns 
 * @param {Function} [cb]
 */
export async function buyPrograms(ns, cb) {
	// buy darknet
	await awaitMoney(200 * 10**3, ns);
	ns.purchaseTor();
	if(cb) {
		await cb();
	}

	// 500k
	await awaitMoney(500 * 10**3, ns);
	ns.purchaseProgram("brutessh.exe");
	if(cb) {
		await cb();
	}

	// 1.5m
	await awaitMoney(1.5 * 10**6, ns)
	ns.purchaseProgram("ftpcrack.exe");
	if(cb) {
		await cb();
	}

	// 5m
	await awaitMoney(5 * 10**6, ns);
	ns.purchaseProgram("relaysmtp.exe");
	if(cb) {
		await cb();
	}

	// 30m
	await awaitMoney(30 * 10**6, ns);
	ns.purchaseProgram("httpworm.exe");
	if(cb) {
		await cb();
	}
}