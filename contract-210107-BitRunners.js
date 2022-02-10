
/*
Host: nwo
Problem: Unique Paths in a Grid II
Tries Left: 10

Description:
You are located in the top-left corner of the following grid:

0,1,0,0,0,0,
0,1,0,0,0,0,
0,0,1,0,0,0,
0,0,0,0,0,0,
0,0,0,0,1,0,
0,1,0,0,0,0,
0,0,1,0,0,0,

 You are trying reach the bottom-right corner of the grid, but you can only move down or right on each step.
 Furthermore, there are obstacles on the grid that you cannot move onto.
 These obstacles are denoted by '1', while empty spaces are denoted by 0.

 Determine how many unique paths there are from start to finish.

 NOTE: The data returned for this contract is an 2D array of numbers representing the grid.

Data:
0,1,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,1,0,0,0

*/
const OFFSET_RIGHT = 1;
const OFFSET_DOWN = 6;

/** @param {NS} ns */
export async function main(ns) {
    const data = ns.codingcontract.getData("contract-210107-BitRunners.cct", "nwo");
    ns.print(JSON.stringify(data));
    const answer = solve(ns, data);
    ns.print(answer);

    if (answer !== undefined && ns.args.indexOf("submit") != -1) {
        ns.print("SUBMITTED!");
        ns.print(JSON.stringify(ns.codingcontract.attempt(answer, "contract-210107-BitRunners.cct", "nwo", { returnReward: true })));
    }
}

/** @param data {number[]} */
function solve(ns, data) {
    data = data.flat(2);

    // make blocking squares negative.
    data = data.map((val) => val * -1);
    ns.print(data);

    // fill all touchable spaces
    flood(data);
    ns.print(data);

    // backtrack from bottom filling in data
    backtrack(data);
    ns.print(data);

    return data[0];
}

/**
 * 
 * @param {number[]} data 
 */
function backtrack(data) {
    // We start at L-2, since we know the last cell contains a 1.
    for(var i = data.length - 2; i >= 0; i--) {
        if(isWall(data, i))
            continue;

        data[i] = getOffset(OFFSET_RIGHT, data, i) + getOffset(OFFSET_DOWN, data, i);
    }
}

function getOffset(offset, data, i) {
    // End of length
    if (i + offset >= data.length) {
        return 0;
    }

    // Right side
    if(offset === OFFSET_RIGHT && i % 6 === 5) {
        return 0;
    }

    // Wall
    if (isWall(data, i + offset)) {
        return 0;
    }

    return data[i + offset];
}

/**
 * 
 * @param {number[]} data 
 */
function flood(data) {
    // Starting spot always reachable
    data[0] = 1;

    // Phase 1: put a 1 everywhere reachable
    for (var i = 0; i < data.length; i++) {
        if (isWall(data, i)) {
            continue;
        }

        // Update neighbors if you're at a safe space
        if (data[i] === 1) {
            floodOffset(OFFSET_RIGHT, data, i);
            floodOffset(OFFSET_DOWN, data, i);
        }
    }
}

/**
 * 
 * @param {number[]} data 
 * @param {number} i 
 * @returns true, if the given index is a wall.
 */
function isWall(data, i) {
    return data[i] === -1;
}

/**
 * @param {number} step 
 * @param {number[]} data 
 * @param {number} index 
 */
function floodOffset(step, data, index) {
    if (index + step >= data.length) {
        return;
    }

    if (isWall(data, index + step)) {
        return;
    }

    data[index + step] = 1;
}