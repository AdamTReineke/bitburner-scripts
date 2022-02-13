export function format(n) {
	if(n === 0) return "";
	function fixed(n) {
		if(Math.abs(n) >= Math.pow(10, 15)) return (n / Math.pow(10,15)).toFixed(3) + " Q";
		if(Math.abs(n) >= Math.pow(10, 12)) return (n / Math.pow(10,12)).toFixed(3) + " T";
		if(Math.abs(n) >= Math.pow(10, 9))  return (n / Math.pow(10,9)).toFixed(3) + " B";
		if(Math.abs(n) >= Math.pow(10, 6))  return (n / Math.pow(10,6)).toFixed(3) + " M";
		if(Math.abs(n) >= Math.pow(10, 3))  return (n / Math.pow(10,3)).toFixed(3) + " K";
		return n.toFixed(3) + "  ";
	}
	var out = fixed(n);
	while(out.length < 10) {
		out = " " + out;
	}
	return out;
}

export function formatTime(ms) {
	var timeInMin = ms / 60000;
	if(timeInMin > 120) {
		return (ms / (60000 * 60)).toFixed(1) + " hr";
	}
	return (ms / 60000).toFixed(1) + " min";
}

export function formatPercent(n) {
	if(n === 0) return "";

	if(n > 99.999)
		n = 99.999;
	if(n < -99.999)
		n = -99.999;

	var pct = (n * 100).toFixed(1) + "%";

	while(pct.length < "-999.9%".length) {
		pct = " " + pct;
	}

	return pct;
}

export function pad(str, len) {
	if(str === undefined) {
		str = " ";
	}
	if(typeof str === "number") {
		str = "" + str;
	}

	while(str.length < len) {
		str += " ";
	};
	return "| " + str;
}

export async function awaitMoney(n, ns) {
	var start = performance.now();
	ns.scriptKill("money.js", "home");
	ns.run("money.js", 1, n);
	while(ns.getPlayer().money < n) {
		ns.print(`Waiting for \$ ${format(n - ns.getPlayer().money)} more money... (${formatTime(performance.now() - start)} elapsed)`);
		await ns.sleep(15000);
	}
	return Promise.resolve();
}
