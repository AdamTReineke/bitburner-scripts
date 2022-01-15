/** @param {NS} ns **/
export async function main(ns) {
    while(true) {
        var target = "alpha-ent";

        var moneyThresh = ns.getServerMaxMoney(target);
        var securityThresh = ns.getServerMinSecurityLevel(target) + 4;

        if (ns.getServerSecurityLevel(target) > securityThresh) {
            await ns.weaken(target);
        } else if (ns.getServerMoneyAvailable(target) < moneyThresh) {
            await ns.grow(target, { stock: true /*ns.stock.getPosition("JGN")[0] > 0*/ });
        } else {
            await ns.hack(target);
        }
    }
}