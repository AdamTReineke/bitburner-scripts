/** @param {NS} ns **/
export async function main(ns) {
	while(ns.getCompanyRep("NWO") < 200_000) {
		ns.workForCompany("NWO");

		await ns.sleep(60000);
		ns.stopAction();
	}

	await ns.sleep(15000);

	ns.joinFaction("NWO");

	ns.spawn("faction.js", 1, "NWO");
}