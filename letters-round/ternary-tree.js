class TernarySearchTree {
    #root = null;

    /** Creates a new, empty ternary search tree. */
    constructor() {
    }

    /** Removes all strings from the tree. */
    clear() {
        this.#root = null;
    }

    /**
     * Returns a boolean value indicating whether the specified word is in the tree.
     * 
     * @param {string} word The string to test for membership.
     * @returns True if the string is in the tree; otherwise false.
     */
    has(word) {
        if (word == null) return false;
        return this.#has(this.#root, String(word), 0);
    }
    #has(node, word, i) {
        if (node == null) return false;

        let ch = word.charCodeAt(i);
        if (ch < node.char) {
            // follow less than branch
            return this.#has(node.lt, word, i);
        } else if (ch > node.char) {
            // follow greater than branch
            return this.#has(node.gt, word, i);
        } else {
            // following equal to branch: move to next letter of word
            ++i;
            if (i === word.length) {
                // if eow is true, returns true;
                // if eow is undefined, returns false
                return !!node.eow;
            }
            return this.#has(node.eq, word, i);
        }
    }

    /**
     * Adds a string to the tree. This has no effect if the string is already in the tree.
     * 
     * @param {string} word The non-null string to add to the tree.
     */
    add(word) {
        if (word == null) throw new ReferenceError("null word");
        this.#root = this.#add(this.#root, String(word), 0);
    }
    #add(node, word, i) {
        let ch = word.charCodeAt(i);

        if (node == null) {
            node = {
                char: ch,
                lt: null,
                eq: null,
                gt: null
            };
        }

        if (ch < node.char) {
            node.lt = this.#add(node.lt, word, i);
        } else if (ch > node.char) {
            node.gt = this.#add(node.gt, word, i);
        } else {
            ++i;
            if (i == word.length) {
                node.eow = true;
            } else {
                node.eq = this.#add(node.eq, word, i);
            }
        }

        return node;
    }

    /**
     * Adds an array of strings to the tree.
     * 
     * @param {string[]} words The words to add to the tree.
     * @param {number} start The optional index of the first element to add; default is 0.
     * @param {number} end The optional index of the last element to add (inclusive); default is `words.length - 1`.
     */
    addAll(words, start = 0, end) {
        if (words == null) throw new ReferenceError("null words");
        if (end === undefined) end = words.length - 1;
        if (end < start) return;

        // if the tree is empty and the list is sorted, this insertion
        // order ensures a balanced tree (inserting words in sorted order
        // is a degenerate case)
        const mid = Math.floor(start + (end - start) / 2);
        this.add(words[mid]);
        this.addAll(words, start, mid - 1);
        this.addAll(words, mid + 1, end);
    }

    /**
     * Calls the specified function once for each string in the tree. The function will be passed
     * each word in the tree in turn, in ascending order.
     * 
     * @param {(word: string) => any} wordFn A function to be repeatedly called with each string in the tree.
     */
    forEach(wordFn) {
        this.#visitWords(this.#root, [], path => wordFn(String.fromCharCode(...path)));
    }

    /**
     * Returns the number of strings in the tree.
     * 
     * @returns The number of values in this set.
     */
    get size() {
        let wordCount = 0;
        this.#visitWords(this.#root, [], path => ++wordCount);
        return wordCount;
    }

    #visitWords(node, treePath, treePathFn) {
        if (node == null) return;

        this.#visitWords(node.lt, treePath, treePathFn);
        treePath.push(node.char);
        if (node.eow) treePathFn(treePath);
        this.#visitWords(node.eq, treePath, treePathFn);
        treePath.pop();
        this.#visitWords(node.gt, treePath, treePathFn);
    }

    /**
     * Returns all strings that can be made from the specified letters.
     * Using only a subset of the letters is allowed, but a given letter
     * can only be used as many times as it appears in the input.
     * 
     * @param {string} letters The letters to use to match words.
     * @returns An array of all matching words in sorted order.
     */
    arrangements(letters) {
        if (letters == null) throw new ReferenceError("null letters");
        letters = String(letters);

        // charMap[charCode] is the number of times charCode appears in letters
        const charMap = [];
        for (let i = 0; i < letters.length; ++i) {
            const char = letters.charCodeAt(i);
            charMap[char] = charMap[char] ? charMap[char] + 1 : 1;
        }

        const words = [];
        this.#arrangements(this.#root, charMap, [], words);
        return words;
    }

    #arrangements(node, charMap, treePath, words) {
        if (node == null) return;

        this.#arrangements(node.lt, charMap, treePath, words);

        if (charMap[node.char] > 0) {
            // use one copy of the current character
            --charMap[node.char];
            // add the character to the current prefix
            treePath.push(node.char);
            // add this solution if this node is a word
            if (node.eow) {
                words.push(String.fromCharCode(...treePath));
            }
            // follow the equals branch
            this.#arrangements(node.eq, charMap, treePath, words);
            // restore the previous prefix
            treePath.pop();
            // make the current character available again
            ++charMap[node.char];
        }

        this.#arrangements(node.gt, charMap, treePath, words);
    }
}

if (globalThis.module) module.exports.TernarySearchTree = TernarySearchTree;