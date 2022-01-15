/** @param {NS} ns **/
export async function main(ns) {
	const symbols = ns.stock.getSymbols();
	symbols.forEach(s => {
		if(ns.stock.getPosition(s)[0] > 0) {
			ns.stock.sell(s, ns.stock.getPosition(s)[0]);
		}
	});
}