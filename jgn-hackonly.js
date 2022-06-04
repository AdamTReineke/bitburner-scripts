/** @param {NS} ns **/
export async function main(ns) {
	if(ns[0] === undefined)
		ns.disableLog("ALL");

	while(true) {
		await ns.hack("joesguns");
		await ns.weaken("joesguns");
	}
}