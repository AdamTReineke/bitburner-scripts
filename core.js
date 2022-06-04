import { format, formatTime, pad } from "lib.js";
/** @param {NS} ns **/
export async function main(ns) {
    while(true) {
        var targets = [
            /*
            { symbol: "", host: "fulcrumassets", hack: 1342 },
            { symbol: "ECP", host: "ecorp", hack: 1260 },
            { symbol: "FLCM", host: "fulcrumtech", hack: 1125 },
            { symbol: "MGCP", host: "megacorp", hack: 1124 },
            { symbol: "KGI", host: "kuai-gong", hack: 1105 },
            { symbol: "", host: "powerhouse-fitness", hack: 1057 },
            { symbol: "BLD", host: "blade", hack: 1048 },
            { symbol: "", host: "nwo", hack: 1045 },
            { symbol: "CLRK", host: "clarkinc", hack: 1037 },
            { symbol: "FSIG", host: "4sigma", hack: 1003 },
            { symbol: "OMTK", host: "omnitek", hack: 938 },
            { symbol: "", host: "b-and-a", hack: 932 },
            { symbol: "", host: "infocomm", hack: 921 },
            { symbol: "STM", host: "stormtech", hack: 918 },
            { symbol: "OMN", host: "omnia", hack: 902 },
            { symbol: "", host: "deltaone", hack: 890 },
            { symbol: "UNV", host: "univ-energy", hack: 875 },
            { symbol: "", host: "taiyang-digital", hack: 874 },
            { symbol: "", host: "galactic-cyber", hack: 869 },
            { symbol: "DCOMM", host: "defcomm", hack: 868 },
            { symbol: "AERO", host: "aerocorp", hack: 861 },
            { symbol: "TITN", host: "titan-labs", hack: 854 },
            { symbol: "ICRS", host: "icarus", hack: 853 },
            { symbol: "MDYN", host: "microdyne", hack: 843 },
            { symbol: "GPH", host: "global-pharm", hack: 828 },
            { symbol: "VITA", host: "vitalife", hack: 826 },
            { symbol: "", host: "zeus-med", hack: 825 },
            { symbol: "", host: "zb-def", hack: 823 },
            { symbol: "", host: "applied-energetics", hack: 822 },
            { symbol: "SLRS", host: "solaris", hack: 818 },
            { symbol: "HLS", host: "helios", hack: 815 },
            { symbol: "", host: "unitalife", hack: 793 },
            { symbol: "NVMD", host: "nova-med", hack: 783 },
            { symbol: "", host: "zb-institute", hack: 756 },
            { symbol: "", host: "snap-fitness", hack: 694 },
            { symbol: "LXO", host: "lexo-corp", hack: 687 },
            { symbol: "SYSC", host: "syscore", hack: 613 },
            { symbol: "APHE", host: "alpha-ent", hack: 524 },
            { symbol: "", host: "millenium-fitness", hack: 511 },
            { symbol: "RHOC", host: "rho-construction", hack: 507 },
            { symbol: "", host: "summit-uni", hack: 469 },
            { symbol: "", host: "aevum-police", hack: 433 },
            { symbol: "CTYS", host: "catalyst", hack: 412 },
            { symbol: "NTLK", host: "netlink", hack: 405 },
            { symbol: "", host: "rothman-uni", hack: 389 },
            { symbol: "CTK", host: "comptek", hack: 386 },
            { symbol: "", host: "the-hub", hack: 296 },
            { symbol: "", host: "johnson-ortho", hack: 294 },
            { symbol: "", host: "crush-fitness", hack: 271 },
            { symbol: "OMGA", host: "omega-net", hack: 217 },
            { symbol: "", host: "silver-helix", hack: 150 },
            { symbol: "", host: "iron-gym", hack: 100 },
            { symbol: "", host: "phantasy", hack: 100 },
            { symbol: "", host: "max-hardware", hack: 80 },
            { symbol: "", host: "zer0", hack: 75 },
            { symbol: "", host: "neo-net", hack: 50 },
            { symbol: "", host: "harakiri-sushi", hack: 40 },
            { symbol: "", host: "hong-fang-tea", hack: 30 },
            { symbol: "", host: "nectar-net", hack: 20 },
            { symbol: "JGN", host: "joesguns", hack: 10 },
            { symbol: "SGC", host: "sigma-cosmetics", hack: 5 },
            { symbol: "", host: "n00dles", hack: 1 },
            { symbol: "", host: "foodnstuff", hack: 1 },
            */
        ].filter(h => {
            return h.hack < ns.getPlayer().hacking * 0.5 && ns.hasRootAccess(h.host)
        });

        if(ns.getPlayer().hacking > 250) {
            targets = targets.filter((h) => {
                return ns.getServerMaxMoney(h.host) > 20_000_000;
            });
        }

        var target = targets[Math.floor(Math.random() * targets.length)];
        if(target === undefined) target = { symbol: "JGN", host: "joesguns", hack: 10 };

        var host = target.host;

        var moneyThresh = ns.getServerMaxMoney(host) * (0.5 + (Math.random() * 0.5));
        var securityThresh = ns.getServerMinSecurityLevel(host) + (5 * Math.random());

        var forecast = 0.5;
        try {
            forecast = (target.symbol !== "") ? ns.stock.getForecast(target.symbol) : 0.5;
        } catch (e) {}

        if (ns.getServerSecurityLevel(host) > securityThresh) {
            await ns.weaken(host);
        } else if (ns.getServerMoneyAvailable(host) < moneyThresh) {
            var opts = (forecast > 0.55) ? { stock: true } : undefined;
            await ns.grow(host, opts);
        } else {
            if(Math.random() > 0.8) {
                var opts = (forecast > 0.55) ? { stock: true } : undefined;
                await ns.grow(host, opts);
                continue;
            }

            var start = performance.now();
            var opts = (forecast < 0.45) ? { stock: true } : undefined;
            const stolen = await ns.hack(host, opts);
            var end = performance.now();
            ns.print("Hacked ",
                pad(host, 18),
                pad(format(stolen), 14),
                pad(formatTime(end - start),10),
                pad("$  " + format(stolen / ((end-start)/1000)) + " / s", 14)
            );
        }
    }
}