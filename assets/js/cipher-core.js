(function (root) {
  "use strict";

  const ALPHABET = "אבגדהוזחטיכלמנסעפצקרשת";
  const FINALS = { "כ": "ך", "מ": "ם", "נ": "ן", "פ": "ף", "צ": "ץ" };
  const REGULAR = Object.fromEntries(Object.entries(FINALS).map(([letter, final]) => [final, letter]));

  function normalize(letter) {
    return REGULAR[letter] || letter;
  }

  function parseGuess(input) {
    const letter = normalize(input.trim());
    return letter.length === 1 && ALPHABET.includes(letter) ? letter : null;
  }

  function createPuzzle(level) {
    if (!/^[A-Z]{22}$/.test(level.key) || new Set(level.key).size !== 22) {
      throw new Error("A level key must contain 22 distinct English letters.");
    }
    const encoder = Object.fromEntries([...ALPHABET].map((letter, index) => [letter, level.key[index]]));
    const solution = Object.fromEntries([...ALPHABET].map((letter, index) => [level.key[index], letter]));
    const paragraphs = level.text.split("\n").map((paragraph) => paragraph.split(/(\s+)/).filter(Boolean).map((word) => {
      if (/^\s+$/.test(word)) return { space: word };
      const chars = [...word];
      return { tokens: chars.map((char, index) => {
        const letter = normalize(char);
        if (!ALPHABET.includes(letter)) return { punctuation: char };
        return { cipher: encoder[letter], final: !ALPHABET.includes(normalize(chars[index + 1] || " ")) };
      }) };
    }));
    const used = [...new Set(paragraphs.flatMap((paragraph) => paragraph.flatMap((word) => (word.tokens || []).map((token) => token.cipher).filter(Boolean))))].sort();
    return { paragraphs, solution, used };
  }

  function displayGuess(guess, atWordEnd) {
    return atWordEnd ? FINALS[guess] || guess : guess;
  }

  function cleanGuesses(value, used) {
    const guesses = {};
    if (!value || typeof value !== "object" || Array.isArray(value)) return guesses;
    const assigned = new Set();
    for (const cipher of used) {
      if (!Object.prototype.hasOwnProperty.call(value, cipher) || typeof value[cipher] !== "string") continue;
      const letter = parseGuess(value[cipher]);
      if (letter && !assigned.has(letter)) {
        guesses[cipher] = letter;
        assigned.add(letter);
      }
    }
    return guesses;
  }

  function isSolved(puzzle, guesses) {
    return puzzle.used.every((cipher) => guesses[cipher] === puzzle.solution[cipher]);
  }

  const api = { ALPHABET, normalize, parseGuess, createPuzzle, displayGuess, cleanGuesses, isSolved };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.CipherCore = api;
})(typeof window !== "undefined" ? window : globalThis);
