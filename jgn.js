/** @param {NS} ns **/
export async function main(ns) {
	ns.disableLog("ALL");
	while(true) {
		await ns.grow("joesguns", { stock: true });
		await ns.weaken("joesguns");
		await ns.hack("joesguns");
		await ns.weaken("joesguns");
	}
}