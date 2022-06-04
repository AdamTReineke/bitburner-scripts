/** @param {NS} ns **/
export async function main(ns) {
	if(ns[0] === undefined)
		ns.disableLog("ALL");

	while(true) {
		var forecast = ns.stock.getForecast("JGN");
		if(Math.random() < 0.6) {
			await ns.grow("joesguns", { stock: forecast > 0.5 });
			await ns.weaken("joesguns");
		}
		else {
			await ns.hack("joesguns", { stock: forecast < 0.5 });
			await ns.weaken("joesguns");
		}
	}
}