/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog("gang.setMemberTask");
	ns.disableLog("sleep");
	ns.disableLog("gang.purchaseEquipment");

	while(true) {
		logic(ns);
		await ns.sleep(2000);
	}
}

var lastChance = 0;
var deltaChance = 0;

/** @param {NS} ns */
function logic(ns) {
	ns.clearLog();
	while(ns.gang.canRecruitMember()) {
		ns.gang.recruitMember("Gang-" + Math.random());
	}

	var wanted = ns.gang.getGangInformation().wantedLevel > 2;
	var wantedGoingUp = ns.gang.getGangInformation().wantedLevelGainRate > 0;

	var chance = 1.0;
	chance = Math.min(chance, ns.gang.getChanceToWinClash("Speakers for the Dead"));
	chance = Math.min(chance, ns.gang.getChanceToWinClash("The Black Hand"));
	chance = Math.min(chance, ns.gang.getChanceToWinClash("The Dark Army"));
	chance = Math.min(chance, ns.gang.getChanceToWinClash("The Syndicate"));
	chance = Math.min(chance, ns.gang.getChanceToWinClash("NiteSec"));
	chance = Math.min(chance, ns.gang.getChanceToWinClash("Tetrads"));

	ns.print(`Min chance: ${chance} (change ${deltaChance} / tick)`);
	if(chance != lastChance) {
		deltaChance = lastChance - chance;
		lastChance = chance;
	}

	if(ns.gang.getGangInformation().territory > 0.99999) {
		ns.gang.setTerritoryWarfare(false);
		chance = 1;
	}

	var members = ns.gang.getMemberNames()
	for(var i = 0; i < members.length; i++) {
		//ns.gang.getEquipmentNames().map(n => ns.gang.purchaseEquipment(members[i], n));

		var shouldAscend = ns.gang.getAscensionResult(members[i]) && ns.gang.getAscensionResult(members[i]).str > 2.0;
		var needsTraining = ns.gang.getMemberInformation(members[i]).str_exp < 6500;
		var memberWantedGain = ns.gang.getMemberInformation(members[i]).wantedLevelGain;

		// Ascend, my child!
		if(shouldAscend) {
			ns.gang.ascendMember(members[i]);
			continue;
		}

		if(needsTraining) {
			ns.gang.setMemberTask(members[i], "Train Combat");
			continue;
		}
		
		if(ns.gang.getGangInformation().wantedLevel > 1 && memberWantedGain < 0) {
			//ns.print(`${members[i]} - keep vig`);
			continue;
		}

		if(chance < 0.90 && members.length > 11) {
			ns.gang.setMemberTask(members[i], "Territory Warfare");
			continue;
		}
		else if(chance > 0.95 && ns.gang.getGangInformation().territoryWarfareEngaged === false) {
			ns.gang.setTerritoryWarfare(true);
		}

		// manually assigned, ignore for now unless he gets reassigned to Vig.
		if(memberWantedGain > 0) {
			continue;
		}

		if(members.length <= 8) {
			ns.gang.setMemberTask(members[i], "Mug People"); // starter
		}
		else if(members.length > 8) {
			ns.gang.setMemberTask(members[i], "Human Trafficking");
			//ns.gang.setMemberTask(members[i], "Terrorism"); // rep
		}
	}

	// Pick the strongest person working to start doing vig - idea being we want to level guys equally.
	if(wanted && wantedGoingUp) {
		var strongest = getStrongestWorking(ns);
		if(strongest != "") {
			ns.gang.setMemberTask(strongest, "Vigilante Justice");
		}
	}

	for(var i = 0; i < members.length; i++) {
		var asc = ns.gang.getAscensionResult(members[i]) ? ns.gang.getAscensionResult(members[i]).str.toFixed(2) : "NA";
		var str = (ns.gang.getMemberInformation(members[i]).str_exp / 1000).toFixed(2) + "k";
		var task = ns.gang.getMemberInformation(members[i]).task.substring(0, 9);
		var respectGain = ns.gang.getMemberInformation(members[i]).respectGain.toFixed(2);
		var respect = ns.gang.getMemberInformation(members[i]).earnedRespect.toFixed(2);
		ns.print(`${members[i]} - ${task} - str: ${str} - asc: ${asc} - resp: ${respect} (${respectGain})`);
	}
	ns.print(JSON.stringify(ns.gang.getGangInformation(), undefined, 2));
}

/** @param {NS} ns */
function getStrongestWorking(ns) {
	var members = ns.gang.getMemberNames();
	var strongest = "";
	for(var i = 0; i < members.length; i++) {
		if(ns.gang.getMemberInformation(members[i]).wantedLevelGain > 0) {
			if(strongest === "" || ns.gang.getMemberInformation(members[i]).str_exp > ns.gang.getMemberInformation(strongest).str_exp) {
				strongest = members[i];
			}
		}
	}
	return strongest;
}