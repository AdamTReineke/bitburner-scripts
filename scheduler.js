/** @param {NS} ns **/
export async function main(ns) {
    // Disable logs
    ns.disableLog("sleep");

    var host = "joesguns";

    // Info for growing
    var beforeMoney = ns.getServerMoneyAvailable(host);
    var getServerMaxMoney = ns.getServerMaxMoney(host);
    var numThreadsForGrow = ns.growthAnalyze(host, getServerMaxMoney - beforeMoney);
    var securityGrowth = 0.004 * numThreadsForGrow;
    var beforeGetServerSecurityLevel = ns.getServerSecurityLevel(host);
    var endSecurityLevel = beforeGetServerSecurityLevel + securityGrowth;

    ns.tprint(JSON.stringify({
        numThreadsForGrow,
        beforeGetServerSecurityLevel,
        endSecurityLevel
    }, undefined, 2));

    /*
    var getServerGrowth = ns.getServerGrowth(host);
    var getGrowTime = ns.getGrowTime(host);

    var growMult = await ns.grow(host);
    var afterMoney = ns.getServerMoneyAvailable(host);
    var afterGetServerSecurityLevel = ns.getServerSecurityLevel(host);

    ns.tprint(JSON.stringify({
        server: {
            getServerGrowth,
            getGrowTime,
            growMult,
            getServerMaxMoney,
            growsReq: numThreadsForGrow
        },
        before: {
            money: beforeMoney,
            sec: beforeGetServerSecurityLevel
        },
        after: {
            money: afterMoney,
            ratioNow: (afterMoney / beforeMoney),
            sec: afterGetServerSecurityLevel,
        }

    }, undefined, 2));
    */
}