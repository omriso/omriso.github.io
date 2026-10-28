"use strict";

// Run with: node --test script/cipher-core.test.cjs
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const core = require("../assets/js/cipher-core.js");
const { keys, eighthKey, codes, levels } = require("../assets/js/cipher-levels.js");
const level = levels.first;
const puzzle = core.createPuzzle(level);

test("the first message decodes exactly, including final letters, punctuation, spaces, and paragraphs", () => {
  const decoded = puzzle.paragraphs.map((paragraph) => paragraph.map((word) => word.space || word.tokens.map((token) => {
    return token.punctuation ?? core.displayGuess(puzzle.solution[token.cipher], token.final);
  }).join("")).join("")).join("\n");
  assert.equal(decoded, level.text);
  assert.equal(puzzle.paragraphs.length, 4);
  assert.match(decoded, /\(שלא הגיע עם שתי הכריות\)\./);
  assert.match(decoded, /שמורכב מארבע אותיות/);
  assert.match(decoded, /בביתך\./);
  assert.match(decoded, /פתקים/);
});

test("the Sinai passage decodes exactly with verse labels, maqaf, and sof pasuq preserved", () => {
  const expected = [
    "כט",
    "ויהי ברדת משה מהר סיני ושני לחת העדת ביד־משה ברדתו מן־ההר ומשה לא־ידע כי קרן עור פניו בדברו אתו׃",
    "ל",
    "וירא אהרן וכל־בני ישראל את־משה והנה קרן עור פניו וייראו מגשת אליו׃",
    "לא",
    "ויקרא אלהם משה וישבו אליו אהרן וכל־הנשאים בעדה וידבר משה אלהם׃"
  ];
  const sinaiPuzzle = core.createPuzzle(levels.sinai);
  const decoded = sinaiPuzzle.paragraphs.map((paragraph) => paragraph.map((word) => word.space || word.tokens.map((token) => {
    return token.punctuation ?? core.displayGuess(sinaiPuzzle.solution[token.cipher], token.final);
  }).join("")).join(""));
  assert.equal(sinaiPuzzle.paragraphs.length, 6);
  assert.deepEqual(decoded, expected);
  assert.deepEqual([decoded[0], decoded[2], decoded[4]], ["כט", "ל", "לא"]);
  assert.equal(decoded.join("\n"), levels.sinai.text);
  assert.equal(decoded.join("\n").match(/־/gu).length, 6);
  assert.equal(decoded.join("\n").match(/׃/gu).length, 3);
});

test("clues retain their fixed physical target codes", () => {
  assert.deepEqual([levels.first.target, levels.vush.target, levels.gift.target, levels.atmosphere.target, levels.sinai.target, levels.mirror.target], ["VUSH", "BPKB", "LCT", "KWTG", "VSE", "KLN"]);
});

test("the gift riddle decodes exactly, including both paragraphs and its parenthetical clue", () => {
  const expected = "אמא שלי חשבה עלינו, ונתנה לנו מתנה. זו יצירה שאנחנו אוהבים מאוד, אבל המתנה ניתנה קצת באיחור, ולכן כמעט לא השתמשנו בה.\nבכל זאת, בתוכה נמצא הקוד הבא, במספר בעל משמעות לשנינו. (הידעת - הקוקטייל בכלל לא קשור לפיצה, הוא מטקסס או מקסיקו, והיא על שם מלכה (אחרת מזו שמוזכרת ביצירה, אבל עם שם דומה))";
  const current = core.createPuzzle(levels.gift);
  assert.equal(current.solution.X, "מ");
  assert.equal(current.solution.Y, "ת");
  assert.equal(current.solution.Z, "נ");
  const decoded = current.paragraphs.map((paragraph) => paragraph.map((word) => word.space || word.tokens.map((token) => {
    return token.punctuation ?? core.displayGuess(current.solution[token.cipher], token.final);
  }).join("")).join("")).join("\n");
  assert.equal(current.paragraphs.length, 2);
  assert.equal(levels.gift.text, expected);
  assert.equal(decoded, expected);
});

