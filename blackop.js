/** @param {NS} ns **/
export async function main(ns) {
    ns.disableLog("sleep");

    while(true) {
        var allBlackOps = ns.bladeburner.getBlackOpNames();
        var nextOp = allBlackOps.filter(name => ns.bladeburner.getActionCountRemaining("BlackOp", name) > 0)[0];

        let isBlackOpsNow = ns.bladeburner.getCurrentAction().type === "BlackOp";
        let expectMinimalSuccess = ns.bladeburner.getActionEstimatedSuccessChance("BlackOp", nextOp)[0] > 0.25;
        if(!isBlackOpsNow && expectMinimalSuccess) {
            ns.print(new Date().toLocaleTimeString());
            ns.print(`${allBlackOps.filter(name => ns.bladeburner.getActionCountRemaining("BlackOp", name) > 0).length} BlackOp remaining.`);
            ns.bladeburner.startAction("BlackOp", nextOp);
        }

        await ns.sleep(30_000);
    }
}