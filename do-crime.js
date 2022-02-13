/** @param {NS} ns **/
export async function main(ns) {
	var isVerbose = ns.args.indexOf("verbose") !== -1;

    if(!isVerbose)
        ns.disableLog("sleep");

    while(true) {
        ns.commitCrime("traffick illegal arms");
        while(ns.isBusy()) {
            await ns.sleep(500);
        }

        if(ns.getPlayer().hp < ns.getPlayer().max_hp) {
            ns.hospitalize();
        }
    }
};