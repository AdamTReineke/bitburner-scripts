/** @param {NS} ns **/
export async function main(ns) {
    while (true) {
        ns.stopAction();

        if(ns.getPlayer().strength < 100) {
            ns.gymWorkout("powerhouse gym", "strength", true);
        }
        else if (ns.getPlayer().defense < 100) {
            ns.gymWorkout("powerhouse gym", "defense", true);
        }
        else if (ns.getPlayer().dexterity < 100) {
            ns.gymWorkout("powerhouse gym", "dexterity", true);
        }
        else if (ns.getPlayer().agility < 100) {
            ns.gymWorkout("powerhouse gym", "agility", true);
        } else {
            return;
        }

        await ns.sleep(15000);
    }
};
