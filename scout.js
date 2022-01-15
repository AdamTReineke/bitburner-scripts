import { format, formatTime, formatPercent, pad } from "lib.js";

/** @param {NS} ns **/
export async function main(ns) {
	if(!ns.fileExists("Formulas.exe")) {
		ns.purchaseProgram("Formulas.exe");
	}

	var scannedNames = new Set();
	var allNames = new Set();
	var scannedFromDict = {};
	allNames.add("home");

	var iter = allNames.values();
	while(allNames.size > scannedNames.size) {
		var toScan = iter.next();
		if(!scannedNames.has(toScan.value)) {
			scannedNames.add(toScan.value);
			ns.scan(toScan.value).forEach(i => {
				if(scannedFromDict[i] === undefined) {
					scannedFromDict[i] = toScan.value;
				}
				allNames.add(i);
			});
		}
	}

	scannedNames = [...scannedNames.values()];

	var best = [];
	scannedNames.forEach((host) => {
		var detail = {
			host,
			hasRoot: ns.hasRootAccess(host),
			reqHack: ns.getServerRequiredHackingLevel(host),
			// reqPort: ns.getServerNumPortsRequired(host),
			money: ns.getServerMoneyAvailable(host),
			maxMoney: ns.getServerMaxMoney(host),
			timeToWeak: ns.getWeakenTime(host),
			timeToGrow: ns.getGrowTime(host),
			hackTime: ns.formulas.hacking.hackTime(ns.getServer(host), ns.getPlayer()),
			hackChance: ns.formulas.hacking.hackChance(ns.getServer(host), ns.getPlayer()),
			totalRam: ns.getServerMaxRam(host),
			usedRam: ns.getServerUsedRam(host)
		};

		if(detail.host.indexOf("adam") !== 0) {
			if(ns.args[0]) {
				if (detail.maxMoney * 1000 < ns.getPlayer().money) return;
				if (detail.reqHack > ns.getPlayer().hacking) return;
			}
			best.push(detail);
		}
	});

	best = best.sort((a, b) => {
		return b.reqHack - a.reqHack;
	}).filter(h => {
            return h.reqHack < ns.getPlayer().hacking * 0.5
                && ns.hasRootAccess(h.host)
	});

	
	if(ns.getPlayer().hacking > 250) {
		best = best.filter((h) => {
			return ns.getServerMaxMoney(h.host) > 20_000_000;
		});
	}


	printDetail(ns, best, scannedFromDict);
	//printTargets(ns, best.filter((h) => h.maxMoney > 0));

	await ns.sleep(10000);
}

function printTargets(ns, arr) {
	ns.tprint("var targets = [");
	arr.forEach(a => {
		ns.tprint(`    { host: "${a.host}", hack: ${a.reqHack} },`);
	});
	ns.tprint("]");
}

function printDetail(ns, arr, scannedFromDict) {
	ns.tprint(
		pad("Host", 20) +
		pad("Parent", 20) + 
		pad("Root?", 8) +
		pad("RAM", 12) +
		pad("Used RAM", 12) +
		pad("Hack", 9) +
		pad("Money", 12) +
		pad("Max $", 12) +
		pad("Weak", 12) +
		pad("Grow", 12) +
		pad("Hack", 12) +
		pad("Hack Pct", 12)
	);
	arr.forEach(a => {
		ns.tprint(
			pad(a.host, 20) +
			pad(scannedFromDict[a.host], 20) +
			pad(a.hasRoot ? "Y" : "N", 8) +
			pad(format(a.totalRam), 12) +
			pad(format(a.usedRam), 12) +
			pad(format(a.reqHack), 9) +
			pad(format(a.money), 12) +
			pad(format(a.maxMoney), 12) +
			pad(formatTime(a.timeToWeak), 12) +
			pad(formatTime(a.timeToGrow), 12) +
			pad(formatTime(a.hackTime), 12) +
			pad(formatPercent(a.hackChance), 12)
		);
	});
}