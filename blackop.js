/** @param {NS} ns **/
export async function main(ns) {
    ns.disableLog("sleep");

    while(true) {
        var allBlackOps = ns.bladeburner.getBlackOpNames();
        var nextOp = allBlackOps.filter(name => ns.bladeburner.getActionCountRemaining("BlackOps", name) > 0)[0];

        let isBlackOpsNow = ns.bladeburner.getCurrentAction().type === "BlackOps";
        let expectMinimalSuccess = ns.bladeburner.getActionEstimatedSuccessChance("BlackOps", nextOp)[0] > 0.1;
        if(!isBlackOpsNow && expectMinimalSuccess) {
            ns.bladeburner.startAction("BlackOps", nextOp);
        }

        await ns.sleep(30_000);
    }
}