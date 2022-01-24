/** @param {NS} ns **/
export async function main(ns) {
    /**
     * Dictionary of augments where the key is the augmentation name and the value is the factions that offer it.
     * @type {Record<string, Augment>}
     */
    var setOfAugments = {};
    buildSet(ns, setOfAugments);

    ns.print(JSON.stringify(setOfAugments, undefined, 2));
}

/**
 * @param {NS} ns 
 * @param {Record<string, Augment>} setOfAugments 
 */
function buildSet(ns, setOfAugments) {
    // Populate all augments and the factions that provide them
    getListOfFactions().forEach((faction) => {
        ns.getAugmentationsFromFaction(faction).forEach(augName => {
            if(setOfAugments[augName] === undefined) {
                populate(ns, setOfAugments, augName);
            }
            setOfAugments[augName].factionName.push(faction);
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
    setOfAugments[augName] = {
        name: augName,
        factionName: [],
        stats: ns.getAugmentationStats(augName),
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