import { format } from "./lib.js";

/** @param {NS} ns **/
export async function main(ns) {
    // Disable logs
    ns.disableLog("ALL");

    if (ns.args.length === 0) {
        throw new Error("First arg should be the faction name.");
    }
    var faction = "" + ns.args[0];

    var existingFavor = ns.getFactionFavor(faction);
    while(true) {
        var augFavor = ns.getFactionFavorGain(faction) + existingFavor;
        
        var msg = `You will have ${format(augFavor)} favor with ${faction} after installing augments.`;
        if(augFavor >= 150) {
            ns.tprint(msg);
            break;
        }
        else {
            ns.print(msg);
        }

        ns.workForFaction(faction, "Hacking Contracts", true);

        var before = ns.getFactionRep(faction);
        await ns.sleep(60000);
        ns.stopAction();

        var after = ns.getFactionRep(faction);
        augFavor = ns.getFactionFavorGain(faction) + existingFavor;

        var repPerMinute = after - before;
        var repTo150 = favorToRep(150);
        var repAlready = favorToRep(augFavor);
        var minutesRemaining = (repTo150 - repAlready) / repPerMinute;

        ns.print(
            `You need ${format(repTo150 - repAlready)} more rep, `,
            `earning ${format(repPerMinute)}/m. `,
            `${format(minutesRemaining)} minutes remaining. `,
            `ETA: ${new Date(new Date().setMinutes(new Date().getMinutes() + minutesRemaining)).toLocaleTimeString()}`);
    }
}

// from https://github.com/danielyxie/bitburner/blob/1e8976f25eab1cf5cfdad5d2062e85fed83c8691/src/Faction/formulas/favor.ts#L5
function favorToRep(f) {
    const raw = 25000 * (Math.pow(1.02, f) - 1);
    return Math.round(raw * 10000) / 10000; // round to make things easier.
}