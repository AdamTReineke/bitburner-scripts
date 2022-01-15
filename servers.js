import { format } from 'lib.js';

/** @param {NS} ns **/
export async function main(ns) {
	const log = (msg) => ns.tprint(msg);
	var prefix = "adam";
	const ram = ns.args[1] === undefined ? -1 : Math.pow(2, ns.args[1]);

	switch(ns.args[0]) {
		case "list":
			log(JSON.stringify(getServers(ns), undefined, 2));
			break;

		case "cost":
			log(ram + " $" + format(ns.getPurchasedServerCost(ram)));
			break;

		case "delete":
			getServers(ns).forEach(server => {
				ns.killall(server)
				ns.deleteServer(server);
			});
			break;

		case "buy":
			let unitCost = ns.getPurchasedServerCost(ram);
			let result = await ns.prompt(`Spend all money on servers with ${ram} RAM at ${format(unitCost)} each?`);
			if(result === true) {
				while(ns.getPlayer().money < unitCost) {
					await ns.sleep(15000);
				}
				while(ns.getPlayer().money > unitCost && ns.getPurchasedServers().length < ns.getPurchasedServerLimit()) {
					var server = ns.purchaseServer(prefix, ram);
					ns.run("deploy.js", 1, server);
				}

			}
			else {
				log("Did not spend money.");
			}

			break;

		default:
			log("Requires args.");
	}
}

function getServers(ns) {
	return ns.getPurchasedServers();
}