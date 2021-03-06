import { format, formatPercent, pad } from "lib.js";

/** @param {NS} ns **/
export async function main(ns) {
	const trade = ns.args.includes("trade");
	const verbose = ns.args.includes("verbose");

	// Get list of symbols - Shouldn't change
	const symbols = ns.stock.getSymbols();

	/** @type {Array<Stock>} */
	let details = symbols.map((symbol) => {
		return {
			symbol,
			forecast: ns.stock.getForecast(symbol),
			min: ns.stock.getPrice(symbol),
			max: ns.stock.getPrice(symbol),
			price: ns.stock.getPrice(symbol),
			sharesLong: 0,
			sharesShort: 0,
		}
	});

	while(true) {
		ns.clearLog();

		// update
		details.forEach(stock => {
			stock.forecast = ns.stock.getForecast(stock.symbol);
			stock.min = Math.min(ns.stock.getAskPrice(stock.symbol), stock.min);
			stock.max = Math.max(ns.stock.getBidPrice(stock.symbol), stock.max);
			stock.price = ns.stock.getPrice(stock.symbol);
			stock.sharesLong = ns.stock.getPosition(stock.symbol)[0];
			stock.sharesShort = ns.stock.getPosition(stock.symbol)[2];
		});
		
		if(trade) {
			// Sell any bad long positions
			details.forEach(stock => {
				var position = ns.stock.getPosition(stock.symbol);
				var isLong = position[0] > 0;
				var isShort = position[2] > 0;

				// Exit longs
				if (isLong && stock.forecast < 0.50) {
					var settled = ns.stock.sell(stock.symbol, position[0]);
					if(settled > 0) {
						ns.print(`${new Date().toLocaleTimeString()} SOLD: ${stock.symbol} x ${format(position[0])} @ \$ ${format(settled)} = \$ ${format(settled * position[0])},`
							+ ` profitting \$ ${format(settled * position[0] - 200_000 - position[1] * position[0])}`);
						stock.sharesLong -= position[0];
					}
				}

				// Exit shorts
				if (isShort && stock.forecast > 0.5) {
					var settled = ns.stock.sellShort(stock.symbol, position[2]);
					if(settled > 0) {
						ns.print(`${new Date().toLocaleTimeString()} SOLD SHORT: ${stock.symbol} x ${format(position[2])} @ \$ ${format(settled)} = \$ ${format(settled * position[2])},`
							+ ` profitting \$ ${format(settled * position[2] - 200_000 - position[3] * position[2])}`);
						stock.sharesShort -= position[3];
					}
				}
			});
		}

		// Require $10B to trade. Prevents tiny trades where the transaction cost might offset gains.
		// Additionally creates a better spread of money across the market.
		if(trade && ns.getPlayer().money > 100_000_000) {
			// Buy long in order of best forecast
			details.sort((a, b) => {
				return Math.abs(0.5 - b.forecast) - Math.abs(0.5 - a.forecast);
			}).forEach((stock) => {
				var position = ns.stock.getPosition(stock.symbol);
				var isLong = position[0] > 0;
				var isShort = position[2] > 0;

				if (!isLong && stock.forecast >= 0.55) {
					var toBuy = Math.floor((ns.getPlayer().money - 100_000) / ns.stock.getAskPrice(stock.symbol));
					var price = ns.stock.buy(stock.symbol, Math.min(toBuy, ns.stock.getMaxShares(stock.symbol)));
					var boughtQty = ns.stock.getPosition(stock.symbol)[0];
					if(boughtQty > 0) {
						ns.print(`${new Date().toLocaleTimeString()} BOUGHT ${stock.symbol} x ${format(boughtQty)} @ ${format(price)} = \$ ${format(price * boughtQty)}`);
					}
					return;
				}

				if (!isShort && stock.forecast <= 0.45) {
					var toBuy = Math.floor((ns.getPlayer().money - 100_000) / ns.stock.getBidPrice(stock.symbol));
					var price = ns.stock.short(stock.symbol, Math.min(toBuy, ns.stock.getMaxShares(stock.symbol)));
					var boughtQty = ns.stock.getPosition(stock.symbol)[0];
					if(boughtQty > 0) {
						ns.print(`${new Date().toLocaleTimeString()} BOUGHT SHORT ${stock.symbol} x ${format(boughtQty)} @ ${format(price)} = \$ ${format(price * boughtQty)}`);
					}
					return;
				}
			});
		}


		// print details
		table(ns, details, verbose);
		await ns.sleep(6000);
		ns.clearLog();
	}
}

/**
 * @param {NS} ns
 * @param {Stock[]} details
 * @param {boolean} verbose
 */
function table(ns, details, verbose) {
	if(verbose) {
		ns.print(
			pad("Symbol", 8),
			pad("Price", 11),
			pad("Forecast", 10),
			pad("Long Pct", 10),
			pad("Short Pct", 10)
		);
	}

	// upside sort
	details.sort((a, b) => b.forecast - a.forecast );

	var long = 0;
	var short = 0;
	var cbLong = 0;
	var cbShort = 0;
	var totalMarket = 0;
	details.forEach(item => {
		long += ns.stock.getPosition(item.symbol)[0] * ns.stock.getAskPrice(item.symbol);
		short += ns.stock.getPosition(item.symbol)[2] * ns.stock.getAskPrice(item.symbol);
		cbLong += ns.stock.getPosition(item.symbol)[0] * ns.stock.getPosition(item.symbol)[1];
		cbShort += ns.stock.getPosition(item.symbol)[2] * ns.stock.getPosition(item.symbol)[3];
		totalMarket += ns.stock.getBidPrice(item.symbol) * ns.stock.getMaxShares(item.symbol);


		var posInd = ns.stock.getPosition(item.symbol)[0] > 0 ? "+ " :
			ns.stock.getPosition(item.symbol)[2] > 0 ? "- " : "  ";

		if(verbose) {
			ns.print(
				pad(posInd + item.symbol, 8),
				pad(format(item.price), 11),
				pad(formatPercent(item.forecast), 10),
				pad(formatPercent(item.sharesLong / ns.stock.getMaxShares(item.symbol)), 10),
				pad(formatPercent(item.sharesShort / ns.stock.getMaxShares(item.symbol)), 10)
			);
		}
	});

	ns.print(`  Long Positions: \$ ${format(long)} now, ${format(cbLong)} basis`);
	ns.print(` Short Positions: \$ ${format(short)} now, ${format(cbShort)} basis`);
	ns.print(`Unrealized Gains: \$ ${format((long - cbLong) + (cbShort - short))}`);
	ns.print(`    Total Market: \$ ${format(totalMarket)} (${formatPercent((long + short) / totalMarket)} owned)`);
}