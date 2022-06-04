import { format } from "lib.js";
/** @param {NS} ns **/
export async function main(ns) {
	ns.tprint(format(ns.getScriptExpGain()));
}