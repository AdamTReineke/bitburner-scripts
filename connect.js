/** @param {NS} ns **/
export async function main(ns) {
	var { scannedNames, scannedFromDict } = getServerNames(ns);
	/**
	 * @type {string}
	 * Set the starting node to the first arg. Type coerce and avoid undefined arg.
	 */
	var start = "" + (ns.args[0] || "");

	var matches = scannedNames.filter(v => v.startsWith(start.toLocaleUpperCase()) || v.startsWith(start.toLocaleLowerCase()));

	
	if (matches.length > 1) {
		ns.tprintf(`Found ${matches.length}:`);
		ns.tprintf(matches
			.filter(host => !host.startsWith("AUTO-"))
			.join(", ")
		);
	}


	if (matches.length === 1) {
		ns.tprintf("One match found... connecting directly.");

		// Walk the servers
		getPathToServer(scannedFromDict, matches[0]).forEach((host) => {
			ns.connect(host);
		});
	}
	
	if (matches.length === 0) {
		ns.tprintf(`List of all servers:`);
		ns.tprintf(scannedNames
			.filter(host => !host.startsWith("AUTO-"))
			.sort((a, b) => a.toLocaleLowerCase().localeCompare(b.toLocaleLowerCase()))
			.join(", ")
		);
	}
}

/**
 * 
 * @param {NS} ns 
 * @returns {{ scannedNames: string[], scannedFromDict: Map<string, string>}}
 */
function getServerNames(ns) {
	var scannedNamesSet = new Set();
	/**
	 * @type {Set<string>} All server names, as strings.
	 */
	var allNames = new Set();
	/**
	 * @type {Map<string, string>}
	 */
	var scannedFromMap = new Map();
	allNames.add("home");

	var iter = allNames.values();
	while (allNames.size > scannedNamesSet.size) {
		/** @type {string} */
		var toScan = iter.next().value;
		if (!scannedNamesSet.has(toScan)) {
			scannedNamesSet.add(toScan);
			ns.scan(toScan).forEach(i => {
				if (!scannedFromMap.has(i)) {
					scannedFromMap.set(i, toScan);
				}
				allNames.add(i);
			});
		}
	}
	return {
		scannedNames: [...scannedNamesSet.values()],
		scannedFromDict: scannedFromMap
	};
}

/**
 * 
 * @param {Map<string,string>} scannedFromDict
 * @param {string} dest
 * @returns {string[]}
 */
function getPathToServer(scannedFromDict, dest) {
	var stack = [dest];

	while (stack[0] !== "home") {
		stack.unshift(scannedFromDict.get(stack[0]));
	}

	return stack;
}