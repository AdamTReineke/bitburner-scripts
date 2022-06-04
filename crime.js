import { format, formatPercent, pad } from "./lib";
/** @param {NS} ns **/
export async function main(ns) {
	var isVerbose = ns.args.indexOf("verbose") !== -1;

	var listOfCrimes = [
		"shoplift",
		"rob store",
		"mug someone",
		"larceny",
		"deal drugs",
		"bond forgery",
		"traffick illegal arms",
		"homicide",
		"grand theft auto",
		"kidnap and ransom",
		"assassinate",
		"heist",
	];

	var crimeWidth = listOfCrimes.reduce((pv, v) => Math.max(pv, v.length), 0);
	if(isVerbose) {
		ns.print(
			pad("Crime", crimeWidth),
			pad("Karma", 10),
			pad("Time", 10),
			pad("Hack Wght / XP", 20),
			pad("Strength Wght / XP", 20),
			pad("Defense Wght / XP", 20),
			pad("Dexterity Wght / XP", 20),
			pad("Agility Wght / XP", 20),
			pad("Charisma Wght / XP", 20),
			pad("Int XP"),
		);
	}

	/** @type {Record<string, CrimeStats>} */
	var crimeDetails = {};
	listOfCrimes.forEach(c => {
		crimeDetails[c] = ns.getCrimeStats(c);

		// Print a row for our table
		if(isVerbose) {
			ns.print(
				pad(c, crimeWidth),
				pad(crimeDetails[c].karma, 10),
				pad(crimeDetails[c].karma / crimeDetails[c].time, 10),
				pad(formatPercent(crimeDetails[c].hacking_success_weight), 8),
				pad(format(crimeDetails[c].hacking_exp), 10),
				pad(formatPercent(crimeDetails[c].strength_success_weight), 8),
				pad(format(crimeDetails[c].strength_exp), 10),
				pad(formatPercent(crimeDetails[c].defense_success_weight), 8),
				pad(format(crimeDetails[c].defense_exp), 10),
				pad(formatPercent(crimeDetails[c].dexterity_success_weight), 8),
				pad(format(crimeDetails[c].dexterity_exp), 10),
				pad(formatPercent(crimeDetails[c].agility_success_weight), 8),
				pad(format(crimeDetails[c].agility_exp), 10),
				pad(formatPercent(crimeDetails[c].charisma_success_weight), 8),
				pad(format(crimeDetails[c].charisma_exp), 10),
				pad(format(crimeDetails[c].intelligence_exp), 10)
			);
		}

	});
}