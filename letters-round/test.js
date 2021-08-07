console.log("loading word list and setting up tests...");

const { wordList } = require("./list-loader-node");
const { TernarySearchTree } = require("./ternary-tree");

const { performance } = require("perf_hooks");

wordList.sort();

let tree = new TernarySearchTree();
tree.addAll(wordList);

let set = new Set();
wordList.forEach(word => set.add(word));
if (set.size != wordList.length) {
    throw new Error("the source word list has duplicate entries");
}

let stats = tree.treeStats;
let size = tree.size;
console.log(`tree stats: strings = ${stats.strings}, nodes = ${stats.nodes}, depth = ${stats.depth}`);

console.log(`\nthe word list and tree should have the same number of strings (${wordList.length})`);
if (wordList.length !== size) {
    throw new Error("tree has wrong size: " + size);
}

console.log("\nevery word in the list should be in the tree");
wordList.forEach(word => {
    if (!tree.has(word)) throw new Error("tree is missing " + word);
});

console.log("\nentries() must match word list");
const entries = tree.entries();
wordList.forEach((s,i) => { if (wordList[i] !== entries[i]) throw new Error("mismatch at " + i); });

const start = performance.now();
let arrangements = tree.arrangements("chromatic");
const stop = performance.now() - start;
console.log(`\nfound ${arrangements.length} words in ${(stop/1000).toPrecision(3)} s:`);
console.log(arrangements.join(", "));