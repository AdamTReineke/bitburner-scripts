import { format } from "lib.js";

/** @param {NS} ns **/
export async function main(ns) {
	var isVerbose = ns.args.indexOf("verbose") !== -1;

    if(!isVerbose)
        ns.disableLog("sleep");

    // Only considering these crimes because they give XP in the 4 main fight skills.
	var listOfCrimes = [
		"mug someone",
		"traffick illegal arms",
		"kidnap and ransom",
		"assassinate",
	];


    while(true) {
        if(ns.args[0]) {
            ns.commitCrime(ns.args[0]);
        }
        else {
            var crimeOverSixty = "";
            var chanceOverSixty = 1.0;
            listOfCrimes.forEach(crime => {
                var chance = ns.getCrimeChance(crime);
                if(chance > 0.4 && chance <= chanceOverSixty) {
                    chanceOverSixty = chance;
                    crimeOverSixty = crime;
                }
            });

            // Do Crime?
            if (crimeOverSixty !== "") {
                ns.commitCrime(crimeOverSixty);
            }
            else {
                ns.commitCrime("mug someone");
                //throw new Error("Not ready for crime. Get a job?");
            }
        }
        ns.print(`Karma: ${format(ns["heart"]["break"]())}`);

        

        while(ns.isBusy()) {
            await ns.sleep(500);
        }

        if(ns.getPlayer().hp < ns.getPlayer().max_hp) {
            ns.hospitalize();
        }
    }
};