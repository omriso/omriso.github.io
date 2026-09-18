"use strict";

// Run with: node --test script/cipher-core.test.cjs
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const core = require("../assets/js/cipher-core.js");
const game = fs.readFileSync(path.join(__dirname, "../assets/js/cipher-game.js"), "utf8");
const level = {
  key: JSON.parse(game.match(/key: ("[A-Z]+")/)[1]),
  text: JSON.parse(game.match(/text: ("(?:[^"\\]|\\.)*")/)[1])
};
const puzzle = core.createPuzzle(level);

test("the first message decodes exactly, including final letters, punctuation, spaces, and paragraphs", () => {
  const decoded = puzzle.paragraphs.map((paragraph) => paragraph.map((word) => word.space || word.tokens.map((token) => {
    return token.punctuation ?? core.displayGuess(puzzle.solution[token.cipher], token.final);
  }).join("")).join("")).join("\n");
  assert.equal(decoded, level.text);
  assert.equal(puzzle.paragraphs.length, 4);
  assert.match(decoded, /\(שלא הגיע יחד עם שתי הכריות\)\./);
  assert.match(decoded, /בביתך\./);
  assert.match(decoded, /פתקים/);
});

test("repeated letters use a stable bijective key; another level has an independent key", () => {
  assert.equal(new Set(Object.values(puzzle.solution)).size, 22);
  const sample = core.createPuzzle({ key: level.key, text: "ממ ם" });
  const letters = sample.paragraphs[0].flatMap((word) => word.tokens || []);
  assert.equal(new Set(letters.map((token) => token.cipher)).size, 1);
  assert.deepEqual(letters.map((token) => token.final), [false, true, true]);
  const other = core.createPuzzle({ key: [...level.key].reverse().join(""), text: level.text });
  assert.notDeepEqual(puzzle.solution, other.solution);
  assert.throws(() => core.createPuzzle({ key: "A".repeat(22), text: "א" }));
});

test("final Hebrew forms are normalized and only displayed at word endings", () => {
  for (const [regular, final] of [["כ", "ך"], ["מ", "ם"], ["נ", "ן"], ["פ", "ף"], ["צ", "ץ"]]) {
    assert.equal(core.parseGuess(final), regular);
    assert.equal(core.displayGuess(regular, true), final);
    assert.equal(core.displayGuess(regular, false), regular);
  }
  assert.equal(core.parseGuess(" א "), "א");
  for (const invalid of ["", "אב", "X", "1", ".", "😀"]) assert.equal(core.parseGuess(invalid), null);
});

test("only valid, unique, relevant saved guesses are restored", () => {
  assert.deepEqual(core.cleanGuesses({ A: "ם", B: "מ", C: "ab", D: "א", Z: "ת" }, ["A", "B", "C", "D"]), { A: "מ", D: "א" });
  for (const invalid of [null, false, "text", ["א"], 3]) assert.deepEqual(core.cleanGuesses(invalid, puzzle.used), {});
  assert.deepEqual(core.cleanGuesses(Object.create({ A: "א" }), ["A"]), {});
});

test("completion requires every used letter to be correct and responds to edits and clears", () => {
  const guesses = Object.fromEntries(puzzle.used.map((letter) => [letter, puzzle.solution[letter]]));
  assert.equal(core.isSolved(puzzle, {}), false);
  assert.equal(core.isSolved(puzzle, guesses), true);
  const [first, second] = puzzle.used;
  [guesses[first], guesses[second]] = [guesses[second], guesses[first]];
  assert.equal(core.isSolved(puzzle, guesses), false);
  [guesses[first], guesses[second]] = [guesses[second], guesses[first]];
  delete guesses[first];
  assert.equal(core.isSolved(puzzle, guesses), false);
});
