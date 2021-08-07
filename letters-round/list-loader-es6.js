/**
 * An ES6 module that loads the word list in browsers.
 * In compatible browsers, you could use it like this:
 * 
 * import { wordList } from "./list-loader-es6.js";
 */

async function loadWordList() {
    try {
        const response = await fetch("word-list.txt");
        if (!response.ok) throw new Error(res.statusText);
        const text = await response.text();
        return text.split("\n");
    } catch (ex) {
        throw new Error("Unable to download word list: " + ex);
    }
}

export const wordList = await loadWordList();