import { format, formatTime } from 'lib.js';
import { univ } from "univ.js";

/** @type {NS} */
var ns;

/** @param {NS} NS **/
export async function main(NS) {
    ns = NS;
    ns.disableLog("sleep");

    ns.run("deploy.js", 1, "home", "jgn.js");
    await ns.sleep(20000);

    await trainAsync('hack', 40);

    await buyPrograms();

    ns.run("server-upgrader.js", 1, 1.5, "T");
    await ns.sleep(1000);
    ns.run("kill.js", 1, "home", "jgn.js");
    await ns.sleep(1000);
    ns.run("deploy.js", 1, "home", "core.js");
    await ns.sleep(1000);
    await deploy();

    ns.exec("market.js", "home", 1, "trade");
}

async function buyPrograms() {
    // buy darknet
    await awaitMoney(200 * 10 ** 3);
    ns.purchaseTor();

    // 500k
    await awaitMoney(500 * 10 ** 3);
    ns.purchaseProgram("brutessh.exe");

    // 1.5m
    await awaitMoney(1.5 * 10 ** 6)
    ns.purchaseProgram("ftpcrack.exe");

    // 5m
    await awaitMoney(5 * 10 ** 6);
    ns.purchaseProgram("relaysmtp.exe");

    // 30m
    await awaitMoney(30 * 10 ** 6);
    ns.purchaseProgram("httpworm.exe");
    
    // 250m
    await awaitMoney(250 * 10 ** 6);
    ns.purchaseProgram("sqlinject.exe");
}

async function awaitMoney(n) {
    var start = performance.now();
    ns.scriptKill("money.js", "home");
    ns.run("money.js", 1, n);
    while (ns.getPlayer().money < n) {
        ns.print(`Waiting for \$ ${format(n - ns.getPlayer().money)} more money... (${formatTime(performance.now() - start)} elapsed)`);
        await ns.sleep(15000);
    }
    return Promise.resolve();
}

/**
 * Trains a skill async until the desired level.
 */
async function trainAsync(skill, level) {
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

async function deploy() {
    if (ns.isRunning("deploy.js")) {
        return;
    }

    // deploy.js will log for the deployment.
    var pid = ns.run("deploy.js", 1);
    if (pid > 0) {
        return Promise.resolve(pid);
    }
    else {
        return Promise.reject("Failed to start the deploy script.");
    }
}