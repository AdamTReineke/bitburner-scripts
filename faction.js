import { format } from "./lib.js";

/** @param {NS} ns **/
export async function main(ns) {
    // Disable logs
    ns.disableLog("ALL");

    // Instructions
    if (ns.args[0] === "help") {
        ns.tprint(`Usage: run faction.js <FACTION> <JOB>`);
        return;
    }

    if (ns.args.length === 0) {
        throw new Error("First arg should be the faction name.");
    }
    const FACTION = "" + ns.args[0];
    const JOB = "" + (ns.args[1] || "Hacking Contracts");


    var existingFavor = ns.getFactionFavor(FACTION);
    while(true) {
        var factionAugs = ns.getAugmentationsFromFaction(FACTION).filter(augName => {
            // only include unowned and unpurchased augments
            return ns.getOwnedAugmentations(true).indexOf(augName) === -1;
        });
        var maxRep = 0;
        var augCosts = factionAugs.map((aug) => {
            var rep = ns.getAugmentationRepReq(aug);
            maxRep = Math.max(maxRep, rep);
            return rep;
        }).sort();

        var augFavor = ns.getFactionFavorGain(FACTION) + existingFavor;
        
        var totalAugs = augCosts.length;
        var augsLeft = augCosts.filter((price) => price > ns.getFactionRep(FACTION)).length;

        var msg = `You will have ${format(augFavor)} favor with ${FACTION} after installing augments.\n`;
        msg += `You have ${augsLeft} to earn rep for. Most expensive is ${format(maxRep)} rep.`;
        if(augFavor >= 150) {
            ns.tprint(msg);
            break;
        }
        else {
            ns.print(msg);
        }

        ns.workForFaction(FACTION, JOB, true);

        var before = ns.getFactionRep(FACTION);
        await ns.sleep(60000);
        ns.stopAction();

        var after = ns.getFactionRep(FACTION);
        augFavor = ns.getFactionFavorGain(FACTION) + existingFavor;

        var repPerMinute = after - before;
        var repTo150 = favorToRep(150);
        var repAlready = favorToRep(augFavor);
        var minutesRemainingFavor = (repTo150 - repAlready) / repPerMinute;
        var minutesRemainingAugs = (maxRep - ns.getFactionRep(FACTION)) / repPerMinute;

        ns.print(`Earning rep at ${format(repPerMinute)}/m.`);
        ns.print(
            `150 FAVOR: `,
            (minutesRemainingFavor < 120) ? `${format(minutesRemainingFavor)} minutes remaining. ` : `${format(minutesRemainingFavor / 60)} hours remaining. `,
            `ETA: ${new Date(new Date().setMinutes(new Date().getMinutes() + minutesRemainingFavor)).toLocaleTimeString()}`
        );
        ns.print(
            `AUG REP: `,
            (minutesRemainingAugs < 120) ? `${format(minutesRemainingAugs)} minutes remaining. ` : `${format(minutesRemainingAugs / 60)} hours remaining. `,
            `ETA: ${new Date(new Date().setMinutes(new Date().getMinutes() + minutesRemainingAugs)).toLocaleTimeString()}. `,
            `Rep to earn: ${format(maxRep - ns.getFactionRep(FACTION))}`,
        );
    }
}

// from https://github.com/danielyxie/bitburner/blob/1e8976f25eab1cf5cfdad5d2062e85fed83c8691/src/Faction/formulas/favor.ts#L5
function favorToRep(f) {
    const raw = 25000 * (Math.pow(1.02, f) - 1);
    return Math.round(raw * 10000) / 10000; // round to make things easier.
}