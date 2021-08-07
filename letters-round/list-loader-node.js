/**
 * A CommonJS module that loads the word list in NodeJS projects.
 */

const fs = require("fs");
const { join } = require("path");

exports.wordList = fs.readFileSync(join(__dirname, "word-list.txt"), "utf-8").trim().split(/\n/);