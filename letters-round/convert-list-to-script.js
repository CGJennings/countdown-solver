/**
 * Converts word-list.txt into a script file that plops the
 * words into the global scope with variable name wordList.
 */

const fs = require("fs");
const { join } = require("path");
const { wordList } = require("./list-loader-node");

let prevWord = wordList[0];
for (let i=1; i<wordList.length; ++i) {
    let p;
    for (p=0; p<9; ++p) {
        if (wordList[i][p] !== prevWord[p]) break;
    }
    prevWord = wordList[i];
    if (p >= 2) {
        wordList[i] = `${p}${wordList[i].substring(p)}`;
    }
}

const script = `
globalThis.wordList=${JSON.stringify(wordList)};
for (let i=1, p, wl=globalThis.wordList; i<wl.length; ++i) {
  p = wl[i][0];
  if (p >= 1 && p <= 9) wl[i] = wl[i-1].substring(0,p) + wl[i].substring(1);
}
`.replace(/\s/g, "").replace("(leti", "(let i");

fs.writeFileSync(join(__dirname, "word-list.js"), script);