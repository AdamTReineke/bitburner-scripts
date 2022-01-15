/** @param {NS} ns **/
export async function main(ns) {
	while(true) {
		await ns.hack("joesguns");
		await ns.weaken("joesguns");
		await ns.grow("joesguns");
		await ns.weaken("joesguns");
	}
}