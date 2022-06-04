import { formatPercent, format, pad } from 'lib.js';

/** @type {NS} */
let ns;

// known good = 0.8 and 0.75
const SELL_PCT = 0.8;
const UPSIDE_PCT = 0.75;

/** @param {NS} ns **/
export async function main(NS) {
	ns = NS;
	while(true) {
		ns.clearLog();
		ns.print(`sell @ ${formatPercent(SELL_PCT)}`);
		ns.print(` buy @ ${formatPercent(UPSIDE_PCT)} upside`);

		/**@type {Array<{symbol: string, forecast: number, min: number, max: number, price: number}>} */
		var data = JSON.parse(ns.read("stock.txt"));

		ns.print(
			pad('', 4),
			pad('', 4),
			pad('progress', 8),
			pad('forecast', 8),
		);

		data.sort((a, b) => a.symbol.localeCompare(b.symbol));

		data.forEach((stock) => {
			if (isLong(stock)) {
				var best = stock.max - stock.min;
				var current = stock.price - stock.min;
				ns.print(
					pad("sell", 4),
					pad(stock.symbol, 4),
					pad(formatPercent(current / best), 8),
					pad(formatPercent(stock.forecast), 8),
				);

				if (current / best > SELL_PCT ) {
					var position = ns.stock.getPosition(stock.symbol)[0];
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
			if (getUpside(stock) >= UPSIDE_PCT) {
				var toBuy = sharesToBuy(stock);
				var purchasePrice = ns.stock.buy(stock.symbol, toBuy);
				if(purchasePrice === 0) {
					ns.tprint(`ERROR: Failed to buy ${stock.symbol}`);
				} else {
					ns.tprint(`BOUGHT ${stock.symbol} x ${format(toBuy)} @ ${format(purchasePrice)} = \$ ${format(purchasePrice * toBuy)}`);
				}
			}
			else if(getUpside(stock) >= UPSIDE_PCT * 0.7) {
				ns.print(
					pad("buy", 4),
					pad(stock.symbol, 4),
					pad(formatPercent(getUpside(stock)), 8),
					pad(formatPercent(stock.forecast), 8),
				);
			}
		});
	
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
	var budget = Math.floor((ns.getPlayer().money - 100000) / stock.price);
	var buyLimit = Math.floor(ns.stock.getMaxShares(stock.symbol) * 0.75);

	return Math.min(budget, buyLimit);
}