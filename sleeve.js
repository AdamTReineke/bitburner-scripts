/** @param {NS} ns */
export async function main(ns) {
	while(true) {
		var n = ns.sleeve.getNumSleeves();

		for(var i = 0; i < n; i++) {
			var stats = ns.sleeve.getSleeveStats(i);
			if (stats.sync < 100) {
				ns.sleeve.setToSynchronize(i);
			}
			else if(stats.shock > 50) {
				ns.sleeve.setToShockRecovery(i);
			}
			else if (stats.strength < 80) {
				gym(ns, i, "strength");
			}
			else if (stats.defense < 80) {
				gym(ns, i, "defense");
			}
			else if (stats.dexterity < 80) {
				gym(ns, i, "dexterity");
			}
			else if (stats.agility < 80) {
				gym(ns, i, "agility");
			}
			else if (ns.sleeve.getTask(i).crime !== "Homicide") {
				ns.sleeve.setToCommitCrime(i, "Homicide");
			}
		}

		await ns.sleep(15000);
	}
}

/** @param {NS} ns */
function gym(ns, i, stat) {
	ns.print(`sleeve ${i}: ${stat} - ${ns.sleeve.getSleeveStats(i)[stat]}`);
	ns.sleeve.setToGymWorkout(i, "powerhouse gym", stat);
}