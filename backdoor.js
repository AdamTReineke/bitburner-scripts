/** @param {NS} ns **/
export async function main(ns) {
	var scannedNames = new Set();
	var allNames = new Set();
	allNames.add("home");

	var iter = allNames.values();
	while(allNames.size > scannedNames.size) {
		var toScan = iter.next();
		if(!scannedNames.has(toScan.value)) {
			scannedNames.add(toScan.value);
			ns.scan(toScan.value).forEach(i => allNames.add(i));
		}
	}

	scannedNames = [...scannedNames.values()];

	scannedNames.forEach((host) => {
		if(host !== "home" && host.indexOf("adam") !== 0) {
			ns.tprint(`Ran on ${host} - ${ns.exec("installBackdoor.js", host)}`);
		}
	});
}