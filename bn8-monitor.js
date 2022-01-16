import { format, formatPercent, pad } from "./lib.js";


// Constants
const Sec = 1000;
const SLEEP_MS = 6 * Sec;

/**
 * @type {Record<string, number>}
 */
var tracker = {
    "---++": 315, "---+-": 373, "-----": 486, "-+-+-": 305, "-+-++": 309, "--+--": 369,
    "-++++": 362, "--+++": 289, "-+--+": 291, "-++-+": 291, "----+": 364, "-+---": 374,
    "-++--": 315, "--+-+": 316, "+-+--": 294, "+-+++": 353, "++++-": 357, "-+++-": 283,
    "+--++": 286, "++-+-": 286, "+-+-+": 294, "+---+": 324, "+-++-": 289, "++--+": 306,
    "+--+-": 310, "+++++": 450, "+++-+": 331, "+----": 365, "+++--": 308, "++-++": 334,
    "--++-": 315, "++---": 316
};

/** @param {NS} ns **/
export async function main(ns) {
    // Disable logs
    ns.disableLog("sleep");

    // Initialize data
    /**
     * @type {Record<string, {bids: Array<number>, asks: Array<number>, bidUp: Array<string>, askUp: Array<string>, bear: true | false | undefined, actionPrice: number}>}
     */
    var dict = {};
    var symbols = ns.stock.getSymbols().sort();
    symbols.forEach((sym) => {
        dict[sym] = {
            bids: [ns.stock.getBidPrice(sym)],
            asks: [ns.stock.getAskPrice(sym)],
            bidUp: [],
            askUp: [],
            bear: undefined,
            actionPrice: 0,
        }
    });

    while(true) {
        symbols.forEach(sym => symbolTick(ns, dict, sym));

        ns.print(JSON.stringify(tracker));
        if(Object.values(tracker).length > 0) {
            var sum = Object.values(tracker).reduce((pv, v) => pv + v);
            Object.keys(tracker).sort().forEach(k => {
                ns.print(
                    pad(k, 6),
                    pad(formatPercent(tracker[k] / sum), 12),
                    pad(formatPercent( (tracker[k] / sum) / 0.03125) , 12)
                );
            });
        }
        ns.print(`--------`);
        await ns.sleep(SLEEP_MS);
    }
}

/**
 * @param {NS} ns
 * @param {Record<string, {bids: Array<number>, asks: Array<number>, bidUp: Array<string>, askUp: Array<string>, bear: true | false | undefined, actionPrice: number}>} dict
 * @param {string} SYM
 */
function symbolTick(ns, dict, SYM) {
    var bid = ns.stock.getBidPrice(SYM);
    var ask = ns.stock.getAskPrice(SYM);

    var bidDelta = bid - dict[SYM].bids[dict[SYM].bids.length - 1];
    var askDelta = ask - dict[SYM].asks[dict[SYM].asks.length - 1];

    dict[SYM].asks.push(ask);
    dict[SYM].bids.push(bid);
    dict[SYM].bidUp.push(bidDelta > 0 ? "+" : "-");
    dict[SYM].askUp.push(askDelta > 0 ? "+" : "-");

    if (dict[SYM].bids.length > 4) {
        // Update the trackers
        track(dict[SYM].bidUp);

        dict[SYM].asks.shift();
        dict[SYM].bids.shift();
        if(dict[SYM].bidUp.length > 4) {
            dict[SYM].bidUp.shift();
            dict[SYM].askUp.shift();
        }
    }
}

/**
 * 
 * @param {Array<string>} arr 
 */
function track(arr) {
    console.log(arr);
    if (arr.length != 5) {
        return;
    }

    var key = arr.join("");
    if(tracker[key]) {
        tracker[key]++;
        return;
    }
    tracker[key] = 1;
}