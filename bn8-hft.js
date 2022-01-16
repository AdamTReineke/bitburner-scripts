import { format, formatPercent, pad } from "./lib.js";

// Constants
const Sec = 1000;
const SLEEP_MS = 6 * Sec;

/**
 * @type {Record<string, number>}
 */
var tracker = {};

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

        var justSold = new Set();

        // Sell all positions (so I have cash to buy)
        ["JGN"].forEach(sym => {
            var pos = ns.stock.getPosition(sym);
            if (pos[0] > 0) {
                ns.stock.sell(sym, pos[0]);
                justSold.add(sym);
            }
            if (pos[2] > 0) {
                ns.stock.sellShort(sym, pos[2]);
                justSold.add(sym);
            }
        });

        // Buy new positions
        ["JGN"].forEach(sym => {
            if (justSold.has(sym)) {
                return;
            }

            var perf = dict[sym].bidUp.join("");
            if(perf === "++++" && Math.random() < 0.2) {
                ns.stock.buy(sym, Math.floor((ns.getPlayer().money - 100_000) / ns.stock.getAskPrice(sym)) );
            }
            if(perf === "----" && Math.random() < 0.2) {
                ns.stock.short(sym, (ns.getPlayer().money - 100_000) / ns.stock.getBidPrice(sym));
            }
        });

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