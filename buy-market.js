import { awaitMoney } from "lib.js";

/** @param {NS} ns */
export async function main(ns) {
	await awaitMoney(26_000_000_000, ns);
	ns.stock.purchase4SMarketData()
	ns.stock.purchase4SMarketDataTixApi();
	ns.spawn("market.js", 1, "trade");
}