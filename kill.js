/** @type {NS} ns */
var ns;
/** @param {NS} ns **/
export async function main(NS) {
	ns = NS;

	var host = ns.args[0] || "home";

	var procs = ns.ps(host);
	procs.forEach(proc => {
		if(proc.filename.startsWith(ns.args[1] || "core.js")) {
			ns.kill(proc.filename, host, ...proc.args);
		}
	});
}