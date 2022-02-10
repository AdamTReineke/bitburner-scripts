import { getServerNames, getPathToServer } from "./lib-server.js";

/** @param {NS} ns **/
export async function main(ns) {
    ns.disableLog("scan");
    var { scannedNames } = getServerNames(ns);
    /** @type {Map<string, string[]>} */
    var mapOfFiles = new Map();

    scannedNames.forEach(host => {
        mapOfFiles.set(host, ns.ls(host));
    });

    var outMap = new Map();

    [...mapOfFiles.keys()].forEach(async host => {
        mapOfFiles.get(host).filter(files => files.endsWith(".cct")).forEach(file => {
            ns.print(`${host} - ${ns.codingcontract.getContractType(file, host)}`);

            outMap.set(file.replace(".cct", ".js"), `
/*
Host: ${host}
Problem: ${ns.codingcontract.getContractType(file, host)}
Tries Left: ${ns.codingcontract.getNumTriesRemaining(file, host)}

Description:
${ns.codingcontract.getDescription(file, host)}

Data:
${ns.codingcontract.getData(file, host)}

*/

/** @param {NS} ns */
export async function main(ns) {
    const data = ns.codingcontract.getData("${file}", "${host}");
    const answer = solve(data);
    ns.print(answer);
    if(answer !== undefined && ns.args.contains("submit")) {
        ns.codingcontract.attempt(answer, "${file}", "${host}", { returnReward: true });
    }
}

function solve(data) {
    return undefined;
}
`,);
        });
    });

    for (const k of outMap.keys()) {
        await ns.write(k, outMap.get(k), "w");
    }
}