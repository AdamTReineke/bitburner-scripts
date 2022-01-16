import { format } from "./lib.js";

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
    var bear = undefined;

    while(true) {
        var bid = ns.stock.getBidPrice(SYM);
        var ask = ns.stock.getAskPrice(SYM);

        var bidDelta = bid - bids[bids.length - 1];
        var askDelta = ask - asks[asks.length - 1];

        asks.push(ask);
        bids.push(bid);
        bidDeltas.push(bidDelta);
        askDeltas.push(askDelta);

        if (bids.length > ((5 * 60 * Sec) / SLEEP_MS)) {
            asks.shift();
            bids.shift();
            bidDeltas.shift();
            askDeltas.shift();
        }

        // Test for day trading
        var bidDeltaCount = recent(bidDeltas);
        if(bidDeltaCount > 10) {
            if(bear === false) {
                ns.tprint(`${(new Date()).toLocaleTimeString()} BEAR: ${format(bid)}`);
            }
            bear = true;
        }
        else if(bidDeltaCount < -4) {
            if(bear === true) {
                ns.tprint(`${(new Date()).toLocaleTimeString()} BULL: ${format(ask)}`);
            }
            bear = false;
        }

        // Market ticks...
        ns.print(`BID: ${format(bid)} (${format(bidDelta)}), ASK ${format(ask)} (${format(askDelta)}) - recent bids: ${bidDeltaCount} positive`);
        if(++i % 10 === 0) {
            ns.tprint(`BID: ${format(bid)} (${format(bidDelta)}), ASK ${format(ask)} (${format(askDelta)}) - recent bids: ${bidDeltaCount} positive`);
        }

        await ns.sleep(SLEEP_MS);
    }
}

/**
 * 
 * @param {Array<number>} arr 
 * @returns {number} Net number of positive entries
 */
export function recent(arr) {
    var i = 0;
    arr.forEach(v => {
        if(v > 0) i++;
        if(v < 0) i--;
    });

    return i;
}