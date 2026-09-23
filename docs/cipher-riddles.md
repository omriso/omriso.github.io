# Cipher riddle sources and physical targets

Each riddle has two separate routing properties in `assets/js/cipher-levels.js`:

- **Source:** the code used to open the riddle at `https://omriso.github.io/CODE`. This assignment can change.
- **Target:** the code found by following the riddle's physical clue. This belongs to the riddle text and **must not change** when the riddle moves to a different source.

The opening riddle has no source code; it is at `/cipher`. The final riddle has no further physical target. These cases use `null` in the data. Target metadata is for authoring; the game does not display it or link directly to the answer.

Data entry names identify riddles independently of their current source codes. The Paris and Rome riddle is `vush` at source `VUSH`, while the final riddle remains `kwtg` at source `KLN`. A source-only move also preserves the storage `id`; a changed key or text requires a new storage version.

## Current riddles

| Riddle / data entry | Current source | Fixed physical target | Key number | Contribution |
| --- | --- | --- | --- | --- |
| Opening (`first`) | `/cipher` | `VUSH` | 1 | א–ג |
| Paris and Rome (`vush`) | `VUSH` | `BPKB` | 2 | ד–ו |
| Gift from Mom (`gift`) | `BPKB` | `LCT` | 3 | ז–ט |
| Memories and sleep (`atmosphere`) | `LCT` | `KWTG` | 4 | י–ל |
| Sinai passage, verses כט–לא (`sinai`) | `KWTG` | `VSE` | 5 | מ–ס |
| Mirror (`mirror`) | `VSE` | `KLN` | 6 | ע–צ |
| Final key instructions (`kwtg`) | `KLN` | None; final riddle | 7 | ק–ש |

All seven riddles are authored. The full confirmed sequence is `/cipher` → `VUSH` → `BPKB` → `LCT` → `KWTG` → `VSE` → `KLN`.

The Paris and Rome riddle uses key 2 at `VUSH`, with its exact original clue text and two photographs. The memories and sleep riddle uses key 4 at `LCT`, with its exact supplied text and fixed target `KWTG`. Its text contains all three required letters: י, כ, and ל.

The gift riddle uses key 3 at `BPKB` and leads physically to `LCT`. Both supplied paragraphs are preserved, and its text contains all three required letters: ז, ח, and ט.

The Sinai passage opens at `KWTG` because the preceding memories and sleep riddle physically leads to that code. These source assignments preserve both riddles' fixed targets. The Sinai passage remains fifth, with its existing key and exact text.

The mirror riddle uses key 6 at `VSE` and leads physically to the final riddle at `KLN`. Its supplied text contains all three required letters: ע, פ, and צ.

## Moving a riddle

1. Change its `source` and move its root HTML page to `NEWCODE.html`. Keep the page's `data-level` pointing to the same riddle entry.
2. Preserve the riddle's text and `target`. Update this table with its new source.
3. Check the route from the preceding riddle: its fixed target must match this riddle's new source. Reassign sources to connect the route; do not rewrite a physical target to force a sequence.
4. If the solve position changes, assign the key for that position and verify the player can recover every Hebrew letter contributed by that key. Bump the riddle's storage `id` if its key or text changes, so old guesses are not reused.

The Sinai passage is assigned to position 5 and contains all three letters contributed by the fifth key: מ, נ, and ס. It lacks ז, so it cannot supply all of the third key's ז–ט group. Its exact text is preserved, its current source KWTG is editable, and its target VSE is fixed.

## Final message order

The code order for decoding the final message is separate from the solve order:

`LCT VSE BPKB KLN VUSH KWTG`

Using the eighth key and reversing each decoded word yields:

מזל טוב ניצן שלי אוהב עמרי

The seven keys contribute three letters each, covering א–ש. ת is unused by the six codes and is not supplied by the seventh key.
