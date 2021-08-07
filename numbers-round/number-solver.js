/**
 * The input for a numbers round: a target number and a list of values
 * that can be used to compute the target.
 */
class NumberPuzzle {
    /** The target number to reach. */
    target;
    /** @type {number[]} The numbers to combine to reach the target. */
    values;

    /**
     * Create a new numbers round. All arguments are optional; any that are
     * omitted will use the standard rules.
     * 
     * @param {number} target The target to solve for.
     * @param {number} numBigOnes The number of random "big numbers" to select.
     * @param {number} numSelections The total number of numbers to select (big and little).
     * @param {number[]} bigOnes Array of the big numbers to choose from.
     * @param {number[]} littleOnes Array of the little numbers to choose from.
     */
    constructor(target, numBigOnes, numSelections, bigOnes, littleOnes) {
        if (target == null) target = 100 + this.random(900);
        if (numBigOnes == null) numBigOnes = 2;
        if (numSelections == null) numSelections = 6;
        if (bigOnes == null) bigOnes = this.standardBigOnes();
        if (littleOnes == null) littleOnes = this.standardLittleOnes();

        bigOnes = [...bigOnes];
        littleOnes = [...littleOnes];

        if (numBigOnes !== numSelections) {
            this.shuffle(bigOnes);
            this.shuffle(littleOnes);
        } else {
            // if given a list of the exact numbers to use, reverse
            // them to preserve their order after popping
            bigOnes.reverse();
        }

        this.values = [];
        for (let i = 0; i < numBigOnes; ++i) {
            this.values.push(bigOnes.pop());
        }
        const numLittleOnes = numSelections - numBigOnes;
        for (let i = 0; i < numLittleOnes; ++i) {
            this.values.push(littleOnes.pop());
        }

        this.target = target;
    }

    /** Return an array of the standard big numbers. */
    standardBigOnes() {
        return [100, 75, 50, 25];
    }

    /** Return an array of the standard little numbers. */
    standardLittleOnes() {
        const littles = [];
        for (let i = 1; i <= 10; ++i) {
            littles.push(i, i);
        }
        return littles;
    }

    /** Choose a random integer from 0 to n-1. */
    random(n) {
        return Math.floor(Math.random() * Math.floor(n));
    }

    /** Randomize the elements in an array. */
    shuffle(a) {
        for (let i = 0; i < a.length; ++i) {
            const j = this.random(a.length);
            const t = a[i];
            a[i] = a[j];
            a[j] = t;
        }
    }

    /**
     * Returns solutions for the puzzle, if any.
     * @returns {{best: Value, all: Value[]}} The best (or closest) solution,
     *     and all exact solutions.
     */
    solve() {
        let values = this.values.map(n => new Value(n));
        let solns = {
            best: values[0],
            all: []
        }
        values.forEach(v => consider(v, this.target, solns));
        solveImpl(values, this.target, solns);
        solns.all.sort((v1, v2) => v1.compareTo(v2, this.target));
        return solns;
    }

    toString() {
        return `Try to make ${this.target} using ${this.values.join(", ")}.`;
    }
}

/**
 * Describes one value that may be part of a solution, including a description
 * of all the steps that led up to this value.
 */
class Value {
    number;
    lhs = null;
    rhs = null;
    operator = null;
    steps = 0;

    /**
     * Creates a new Value. The constructor is used to create the starting
     * values that act as inputs to the problem.
     * 
     * @param {number} n The input value.
     */
    constructor(n) {
        this.number = n;
    }

    /**
     * Returns a new value that combines this value with the specified value
     * using the given operand. This value must be greater than
     * or equal to the rhs value.
     * 
     * @param {Value} rhs The value to combine with this value.
     * @param {"+"|"-"|"×"|"/"} operator The arithmetic operation to apply.
     * @returns {Value} The derived value, or null if the result is not allowed
    *      (a fraction or number less than one).
     */
    combine(rhs, operator) {
        let n;
        switch (operator) {
            case "+":
                n = this.number + rhs.number;
                break;
            case "×":
                n = this.number * rhs.number;
                break;
            case "-":
                n = this.number - rhs.number;
                if (n < 1) return null;
                break;
            case "/":
                n = this.number / rhs.number;
                if (!Number.isInteger(n)) return null;
                break;
            default: throw new Error(`unknown operator ${operator}`);
        }

        let v = new Value(n);
        v.lhs = this;
        v.rhs = rhs;
        v.operator = operator;
        v.steps = this.steps + rhs.steps + 1;
        return v;
    }

    /**
     * Compares this value to another value, returning zero if the values are equal,
     * a negative number if this value precedes the other value, or a positive number
     * otherwise.
     * 
     * @param {Value} rhs The value to compare this value to.
     * @param {number} target The round's target number.
     */
    compareTo(rhs, target) {
        // pick value closest to target
        const lDist = Math.abs(this.number - target);
        const rDist = Math.abs(rhs.number - target);
        if (lDist !== rDist) return lDist - rDist;

        // pick value that requires the fewest steps
        const lSteps = this.steps;
        const rSteps = rhs.steps;
        if (lSteps !== rSteps) return lSteps - rSteps;

        // pick value with shortest string representation
        return this.toString().length - rhs.toString().length;
    }

