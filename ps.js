/** @param {NS} ns **/
export async function main(ns) {
	ns.tprint(JSON.stringify(
	ns.ps("home").filter((v) => v.filename.indexOf("jgn") !== 0)
	, undefined, 2));
}