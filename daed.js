import { format, formatTime } from 'lib.js';

/** @param {NS} ns **/
export async function main(ns) {
	// join Daedalus
	await awaitMoney(ns, 100_000_000_000);
	
	while(ns.checkFactionInvitations().join("").indexOf("aedalus") === -1 && ns.getPlayer().factions.join("").indexOf("aedalus") === -1) {
		await ns.sleep(3000);
	}

	ns.joinFaction("Daedalus");

	ns.exec("hacknet.js", "home", 1);
	ns.spawn("faction.js", 1, "Daedalus");
}

async function awaitMoney(ns, n) {
	var start = performance.now();
	ns.scriptKill("money.js", "home");
	ns.run("money.js", 1, n);
	while(ns.getPlayer().money < n) {
		ns.print(`Waiting for \$ ${format(n - ns.getPlayer().money)} more money... (${formatTime(performance.now() - start)} elapsed)`);
		await ns.sleep(15000);
	}
	return Promise.resolve();
}