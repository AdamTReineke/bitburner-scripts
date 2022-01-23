import { format, formatTime } from "lib.js";

const FIVE_MINUTES = 5 * 60 * 1000;
const DELAY_BETWEEN_PURCHASES = 10*1000; // 10 seconds

/** @param {NS} ns **/
export async function main(ns) {
    ns.disableLog("sleep");
    ns.disableLog("getServerMaxRam");
    ns.disableLog("getPurchasedServerMaxRam");

    var i = 1 + ns.getPurchasedServers().reduce((pv, host) => Math.max(pv, parseInt(host.replace("AUTO-", ""), 10)), 0);

    ns.print(`Next server will be AUTO-${i}`);
    if (ns.args[0] === undefined) {
        throw new Error("Error: Enter how much money should be retained after buying servers. (Ex, `run server-upgrader.js 1.5 T`).");
    }

    while (!isFullyUpgraded(ns)) {

        var nextRam = nextServerToPurchase(ns);
        if (nextRam > 0) {
            var smallest = getSmallestServer(ns);
            if (smallest !== "" && ns.getPurchasedServers().length === ns.getPurchasedServerLimit()) {
                ns.killall(smallest);
                ns.deleteServer(smallest);
            }

            if (ns.getPlayer().money < ns.getPurchasedServerCost(nextRam)) {
                await awaitMoney(ns, ns.getPurchasedServerCost(nextRam) + getBufferFromArgs(ns));
            }
            var newServer = ns.purchaseServer(`AUTO-${++i}`, nextRam);
            if (newServer === "") {
                throw new Error(`Unable to purchase server with RAM ${nextRam}`);
            }
            else {
                ns.run("deploy.js", 1, newServer, "core.js");
            }
        }

        await ns.sleep(DELAY_BETWEEN_PURCHASES);
    }

    ns.tprint("Done buying servers!");

}

/**
 * 
 * @param {NS} ns 
 * @param {number} n 
 * @returns 
 */
async function awaitMoney(ns, n) {
    var start = performance.now();
    ns.scriptKill("money.js", "home");
    ns.run("money.js", 1, n);
    while (ns.getPlayer().money < n) {
        ns.print(`Waiting for \$ ${format(n - ns.getPlayer().money)} more money... (${formatTime(performance.now() - start)} elapsed)`);
        await ns.sleep(15000);
    }
    return Promise.resolve();
}

/**
 * @param {NS} ns 
 */
function isFullyUpgraded(ns) {
    var servers = ns.getPurchasedServers();
    return servers.length === ns.getPurchasedServerLimit() && servers.every(host => {
        return ns.getServerMaxRam(host) >= ns.getPurchasedServerMaxRam();
    });
}

/**
 * 
 * @param {NS} ns 
 */
function allServersHaveSameRam(ns) {
    var servers = ns.getPurchasedServers();
    // If we haven't filled all server slots...
    if (servers.length !== ns.getPurchasedServerLimit()) {
        return false;
    }

    var ram = ns.getServerMaxRam(servers[0]);
    return servers.every(host => ns.getServerMaxRam(host) === ram);
}

/**
 * @param {NS} ns 
 * @returns {number} The RAM size of the largest server
 */
function currentLargestServerRam(ns) {
    var servers = ns.getPurchasedServers();
    return servers.reduce((pv, host) => {
        return Math.max(pv, ns.getServerMaxRam(host))
    }, 0);
}

/**
 * @param {NS} ns 
 * @returns {string} The name of the smallest server, or an empty string if there are no servers.
 */
function getSmallestServer(ns) {
    var servers = ns.getPurchasedServers();
    if (servers.length === 0) {
        return "";
    }

    return servers.reduce((pv, host) => {
        return ns.getServerMaxRam(host) < ns.getServerMaxRam(pv) ? host : pv;
    }, servers[0]);
}

/**
 * 
 * @param {NS} ns 
 * @returns {number} -1, if I'm too poor to buy a server. Otherwise, the RAM of the server to purchase.
 */
function nextServerToPurchase(ns) {
    if (ns.getPurchasedServers().length === 0) {
        return 2 ** 6;
    }

    var ramNow = allServersHaveSameRam(ns) && ns.getPurchasedServers().length === ns.getPurchasedServerLimit()
        ? ns.getServerMaxRam(ns.getPurchasedServers()[0]) * 4 // raise it two powers.
        : currentLargestServerRam(ns);

    var costNow = ns.getPurchasedServerCost(ramNow);
    var costNext = ns.getPurchasedServerCost(Math.min(ramNow * 4, 2**20));
    var buffer = getBufferFromArgs(ns);
    var availableFunds = ns.getPlayer().money - buffer;

    ns.print(`Waiting for money to purchase server with ${format(ramNow)} RAM for ${format(costNow)}...`);

    if (availableFunds >= costNext) {
        return Math.min(ramNow * 4, 2**20);
    }

    if (availableFunds >= costNow) {
        return ramNow;
    }
    return -1;
}

/**
 * 
 * @param {NS} ns 
 * @returns {number}
 */
function getBufferFromArgs(ns) {
    if (typeof ns.args[0] !== "number") {
        throw new Error("Needs to be numeric.");
    }

    switch (ns.args[1]) {
        case "M":
            return ns.args[0] * 1_000_000;
        case "B":
            return ns.args[0] * 1_000_000_000;
        case "T":
            return ns.args[0] * 1_000_000_000_000;
        case "Q":
            return ns.args[0] * 1_000_000_000_000_000;
        default:
            return ns.args[0];
    }
}