test("the new atmosphere riddle preserves the supplied text exactly when decoded", () => {
  const expected = "יש בבית זיכרונות שצברנו משנה לשנה ויש דברים שקשורים לשינה. הקוד הבא מוחבא מתחת למכשיר משונה, שביכולתו לשנות את האווירה בלחיצת כפתור. (בהתחלה החידה הייתה אמורה להיות מבוססת פינק-פלויד, אבל שיניתי אותה)";
  const current = core.createPuzzle(levels.atmosphere);
  const decoded = current.paragraphs.map((paragraph) => paragraph.map((word) => word.space || word.tokens.map((token) => {
    return token.punctuation ?? core.displayGuess(current.solution[token.cipher], token.final);
  }).join("")).join("")).join("\n");
  assert.equal(levels.atmosphere.text, expected);
  assert.equal(decoded, expected);
});

test("the mirror riddle preserves the supplied text, punctuation, and final letters when decoded", () => {
  const expected = "אתה חתיך ויפה! אני אוהב את האף שלך ואת העיניים שלך. אני אוהב את הלחיים שלך ואת החיוך שלך. יש מקום בבית שגם אתה יכול לראות את זה! בעצם די הרבה פעמים... מצד שמאל מתחת למשהו מוחבא מה שאתה מחפש.";
  const current = core.createPuzzle(levels.mirror);
  const decoded = current.paragraphs.map((paragraph) => paragraph.map((word) => word.space || word.tokens.map((token) => {
    return token.punctuation ?? core.displayGuess(current.solution[token.cipher], token.final);
  }).join("")).join("")).join("\n");
  assert.equal(levels.mirror.text, expected);
  assert.equal(decoded, expected);
});

test("all code pages form the complete riddle route and keep the travel photos together", () => {
  assert.equal(levels.vush.source, levels.first.target);
  assert.equal(levels.gift.source, levels.vush.target);
  assert.equal(levels.atmosphere.source, levels.gift.target);
  assert.equal(levels.sinai.source, levels.atmosphere.target);
  assert.equal(levels.mirror.source, levels.sinai.target);
  assert.equal(levels.kwtg.source, levels.mirror.target);
  assert.equal(levels.kwtg.target, null);
  const sources = Object.values(levels).map((current) => current.source).filter(Boolean);
  assert.equal(new Set(sources).size, sources.length);
  assert.deepEqual([...sources].sort(), [...codes].sort());
  for (const [name, current] of Object.entries(levels)) {
    if (!current.source) continue;
    assert.ok(codes.includes(current.source));
    const html = fs.readFileSync(path.join(__dirname, "..", `${current.source}.html`), "utf8");
    assert.match(html, new RegExp(`data-level="${name}"`));
    assert.match(html, /src="assets\/js\/cipher-levels\.js"/);
    for (const photo of ["from-tour-eifel.jpg", "from-coloseum.jpeg"]) {
      assert.equal(html.includes(photo), name === "vush");
    }
  }
  assert.equal(levels.vush.text, "🎶 היינו בפריז וגם ברומא... 🎶\nאבל שם לא פגשנו את אבא או רון.\nהקוד הבא מסתתר יחד איתם, מאחורי נוף משגע.");
});

