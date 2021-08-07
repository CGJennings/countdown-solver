# countdown-solver

Solving puzzles in the style of the game show Countdown.

This repository contains source code for a [series of articles](https://cgjennings.ca/articles/?tag=Countdown&order=ascending)
based on the game show Countdown. It contains code to solve puzzles from both the
*numbers rounds* and *letters rounds* of that show.

**The code**  
All code is in plain, modern JavaScript. Type information suitable for TypeScript is
included in the doc comments.

**Word list**  
A suitable word list in included under `letters-round/`. It should be similar enough to
the official list of words allowed on the show for most purposes. Although potentially
offensive words are generally allowed on the show, I've excluded them from this list.
The purpose is not censorship, but simply to avoid shocking unsuspecting users.
Be aware, though, that I might have missed some.

**Ternary trees**  
For the letters round, the articles develop a minimal implementation of ternary search trees.
I've also made a more featureful implementation with proper Unicode support, more types
of approximate matching, serialization, and more. It is available here:

[https://github.com/CGJennings/fast-ternary-string-set](https://github.com/CGJennings/fast-ternary-string-set)

Also available as the `npm` package [`fast-ternary-string-set`](https://npmjs.com/package/fast-ternary-string-set).