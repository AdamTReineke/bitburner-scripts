/**
 * 
 * @param {NS} ns 
 * @returns {{ scannedNames: string[], scannedFromDict: Map<string, string>}}
 */
export function getServerNames(ns) {
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
export function getPathToServer(scannedFromDict, dest) {
	var stack = [dest];

	while (stack[0] !== "home") {
		stack.unshift(scannedFromDict.get(stack[0]));
	}

	return stack;
}