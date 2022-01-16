import { format } from "lib.js";

/** @param {NS} ns **/
export async function main(ns) {
    const Sec = 1000;
    const SYM = "JGN";
    const SLEEP_MS = 6 * Sec;
    ns.disableLog("sleep");

    var bids = [ns.stock.getBidPrice(SYM)];
    var asks = [ns.stock.getAskPrice(SYM)];
    var bidDeltas = [0];
    var askDeltas = [0];
    var i = 0;

    while(true) {
        var bid = ns.stock.getBidPrice(SYM);
        var ask = ns.stock.getAskPrice(SYM);

        var bidDelta = bid - bids[bids.length - 1];
        var askDelta = ask - asks[asks.length - 1];

        asks.push(ask);
        bids.push(bid);
        bidDeltas.push(bidDelta);
        askDeltas.push(askDelta);

        if (bids.length > ((15 * 60 * Sec) / SLEEP_MS)) {
            asks.shift();
            bids.shift();
            bidDeltas.shift();
            askDeltas.shift();
        }

        ns.print(`BID: ${format(bid)} (${format(bidDelta)}), ASK ${format(ask)} (${format(askDelta)}) - recent bids: ${bidDeltas.filter(n => n > 0).length - bidDeltas.filter(n => n < 0).length} positive`);
        if(++i % 10 === 0) {
            ns.print(`BID: ${format(bid)} (${format(bidDelta)}), ASK ${format(ask)} (${format(askDelta)}) - recent bids: ${bidDeltas.filter(n => n > 0).length - bidDeltas.filter(n => n < 0).length} positive`);
        }

        await ns.sleep(SLEEP_MS);
    }
}