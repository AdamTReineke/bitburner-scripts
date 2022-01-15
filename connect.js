import { format, formatTime, formatPercent, pad } from "lib.js";

/** @type {NS} ns */
var ns;

/** @param {NS} ns **/
export async function main(NS) {
	ns = NS;
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
	if ([...scannedNames].indexOf(ns.args[0]) === -1) {
		ns.tprint("Bad name, cannot connect.");
		ns.tprint(scannedNames.join(","));
		return;
	}

	//ns.tprint(JSON.stringify(scannedFromDict));
	
	//ns.tprint(Object.keys(scannedFromDict).map((host => "home;" + connectStr(scannedFromDict, host) + "backdoor;\n")).join(""));
	connectArr(scannedFromDict, ns.args[0]).forEach((host) => {
		ns.connect(host);
	});
}

function connectArr(scannedFromDict, dest) {
	var stack = [dest];

	while(stack[0] !== "home") {
		stack.unshift(scannedFromDict[stack[0]]);
	}

	return stack;
}