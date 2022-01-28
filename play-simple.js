import { buyPrograms } from './buy-programs';
import { univ } from "univ.js";

/** @param {NS} ns **/
export async function main(ns) {
    ns.disableLog("sleep");

    await trainAsync(ns, 'hack', 40);
    deploy(ns);

    await ns.sleep(1000);

    await buyPrograms(ns, async () => {
        deploy(ns);
        return await ns.sleep(1000);
    });

    ns.run("server-upgrader.js", 1, 1.5, "T");
    ns.exec("market.js", "home", 1, "trade");
    await ns.sleep(1000);
}

/**
 * Trains a skill async until the desired level.
 * @param {NS} ns
 * @param {string} skill
 * @param {number} level
 */
async function trainAsync(ns, skill, level) {
    var { university, course } = univ[ns.getPlayer().city][skill];

    if (ns.universityCourse(university, course) !== true) {
        return Promise.reject(`Failed to start training, is resolved ${university} -> ${course} missing?`);
    }

    while (level > ns.getPlayer().hacking) {
        await ns.sleep(5000);
    }
    ns.stopAction();

    ns.tprint(`Finished training ${skill} to ${level}.`);

    return Promise.resolve(ns.getPlayer().hacking);
}

/**
 * 
 * @param {NS} ns 
 * @returns 
 */
async function deploy(ns) {
    if (ns.isRunning("deploy.js", "home")) {
        return;
    }

    // deploy.js will log for the deployment.
    var pid = ns.run("deploy.js", 1, "-f", "core.js");
    if (pid > 0) {
        return Promise.resolve(pid);
    }
    else {
        return Promise.reject("Failed to start the deploy script.");
    }
}