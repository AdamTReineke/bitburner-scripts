/** @param {NS} ns **/
export async function main(ns) {
	// Restart if the player just runs this.
	if(ns.getPlayer().hacking > 30000) {
		ns.installAugmentations("install.js");
		return;
	}

	ns.universityCourse("Rothman University", "Algorithms");
	await ns.sleep(5000);
	ns.stopAction();

	ns.nuke("joesguns");

	ns.run("bladeburner.js");
	ns.run("deploy.js", 1, "home", "jgn-dumb.js");

	ns.run("hackjgn.js");
	ns.run("hacknet.js");
	ns.joinFaction("ECorp");

	// Wait 16 hours.
	await ns.sleep(16 * 60 * 60 * 1000);

	// Stop spending money on upgrading hacknet
	ns.scriptKill("hacknet.js", "home");

	// Start spending money.
	ns.run("nf.js", 1, "ECorp");

	await ns.sleep(8 * 60 * 60 * 1000);

	ns.installAugmentations("install.js");
}