import { awaitMoney } from 'lib.js';
import { univ } from "univ.js";
import { buyPrograms } from "buy-programs.js";

/** @param {NS} ns **/
export async function main(ns) {
	ns.disableLog("sleep");

	/* '-' is charcode 45, vs ALPHA > 60 */
	var stage = "-";
	if(ns.getPurchasedServers().length > 0) {
		stage = ns.getPurchasedServers().reduce((p, v) => {
			return p.charCodeAt(0) > v.charCodeAt(0) ? p : v;
		}, stage);
	}

	// Pass through switch is intentional.
	switch(stage.charAt(0)) {
		case '-':
			ns.print(`STAGE: -`);
			ns.rm("stock.txt", "home");
			ns.exec("market.js", "home", 1);
			await trainAsync('hack', 40);
			await deploy();

		case 'A':
			ns.print(`STAGE: A`);
			await buyPrograms(ns);
			await buyServers("A", 2**6, 2**12);

			await deploy();

			// Once we have the money for our first bigger server, kill all the running scripts
			await awaitMoney(ns.getPurchasedServerCost(2**12));
			ns.getPurchasedServers()
				.filter(host => host.startsWith("A") || host.startsWith("a"))
				.forEach(host => {
					ns.scriptKill("core.js", host);
					ns.deleteServer(host);
				});

		case 'B':
			ns.print(`STAGE: B`);
			await buyServers("B", 2**12, 2**16);
				
			// 250m
			await awaitMoney(250 * 10**6);
			ns.purchaseProgram("sqlinject.exe");

			await deploy();

			await awaitMoney(2 * ns.getPurchasedServerCost(2**16));
			ns.getPurchasedServers()
				.filter(host => host.startsWith("B"))
				.forEach(host => {
					ns.scriptKill("core.js", host);
					ns.deleteServer(host);
				});

		case 'C':
			ns.print(`STAGE: C`);
			await buyServers("C", 2**16, 2**20);

			// only wait if we've stacked our servers. otherwise just move on
			if(ns.getPurchasedServers().length == ns.getPurchasedServerLimit()) {
				await awaitMoney(2 * ns.getPurchasedServerCost(2**20));
			}

			ns.getPurchasedServers()
				.filter(host => host.startsWith("C"))
				.forEach(host => {
					ns.scriptKill("core.js", host);
					ns.deleteServer(host);
				});

		case 'D':
			ns.print(`STAGE: D`);
			await buyServers("D", 2**20);

			// BETTER strat:
			// Start trading immediately after C.
			// Get total market size, wait for networth to equal 50% market.
			// Redeploy jgn.js to maximize upgrading hacking skill.
			// Buy max servers whenever networth is 50% market + 730m.
			// Potential downside: market moves less?

			ns.scriptKill("market.js", "home");
			ns.exec("market.js", "home", 1, "trade");
			ns.tprint("Servers maxxed, start trading!!!");

		// case 'E':
		// 	ns.tprint(`STAGE: E... wait a sec...`);
		// case 'F':
		// 	ns.tprint(`STAGE: F! for Factions!`);



		default:
			ns.tprint('Deployment complete. Program terminating');
			break;
	}
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
	var pid = ns.run("deploy.js", 1);
	if(pid > 0) {
		return Promise.resolve(pid);
	}
	else {
		return Promise.reject("Failed to start the deploy script.");
	}
}