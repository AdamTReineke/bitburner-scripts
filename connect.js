import { getServerNames, getPathToServer } from "./lib-server.js";

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
			.sort((a, b) => a.toLocaleLowerCase().localeCompare(b.toLocaleLowerCase()))
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
