/** @param {NS} ns **/
export async function main(ns) {
	if(ns[0] === undefined)
		ns.disableLog("ALL");

	while(true) {
		if(Math.random() < 0.64) {
			await ns.grow("joesguns");
			await ns.weaken("joesguns");
		}
		else {
			await ns.hack("joesguns");
			await ns.weaken("joesguns");
		}
	}
}