import { format, formatTime, pad } from "lib.js";

var SAMPLE_SIZE = 60;
var TICK_MS = 60 * 1000;

/** @param {NS} ns **/
export async function main(ns) {
	ns.disableLog("sleep");
	ns.clearLog();
	var vals = [];

	// ns.tprint(
	// 	pad("Now Money", 14),
	// 	pad("Old Money", 14),
	// 	pad("Diff", 14),
	// 	pad("Per Tick", 14),
	// 	pad("Per MS", 14),
	// 	pad("Left", 14),
	// 	pad("Remaining MS", 14),
	// 	pad("(as Time)", 14),
	// )

	while(true) {
		var money = ns.getPlayer().money;
		var goal = ns.args[0] || Number.POSITIVE_INFINITY;

		if(money >= goal) {
			return;
		}

		while(vals.length > 0 && money < vals[0]) {
			vals.shift();
		}

		if(vals.push(money) >= SAMPLE_SIZE) {
			vals.shift();
		}

		var deltaMoney = money - vals[0];
		var changePerTick = deltaMoney / vals.length;
		
		var moneyPerMs = changePerTick / TICK_MS;
		var left = goal - money;
		var remainingMs = (goal - money) / moneyPerMs;

		// ns.tprint(
		// 	pad(format(money), 14),
		// 	pad(format(vals[0]), 14),
		// 	pad(format(deltaMoney), 14),
		// 	pad(format(changePerTick), 14),
		// 	pad(format(moneyPerMs), 14),
		// 	pad(format(left), 14),
		// 	pad(format(remainingMs), 14),
		// 	pad(formatTime(remainingMs), 14),
		// );

		ns.toast(`${formatTime(remainingMs)} until spend \$ ${format(goal)}`, "info", 59000);
		ns.toast(`\$ ${format(moneyPerMs * 60 * 60 * 1000)} / h`, "info", 59000);

		ns.print(`\$ ${format(moneyPerMs * 60 * 60 * 1000)} / h, ${formatTime(remainingMs)} remaining`);

		await ns.sleep(TICK_MS);
	}
}