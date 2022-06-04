import { format } from "lib.js";

/** @type {NS} ns */
let ns;
var fileToRun = "core.js";
var totalProcs;
var totalThreads;
var THREADS_PER_PROCESS;

/** @param {NS} NS **/
export async function main(NS) {
	ns = NS;
	//THREADS_PER_PROCESS = ns.getPlayer().hacking < 4000 ? Math.min(500, Math.max(ns.getPlayer().hacking / 2, 250)) : 1500;
	THREADS_PER_PROCESS = 50000;
	
	totalThreads = 0;
	totalProcs = 0;

	// change file targeted. all subsquent args are passed to this file.
	if(ns.args[1]) {
		ns.tprint(ns.args[1]);
		fileToRun = ns.args[1];
	}

	// Single Deploy
	if(ns.args[0] && ns.args[0] !== "-f") {
		await smash(getDetails(ns.args[0]));
		ns.tprint(`Deployed ${totalThreads} threads of ${fileToRun} on ${ns.args[0]}`);
		return;
	}

	// Full Deploy
	var best = getAllHosts().map(host => getDetails(host));
	for(var i = 0; i < best.length; i++) {
		await smash(best[i]);
	}
	ns.tprint(`${fileToRun} deployed ${format(totalProcs)} processes with ${format(totalThreads)} threads. Target ${THREADS_PER_PROCESS} TPP, actual ${format(totalThreads/totalProcs)} TPP.`);
}

function getAllHosts() {
	var scannedNames = new Set();
	var allNames = new Set();
	allNames.add("home");

	var iter = allNames.values();
	while(allNames.size > scannedNames.size) {
		var toScan = iter.next();
		if(!scannedNames.has(toScan.value)) {
			scannedNames.add(toScan.value);
			ns.scan(toScan.value).forEach(i => allNames.add(i));
		}
	}
	return [...scannedNames.values()];
}

async function smash(host) {
	if(!host.hasRoot)
		getRoot(host);

	var now = performance.now();
	if(host.hasRoot) {
		if(host.host !== "home") {
			ns.killall(host.host);
		}
		if(host.host.indexOf("hacknet-node") === 0) {
			return;
		}

		await ns.scp("lib.js", "home", host.host);
		await ns.scp(fileToRun, "home", host.host);
		
		var scriptRam = ns.getScriptRam(fileToRun, "home");
		var threads = Math.floor(host.ram / scriptRam);

		var ags = [];
		if(ns.args.length > 2) {
			ags = [...ns.args];
			ags.shift();
			ags.shift();
		}

		if(threads > 0 && threads < THREADS_PER_PROCESS && host.host !== "home") {
			ns.exec(fileToRun, host.host, threads, ...ags);
			totalThreads += threads;
			totalProcs++;
		}
		else if(threads > 0) {
			while(ns.exec(fileToRun, host.host, THREADS_PER_PROCESS, ...ags, Math.random()) > 0) {
				totalThreads += THREADS_PER_PROCESS;
				totalProcs++;
				if(performance.now() - now > 100) {
					await ns.sleep(30);
				}
			}
		}

		var remainingRam = host.ram - ns.getServerUsedRam(host.host);
		var remainingThreads = Math.floor( remainingRam / scriptRam );
		if(remainingThreads > 0 && host.host !== "home") {
			ns.exec(fileToRun, host.host, remainingThreads, ...ags, Math.random());
		}

		await ns.sleep(30);
	}
}

function getRoot(host) {
	try {
		if (ns.fileExists("BruteSSH.exe", "home")) ns.brutessh(host.host);
		if (ns.fileExists("FTPCrack.exe", "home")) ns.ftpcrack(host.host);
		if (ns.fileExists("relaySMTP.exe", "home")) ns.relaysmtp(host.host);
		if (ns.fileExists("HTTPWorm.exe", "home")) ns.httpworm(host.host);
		if (ns.fileExists("SQLInject.exe", "home")) ns.sqlinject(host.host);
		ns.nuke(host.host);
		host.hasRoot = true;
	}
	catch (e) {
		ns.print(`failed to hack ${host.host}: ${JSON.stringify(e, undefined, 2)}`);
	}
}

function getDetails(host) {
	return {
		host,
		hasRoot: ns.hasRootAccess(host),
		reqHack: ns.getServerRequiredHackingLevel(host),
		reqPort: ns.getServerNumPortsRequired(host),
		money: ns.getServerMoneyAvailable(host),
		ram: ns.getServerMaxRam(host),
	};
}