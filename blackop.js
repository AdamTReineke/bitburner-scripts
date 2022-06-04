/** @param {NS} ns **/
export async function main(ns) {
    ns.disableLog("sleep");

    while(true) {
        var allBlackOps = ns.bladeburner.getBlackOpNames();
        var nextOp = allBlackOps.filter(name => ns.bladeburner.getActionCountRemaining("BlackOp", name) > 0)[0];

        let isInterruptable = ns.bladeburner.getCurrentAction().type === "BlackOp" || ns.bladeburner.getCurrentAction().name === "Diplomacy";
        let expectMinimalSuccess = ns.bladeburner.getActionEstimatedSuccessChance("BlackOp", nextOp)[0] > 0.25;
        if(!isInterruptable && expectMinimalSuccess) {
            ns.print(new Date().toLocaleTimeString());
            ns.print(`${allBlackOps.filter(name => ns.bladeburner.getActionCountRemaining("BlackOp", name) > 0).length} BlackOp remaining.`);
            if(allBlackOps.filter(name => ns.bladeburner.getActionCountRemaining("BlackOp", name) > 0).length > 1) {
                ns.bladeburner.startAction("BlackOp", nextOp);
            }
        }

        await ns.sleep(2_000);
    }
}