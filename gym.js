/** @param {NS} ns **/
export async function main(ns) {
    function workout(stat) {
            ns.gymWorkout("powerhouse gym", stat, true);
            //ns.sleeve.setToGymWorkout(0, "powerhouse gym", stat);
    }

    var target = ns.args[0] || 100;
    while (true) {
        ns.stopAction();
        ns.hacknet.spendHashes("Improve Gym Training");


        if(ns.getPlayer().strength < target) {
            workout("strength");
        }
        else if (ns.getPlayer().defense < target) {
            workout("defense");
        }
        else if (ns.getPlayer().dexterity < target) {
            workout("dexterity");
        }
        else if (ns.getPlayer().agility < target) {
            workout("agility");
        } else {
            ns.sleeve.setToCommitCrime(0, "mug");
            if(ns.args[1] == "crime") {
                ns.spawn("do-crime.js", 1);
            }
            return;
        }

        await ns.sleep(15000);
    }
};