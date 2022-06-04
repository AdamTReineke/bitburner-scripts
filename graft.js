/** @param {NS} ns **/
export async function main(ns) {
    ns.disableLog("sleep");
    ns.clearLog();
    /**
     * Dictionary of augments where the key is the augmentation name and the value is the factions that offer it.
     * @type {Record<string, Augment>}
     */
    var setOfAugments = {};
    buildSet(ns, setOfAugments);

    // Filter to only unowned augments
	var pAug = ns.getOwnedAugmentations(true);
	var owned = Object.keys(setOfAugments).filter(k => {
		return pAug.includes(setOfAugments[k].name);
	});
	owned.forEach(augName => {
		delete setOfAugments[augName];
	});

	while(Object.keys(setOfAugments).length > 0) {
		if(ns.isBusy()) {
			await ns.sleep(10000);
		}
		else {
			var augName = Object.keys(setOfAugments)[Math.floor(Math.random() * Object.keys(setOfAugments).length)];
			if(ns.grafting.graftAugmentation(augName, true)) {
				delete setOfAugments[augName];
			}
            await ns.sleep(500);
		}
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
    if(ns.args.includes("hacknet")) {
        if(!statsAsString.includes("hacknet")) {
            return;
        }
    }

    if(ns.args.includes('money')) {
        if(!statsAsString.includes('crime_money')) {
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