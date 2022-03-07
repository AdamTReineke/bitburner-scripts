/** @param {NS} ns **/
export async function main(ns) {
    ns.clearLog();
    /**
     * Dictionary of augments where the key is the augmentation name and the value is the factions that offer it.
     * @type {Record<string, Augment>}
     */
    var setOfAugments = {};
    buildSet(ns, setOfAugments);

    // Filter to only unowned augments
    if(ns.args.includes("unowned")) {
        var pAug = ns.getOwnedAugmentations(true);
        var owned = Object.keys(setOfAugments).filter(k => {
            return pAug.includes(setOfAugments[k].name);
        });
        owned.forEach(augName => {
            delete setOfAugments[augName];
        });
    }

    // Pull out the faction names
    if(ns.args.includes("summary")) {
        var factionDict = {};

        Object.keys(setOfAugments).forEach(augName => {
            setOfAugments[augName].factionName.forEach(factionName => {
                if(factionDict[factionName]) {
                    factionDict[factionName].push(augName);
                }
                else {
                    factionDict[factionName] = [augName];
                }
            });
        });

        ns.print(JSON.stringify(factionDict, undefined, 2));
    }

    // Whole JSON object for debugging
    if(ns.args.includes("JSON")) {
        ns.print(JSON.stringify(setOfAugments, undefined, 2));
    }
}

/**
 * @param {NS} ns 
 * @param {Record<string, Augment>} setOfAugments 
 */
function buildSet(ns, setOfAugments) {
    // Populate all augments and the factions that provide them
    getListOfFactions().forEach((faction) => {
        ns.getAugmentationsFromFaction(faction).forEach(augName => {
            // Skip NF. It's always everywhere.
            if(augName === "NeuroFlux Governor") {
                return;
            }

            if(setOfAugments[augName] === undefined) {
                populate(ns, setOfAugments, augName);
            }
            if(setOfAugments[augName] !== undefined) {
                setOfAugments[augName].factionName.push(faction);
            }
        });
    });
}

/**
 * 
 * @param {NS} ns 
 * @param {Record<string, Augment>} setOfAugments 
 * @param {string} augName 
 */
function populate(ns, setOfAugments, augName) {
    var stats = ns.getAugmentationStats(augName);
    var statsAsString = Object.keys(stats).join("");
    if(ns.args.includes("hacking")) {
        if(!statsAsString.includes("hacking")) {
            return;
        }
    }
    if(ns.args.includes("crime")) {
        if(false === (
            statsAsString.includes("strength")
            || statsAsString.includes("defense")
            || statsAsString.includes("dexterity")
            || statsAsString.includes("agility")
        )) {
            return;
        }
    }

    setOfAugments[augName] = {
        name: augName,
        factionName: [],
        stats: stats,
        prereq: ns.getAugmentationPrereq(augName),
        repReq: ns.getAugmentationRepReq(augName),
        price: ns.getAugmentationPrice(augName),
    };
}

function getListOfFactions() {
    return [
        // Early Game
        "CyberSec",
        "Tian Di Hui",
        "Netburners",
        // Cities
        "Sector-12",
        "Chongqing",
        "New Tokyo",
        "Ishima",
        "Aevum",
        "Volhaven",
        // Hacking Groups
        "NiteSec",
        "The Black Hand",
        "BitRunners",
        // Megacorps
        "ECorp",
        "MegaCorp",
        "KuaiGong International",
        "Four Sigma",
        "NWO",
        "Blade Industries",
        "OmniTek Incorporated",
        "Bachman & Associates",
        "Clarke Incorporated",
        "Fulcrum Secret Technologies",
        // Criminal Organizations
        "Slum Snakes",
        "Tetrads",
        "Silhouette",
        "Speakers for the Dead",
        "The Dark Army",
        "The Syndicate",
        // Endgame
        "The Covenant",
        "Daedalus",
        "Illuminati",
    ];
}