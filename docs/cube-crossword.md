# Hebrew cube crossword

Open `cube-crossword.html` directly in a browser, or visit `/cube-crossword/`
on the website (which redirects to `/cube-crossword.html`). The game uses plain
relative script paths and does not require a Jekyll build for local play.

Supply the real puzzle in `assets/js/cube-crossword-data.js` by replacing `null`
with an object like this (all 27 actual clues are required):

```js
{
  id: "brother-cube-v1",
  reflections: true,
  preserveDirections: true,
  layers: [
    ["אבג", "דהו", "זחט"],
    ["יכל", "מנס", "עפצ"],
    ["קרש", "תאב", "גדה"]
  ],
  clues: [
    { text: "Your Hebrew clue", answer: "אבג" }
    // ... 26 more, in the desired scrambled order
  ]
}
```

The strings above only illustrate coordinates, and are not a playable puzzle.
Each row runs right to left. Layers run front to back, numbered 1–3.
Answers must match the multiset of the cube's 27 positive-direction lines:
nine rows, nine columns, nine depth lines. Use ordinary or final letter forms;
checking treats those as equivalent and ignores Hebrew vowel marks and spaces.
Identical clue texts share their pool of answers, with multiplicity respected.
The page preserves the supplied scrambled clue order.

Alternatively import a JSON object through the preparation panel for a local
preview. Imports stay in the current page session; put the object in the data
file to distribute the puzzle. Answer keys are visible in browser source, as
with any static client-side puzzle.

Both panels confirm at cumulative totals 1, 8, and 27. Checks between checkpoints
give no per-answer correctness feedback. Confirmed clues and letters lock.
The current puzzle sets `preserveDirections: true`: cube checks accept only the
six axis permutations with no axis reversed. Every answer reads right to left,
top to bottom, or down the layers. Without this option, checks consider all 48
axis permutations/reflections (24 rotations when `reflections: false`). Checks
always use a single orientation consistent with the
locked cells. A fully filled incidental line through locked cells also counts
as correct at the next checkpoint. Progress is local to the browser and puzzle
content.

Run the logic checks with `node tests/cube-crossword.test.cjs`.
