import { formatPercent, format } from 'lib.js';

/** @type {NS} */
let ns;

/** @param {NS} ns **/
export async function main(NS) {
	ns = NS;
	while(true) {
		/**@type {Array<{symbol: string, forecast: number, min: number, max: number, price: number}>} */
		var data = JSON.parse(ns.read("stock.txt"));

		data.forEach((stock) => {
			if (isLong(stock)) {
				var best = stock.max - stock.min;
				var current = stock.price - stock.min;
				ns.print(`trace: ${stock.symbol} progress at ${formatPercent(current / best)}`);
				if (current / best > 0.80 ) {
					var position = ns.stock.getPosition(stock.symbol);
					var sellPrice = ns.stock.sell(stock.symbol, position);
					if(sellPrice === 0) {
						ns.tprint(`ERROR: Failed to sell ${stock.symbol}`);
					} else {
						ns.tprint(`SOLD: ${stock.symbol} x ${format(position)} @ ${format(sellPrice)} = \$ ${format(sellPrice * position)}`);
					}
				}

				// don't consider buying shares I already hold
				return;
			}

			// Eval for buying
/*			if (getUpside(stock) >= 0.75) {
				var toBuy = sharesToBuy(stock);
				var purchasePrice = ns.stock.buy(stock.symbol, toBuy);
				if(purchasePrice === 0) {
					ns.tprint(`ERROR: Failed to buy ${stock.symbol}`);
				} else {
					ns.tprint(`BOUGHT ${stock.symbol} x ${format(toBuy)} @ ${format(purchasePrice)} = \$ ${format(purchasePrice * toBuy)}`);
				}
			}
*/		});
	
		await ns.sleep(6000);
	}
}

/**
 * @param {{symbol: string, forecast: number, min: number, max: number, price: number}} stock
 */
function isLong(stock) {
	return ns.stock.getPosition(stock.symbol)[0] > 0;
}

/**
 * @param {{symbol: string, forecast: number, min: number, max: number, price: number}} stock
 */
function getUpside(stock) {
	return 1 - stock.price / stock.max;
}

/**
 * @param {{symbol: string, forecast: number, min: number, max: number, price: number}} stock
 */
function sharesToBuy(stock) {
	var budget = Math.floor(ns.getPlayer().money / stock.price);
	var buyLimit = Math.floor(ns.stock.getMaxShares(stock.symbol) * 0.75);

	return Math.min(budget, buyLimit);
}