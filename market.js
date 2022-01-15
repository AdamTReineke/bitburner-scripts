import { format, formatTime, formatPercent, pad } from "lib.js";
/** @type {NS} */
var ns;

let details = [];

/** @param {NS} ns **/
export async function main(NS) {
	ns = NS;
	const trade = ns.args[0] === "trade";

	// Get list of symbols - Shouldn't change
	const symbols = ns.stock.getSymbols();

	// Load existing data, if it exists
	if(ns.fileExists("stock.txt")) {
		details = JSON.parse(ns.read("stock.txt"));
	}
	// Or get initial round of data
	else {
		details = symbols.map((symbol) => {
			return {
				symbol,
				forecast: ns.stock.getForecast(symbol),
				min: ns.stock.getPrice(symbol),
				max: ns.stock.getPrice(symbol),
				price: ns.stock.getPrice(symbol),
			}
		});
	}

	while(true) {
		ns.clearLog();
		// print details
		table(details);
		await ns.write("stock.txt", JSON.stringify(details), "w");
		await ns.sleep(6000);

		// update
		details.forEach(stock => {
			stock.forecast = ns.stock.getForecast(stock.symbol);
			stock.min = Math.min(ns.stock.getAskPrice(stock.symbol), stock.min);
			stock.max = Math.max(ns.stock.getBidPrice(stock.symbol), stock.max);
			stock.price = ns.stock.getPrice(stock.symbol);

			if(trade) {

				var position = ns.stock.getPosition(stock.symbol);
				var isLong = position[0] > 0;
				// var shouldSell = stock.max / ns.stock.getBidPrice(stock.symbol) <= 1.5;
				// if (isLong
				// && (
				// 	(stock.forecast < 0.46)
				// 	|| (shouldSell && stock.forecast < 0.52)
				// )) {
				if (isLong && stock.forecast < 0.50) {
					var settled = ns.stock.sell(stock.symbol, position[0]);
					if(settled > 0) {
						
						ns.tprintf(`${new Date().toLocaleTimeString()} SOLD: ${stock.symbol} x ${format(position[0])} @ \$ ${format(settled)} = \$ ${format(settled * position[0])}, profitting \$ ${format(settled * position[0] - 200_000 - position[1] * position[0])}`);
					}
					return;
				}

				// var shouldBuy = stock.max / ns.stock.getAskPrice(stock.symbol) >= 1.5;
				// if(!isLong && ((shouldBuy && stock.forecast > 0.52) || (stock.forecast >= 0.8))) {
				if (!isLong && stock.forecast >= 0.55) {
					var toBuy = Math.floor((ns.getPlayer().money - 100_000) / ns.stock.getAskPrice(stock.symbol));
					var price = ns.stock.buy(stock.symbol, Math.min(toBuy, ns.stock.getMaxShares(stock.symbol)));
					var boughtQty = ns.stock.getPosition(stock.symbol)[0];
					if(boughtQty > 0) {
						ns.tprintf(`${new Date().toLocaleTimeString()} BOUGHT ${stock.symbol} x ${format(boughtQty)} @ ${format(price)} = \$ ${format(price * boughtQty)}`);
					}
					return;
				}

			}
		});
	}
}

/**
 * @param {Array<{symbol: string}>} details
 */
function table(details) {
	ns.print(
		pad("Symbol", 8),
		pad("Min", 10),
		pad("Price", 10),
		pad("Max", 10),
		pad("Downside", 10),
		pad("Upside", 10),
		pad("Range", 13),
		pad("Forecast", 10)
	);

	// alpha sort
	//details.sort((a, b) => a.symbol.localeCompare(b.symbol));

	// upside sort
	details.sort((a, b) => b.forecast - a.forecast );

	var sum = 0;
	var costBasis = 0;
	details.forEach(item => {
		sum += ns.stock.getPosition(item.symbol)[0] * ns.stock.getAskPrice(item.symbol);
		costBasis += ns.stock.getPosition(item.symbol)[0] * ns.stock.getPosition(item.symbol)[1];
		ns.print(
			pad((ns.stock.getPosition(item.symbol)[0] > 0 ? "* " : "  ") + item.symbol, 8),
			pad(format(item.min), 10),
			pad(format(item.price), 10),
			pad(format(item.max), 10),
			pad(formatPercent(1 - (item.price / item.min)), 10),
			pad(formatPercent((item.max / item.price) - 1), 10),
			pad(getRange(item), 13),
			pad(formatPercent(item.forecast), 10)
		);
	});

	ns.print(`  Open Positions: \$ ${format(sum)}`);
	ns.print(`      Cost Basis: \$ ${format(costBasis)}`);
	ns.print(`Unrealized Gains: \$ ${format(sum - costBasis)}`);
}

/**
 * @param {{ price: number, min: number, max: number}} stock
 */
function getRange(stock) {
	var range = stock.max - stock.min;
	var cur = stock.price - stock.min;

	var pct = (cur / range).toFixed(1) * 10;
	var str = "...........".split("");
	str[pct] = "$";

	return str.join("");
}