test("the eight configured words stay bold in ciphertext and guesses without emphasizing punctuation", () => {
  const emphasizedWords = puzzle.paragraphs.flatMap((paragraph) => paragraph.filter((word) => word.tokens).map((word) => {
    return word.tokens.filter((token) => token.emphasized).map((token) => core.displayGuess(puzzle.solution[token.cipher], token.final)).join("");
  })).filter(Boolean);
  assert.deepEqual(emphasizedWords, ["שמיני", "משבעה", "לשישה", "החמישי", "מארבע", "השלישי", "שתי", "אחת"]);
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

test("seven distinct substitution keys supply א through ש in the eighth key", () => {
  assert.equal(keys.length, 7);
  assert.equal(new Set(keys).size, 7);
  for (const key of keys) {
    assert.match(key, /^[A-Z]{22}$/);
    assert.equal(new Set(key).size, 22);
  }
  const contributions = keys.map((key, index) => {
    const start = index * 3;
    const end = start + 3;
    assert.equal(key.slice(start, end), eighthKey.slice(start, end));
    return key.slice(start, end);
  });
  assert.equal(contributions.join(""), eighthKey.slice(0, 21));
  assert.notEqual(keys[6][21], eighthKey[21], "the seventh key does not supply ת");
});

test("the eighth key preserves every requested Hebrew-to-Latin correspondence", () => {
  const expected = {
    א: "H", ב: "V", ג: "O", ד: "J", ה: "U", ו: "S", ז: "C", ח: "F",
    ט: "E", י: "K", כ: "X", ל: "L", מ: "T", נ: "B", ס: "M", ע: "G",
    פ: "Y", צ: "P", ק: "Z", ר: "W", ש: "N", ת: "D"
  };
  assert.deepEqual(Object.fromEntries([...core.ALPHABET].map((letter, index) => [letter, eighthKey[index]])), expected);
});

test("the 21 contributed letters decode all six codes without ת, including final letters", () => {
  assert.deepEqual(codes, ["LCT", "VSE", "BPKB", "KLN", "VUSH", "KWTG"]);
  const solution = Object.fromEntries(keys.flatMap((key, index) => {
    const start = index * 3;
    return [...key.slice(start, start + 3)].map((letter, offset) => [letter, core.ALPHABET[start + offset]]);
  }));
  assert.equal(Object.keys(solution).length, 21);
  assert.equal(Object.values(solution).includes("ת"), false);
  assert.equal(solution[eighthKey[21]], undefined);
  const words = codes.map((code) => [...code].reverse().map((letter, index) => {
    assert.ok(solution[letter], `the contributed letters must decode ${letter}`);
    return core.displayGuess(solution[letter], index === code.length - 1);
  }).join(""));
  assert.deepEqual(words, ["מזל", "טוב", "ניצן", "שלי", "אוהב", "עמרי"]);
});

test("playable puzzles expose every letter needed for their contribution, in solve order", () => {
  for (const [name, index] of [["first", 0], ["vush", 1], ["gift", 2], ["atmosphere", 3], ["sinai", 4], ["mirror", 5], ["kwtg", 6]]) {
    const current = levels[name];
    assert.equal(current.key, keys[index]);
    const currentPuzzle = core.createPuzzle(current);
    const usedLetters = new Set(currentPuzzle.used.map((letter) => currentPuzzle.solution[letter]));
    const contribution = core.ALPHABET.slice(index * 3, index * 3 + 3);
    for (const letter of contribution) {
      assert.ok(usedLetters.has(letter), `${name} must let the player discover ${letter}`);
    }
  }
  assert.match(levels.kwtg.text, /ק[-–־]ש/, "the final instructions must stop at ש");
});

test("changed puzzle keys do not restore guesses saved under their previous keys", () => {
  const previousIds = { first: "first-key-v1", vush: "vush-v4", gift: "gift-v2", atmosphere: "atmosphere-v2", sinai: "sinai-v1", kwtg: "kwtg-v1" };
  for (const [name, previousId] of Object.entries(previousIds)) {
    assert.ok(levels[name].id);
    assert.notEqual(levels[name].id, previousId);
  }
  assert.equal(new Set(Object.keys(previousIds).map((name) => levels[name].id)).size, Object.keys(previousIds).length);
  assert.equal(new Set(Object.values(levels).map((current) => current.id)).size, Object.keys(levels).length);
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
