import { format, formatPercent, pad } from "./lib.js";

// Constants
const Sec = 1000;
const SLEEP_MS = 6 * Sec;

/** @param {NS} ns **/
export async function main(ns) {
    // Disable logs
    ns.disableLog("sleep");

    // Initialize data
    /**
     * @type {Record<string, {bids: Array<number>, asks: Array<number>, bidDeltas: Array<number>, askDeltas: Array<number>, bear: true | false | undefined, actionPrice: number}>}
     */
    var dict = {};
    var symbols = ns.stock.getSymbols().sort();
    symbols.forEach((sym) => {
        dict[sym] = {
            bids: [ns.stock.getBidPrice(sym)],
            asks: [ns.stock.getAskPrice(sym)],
            bidDeltas: [0],
            askDeltas: [0],
            bear: undefined,
            actionPrice: 0,
        }
    });

    while(true) {
        symbols.forEach(sym => symbolTick(ns, dict, sym));
        ns.print(`--------`);
        await ns.sleep(SLEEP_MS);
    }
}

/**
 * @param {NS} ns
 * @param {Record<string, {bids: Array<number>, asks: Array<number>, bidDeltas: Array<number>, askDeltas: Array<number>, bear: true | false | undefined, actionPrice: number}>} dict
 * @param {string} SYM
 */
function symbolTick(ns, dict, SYM) {
    var bid = ns.stock.getBidPrice(SYM);
    var ask = ns.stock.getAskPrice(SYM);

    var bidDelta = bid - dict[SYM].bids[dict[SYM].bids.length - 1];
    var askDelta = ask - dict[SYM].asks[dict[SYM].asks.length - 1];

    dict[SYM].asks.push(ask);
    dict[SYM].bids.push(bid);
    dict[SYM].bidDeltas.push(bidDelta);
    dict[SYM].askDeltas.push(askDelta);

    if (dict[SYM].bids.length > ((5 * 60 * Sec) / SLEEP_MS)) {
        dict[SYM].asks.shift();
        dict[SYM].bids.shift();
        dict[SYM].bidDeltas.shift();
        dict[SYM].askDeltas.shift();
    }

    // Test for day trading
    var bidDeltaCount = recent(dict[SYM].bidDeltas);
    if(bidDeltaCount > 10) {
        if(dict[SYM].bear === false) {
            ns.tprintf(`${(new Date()).toLocaleTimeString()},${SYM},BEAR,${bid}`);
            dict[SYM].actionPrice = ns.stock.getBidPrice(SYM);
        }

        dict[SYM].bear = true;
    }
    else if(bidDeltaCount < -10) {
        if(dict[SYM].bear === true) {
            ns.tprintf(`${(new Date()).toLocaleTimeString()},${SYM},BULL,${ask}`);
            dict[SYM].actionPrice = ns.stock.getAskPrice(SYM);
        }
        dict[SYM].bear = false;
    }

    var avgNow = (bid+ask) / 2;
    var avgThen = (dict[SYM].asks[0] + dict[SYM].bids[0] ) / 2;
    var deltaToNow = avgNow - avgThen;

    ns.print(
        pad(SYM, 6),
        pad(dict[SYM].bear === true ? "BE  " : (dict[SYM].bear === false ? "  BU" : " -- "), 5),
        pad(format(avgNow), 10),
        pad(format(avgThen), 10),
        pad(format(deltaToNow), 10),
        pad(formatPercent((avgNow - dict[SYM].actionPrice) / dict[SYM].actionPrice), 10)
        );
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