    /**
     * Returns a string that reprents the steps used to create this value as a JavaScript expression.
     */
    toExpression() {
        if (this.lhs == null) {
            return String(this.number);
        }
        return `(${this.lhs.toExpression()}) ${this.operator} (${this.rhs.toExpression()})`;
    }

    /**
     * Returns whether the string expression for this Value actually matches its number value.
     */
    verify() {
        let fn = new Function(`return ${this.number} === ${this.toString().replace(/×/g, "*")}`);
        return fn();
    }

    /**
     * Returns a string that describes the steps needed to reproduce
     * this value from the starting input.
     */
    toListOfSteps() {
        // if this is a starting value, then the only "step"
        // involved is that the number itself matches the target
        if (this.lhs == null) {
            return `${this.number} = ${this.number}`;
        }

        // recursive helper function that walks the history tree,
        // capturing the calculations performed in reverse order
        function steps(v) {
            // ignore starting values
            if (v.lhs == null) return "";
            // first gather up the steps from deeper in the tree,
            // then append this step to the end
            const prevSteps = steps(v.lhs) + steps(v.rhs);
            return prevSteps + `${v.lhs.number} ${v.operator} ${v.rhs.number} = ${v.number}\n`;
        };
        return steps(this).trim();
    }

    toString() {
        if (this.#simpleExpression == null) {
            let expr = this.toExpression();
            // replace lone numbers in brackets with just the number
            expr = expr.replace(/\((\d+)\)/ug, "$1");

            const plusReduce = /\(\((\d+) \+ (\d+(?: \+ \d+)*)\) \+ (\d+)\)/ug;
            const minusReduce = /\(\((\d+) - (\d+(?: - \d+)*)\) - (\d+)\)/ug;
            const multReduce = /\(\((\d+) × (\d+(?: × \d+)*)\) × (\d+)\)/ug;
            const divReduce = /\(\((\d+) \/ (\d+(?: \/ \d+)*)\) \/ (\d+)\)/ug;
            for (; ;) {
                let oldExpr = expr;
                expr = expr.replace(plusReduce, "($1 + $2 + $3)");
                expr = expr.replace(minusReduce, "($1 - $2 - $3)");
                expr = expr.replace(multReduce, "($1 × $2 × $3)");
                expr = expr.replace(divReduce, "($1 / $2 / $3)");
                if (oldExpr === expr) break;
            }
            this.#simpleExpression = expr;
        }
        return this.#simpleExpression;
    }
    #simpleExpression = null;
}

/**
 * Consider a potential solution, adding it to the list if relevant.
 * 
 * @param {Value} value The potential solution to consider.
 * @param {number} target The target number.
 * @param {{best: Value, all: Value[]}} solns The collection of solutions found so far.
 */
function consider(value, target, solns) {
    if (value.compareTo(solns.best, target) < 0) {
        solns.best = value;
    }
    if (value.number === target) {
        solns.all.push(value);
    }
}

const operations = ["+", "-", "×", "/"];

/**
 * Implementation of the puzzle solver.
 * 
 * @param {Value[]} values The number values to use to make the target.
 * @param {number} target The target number to reach.
 * @param {{best: Value, all: Value[]}} solns Discovered solutions.
 */
function solveImpl(values, target, solns) {
    for (let i = 0; i < values.length - 1; ++i) {
        for (let j = i + 1; j < values.length; ++j) {
            // get pair of values to combine and ensure they are in sorted order
            let lhs = values[i], rhs = values[j];
            if (lhs.number < rhs.number) {
                [lhs, rhs] = [rhs, lhs];
            }

            // try combining the values with each operation
            for (let op of operations) {
                const result = lhs.combine(rhs, op);
                if (result == null) continue;

                consider(result, target, solns);

                // if there are more than two values left in the list,
                // we can still make more pairs from the shorter list
                if (values.length > 2) {
                    const reducedValues = reduce(values, i, j, result);
                    solveImpl(reducedValues, target, solns);
                }
            }
        }
    }
}

/**
 * Returns a copy of a value array with the specified elements
 * merged into a single new entry. The indices must be different.
 */
function reduce(values, skipIndex1, skipIndex2, combined) {
    if (combined == null) return null;
    const copy = [combined];
    for (let i = 0; i < values.length; ++i) {
        if (i === skipIndex1 || i === skipIndex2) continue;
        copy.push(values[i]);
    }
    return copy;
}


if (typeof module === "object" && typeof module.exports === "object") {
    exports.NumberPuzzle = NumberPuzzle;
    exports.Value = Value;
}