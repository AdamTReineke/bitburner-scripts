import { format, formatTime } from 'lib.js';
import { univ } from "univ.js";

/** @type {NS} */
var ns;

/** @param {NS} NS **/
export async function main(NS) {
    ns = NS;
	ns.disableLog("sleep");

	ns.print(`STAGE: -`);
	ns.rm("stock.txt", "home");
	ns.exec("market.js", "home", 1);
	await trainAsync('hack', 100);
	await deploy();

	await buyPrograms();

	await deploy();

	// 250m
	await awaitMoney(250_000_000);
	ns.purchaseProgram("sqlinject.exe");

	await deploy();

	// join Daedalus
	await awaitMoney(100_000_000_000);
	
	while(ns.checkFactionInvitations().join("").indexOf("aedalus") === -1 && ns.getPlayer().factions.join("").indexOf("aedalus") === -1) {
		await ns.sleep(3000);
	}

	ns.joinFaction("Daedalus");
	ns.workForFaction("Daedalus", "Hacking contracts", false);

	await buyServers("D", 2**20);

	/*
	while(ns.getFactionRep("Daedalus") < 2_500_000) {
		ns.workForFaction("Daedalus", "Hacking contracts", false);
		ns.donateToFaction("Daedalus", ns.getPlayer().money);
		await ns.sleep(60000);
	}

	ns.purchaseAugmentation("Daedalus", "The Red Pill");
	ns.tprint("READY TO RESET!!!");
	*/
}

async function buyPrograms() {
	// buy darknet
	await awaitMoney(200 * 10**3);
	ns.purchaseTor();

	// 500k
	await awaitMoney(500 * 10**3);
	ns.purchaseProgram("brutessh.exe");

	// 1.5m
	await awaitMoney(1.5 * 10**6)
	ns.purchaseProgram("ftpcrack.exe");

	// 5m
	await awaitMoney(5 * 10**6);
	ns.purchaseProgram("relaysmtp.exe");

	// 30m
	await awaitMoney(30 * 10**6);
	ns.purchaseProgram("httpworm.exe");

}

async function buyServers(prefix, ram, nextRam) {
	// Buy initial servers as money builds up
	while(ns.getPurchasedServers().length < ns.getPurchasedServerLimit()) {
		var cost = ns.getPurchasedServerCost(ram);

		// Skip if we're too rich
		if(nextRam !== undefined && ns.getPurchasedServerCost(nextRam) < ns.getPlayer().money) {
			ns.tprint('Too rich...');
			return Promise.resolve();
		}
		await awaitMoney(cost);

		var serverName = `${prefix}-${ns.getPurchasedServers().length}`;
		serverName = ns.purchaseServer(serverName, ram);
		ns.run("deploy.js", 1, serverName);
		await ns.sleep(prefix === "A" ? 3000 : 15000);
	}

	return Promise.resolve();
}

async function awaitMoney(n) {
	var start = performance.now();
	ns.scriptKill("money.js", "home");
	ns.run("money.js", 1, n);
	while(ns.getPlayer().money < n) {
		ns.print(`Waiting for \$ ${format(n - ns.getPlayer().money)} more money... (${formatTime(performance.now() - start)} elapsed)`);
		await ns.sleep(15000);
	}
	return Promise.resolve();
}

/**
 * Trains a skill async until the desired level.
 */
async function trainAsync(skill, level) {
	var { university, course }  = univ[ns.getPlayer().city][skill];

	if(ns.universityCourse(university, course) !== true) {
		return Promise.reject(`Failed to start training, is resolved ${university} -> ${course} missing?`);
	}

	while(level > ns.getPlayer().hacking) {
		await ns.sleep(5000);
	}
	ns.stopAction();

	ns.tprint(`Finished training ${skill} to ${level}.`);

	return Promise.resolve(ns.getPlayer().hacking);
}

async function deploy() {
	if(ns.isRunning("deploy.js")) {
		return;
	}

	// deploy.js will log for the deployment.
	var pid = ns.run("deploy.js", 1, "-f", "jgn.js");
	if(pid > 0) {
		return Promise.resolve(pid);
	}
	else {
		return Promise.reject("Failed to start the deploy script.");
	}
}