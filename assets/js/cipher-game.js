(function () {
  "use strict";

  const core = window.CipherCore;
  // Each future level gets its own id, text, and independent 22-letter key.
  // Final Hebrew forms share their regular letter's substitution.
  const level = {
    id: "first-key-v1",
    key: "YQKXBRZFTNWAJHGPVUSMEC",
    text: "מפתח שמיני מורכב משבעה מפתחות.\nהקודים לשישה מפתחות מוחבאים על פתקים בביתך.\nהחמישי, שמורכב בארבע אותיות, מוחבא בשק השלישי (שלא הגיע יחד עם שתי הכריות).\nזה כמובן, מפתח מספר אחת!"
  };
  const puzzle = core.createPuzzle(level);
  const storageKey = "eighth-key:" + level.id;
  const $ = (id) => document.getElementById(id);
  const cipher = $("cipher");
  const letterDialog = $("letter-dialog");
  const keyDialog = $("key-dialog");
  const input = $("hebrew-input");
  const keyboard = $("hebrew-keyboard");
  const tiles = [];
  let guesses = {};
  let activeCipher = null;
  let returnToKey = false;
  let storageAvailable = true;

  try {
    guesses = core.cleanGuesses(JSON.parse(localStorage.getItem(storageKey)), puzzle.used);
  } catch (_) {
    // A malformed save or blocked storage must never prevent playing.
    guesses = {};
  }

  function persist() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(guesses));
      storageAvailable = true;
    } catch (_) {
      storageAvailable = false;
    }
    $("storage-notice").hidden = storageAvailable;
  }

  function renderCipher() {
    for (const paragraph of puzzle.paragraphs) {
      const row = document.createElement("p");
      row.className = "cipher-paragraph";
      for (const word of paragraph) {
        if (word.space) continue; // Flex gaps preserve word boundaries without bidi reordering.
        const group = document.createElement("span");
        group.className = "cipher-word";
        for (const token of word.tokens) {
          if (token.punctuation !== undefined) {
            const mark = document.createElement("span");
            mark.className = "punctuation";
            mark.textContent = token.punctuation;
            group.append(mark);
          } else {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "letter";
            button.dataset.cipher = token.cipher;
            button.setAttribute("aria-haspopup", "dialog");
            button.addEventListener("click", () => openLetter(token.cipher));
            button.addEventListener("pointerenter", () => highlight(token.cipher));
            button.addEventListener("pointerleave", () => highlight(null));
            button.addEventListener("focus", () => highlight(token.cipher));
            button.addEventListener("blur", () => highlight(null));
            tiles.push({ button, token });
            group.append(button);
          }
        }
        row.append(group);
      }
      cipher.append(row);
    }
  }

  function highlight(selected) {
    for (const { button, token } of tiles) button.classList.toggle("matching", token.cipher === selected);
  }

  function update() {
    for (const { button, token } of tiles) {
      const guess = guesses[token.cipher];
      const shown = guess ? core.displayGuess(guess, token.final) : token.cipher;
      button.textContent = shown;
      button.classList.toggle("assigned", Boolean(guess));
      button.setAttribute("aria-label", guess ? `${token.cipher} = ${shown}, שינוי ההחלפה` : `${token.cipher}, בחירת אות בעברית`);
    }
    const count = Object.keys(guesses).length;
    $("key-count").textContent = count;
    $("progress-label").textContent = `${count} מתוך ${puzzle.used.length} אותיות הוחלפו`;
    $("progress").setAttribute("aria-valuemax", puzzle.used.length);
    $("progress").setAttribute("aria-valuenow", count);
    $("progress-fill").style.width = `${count / puzzle.used.length * 100}%`;
    const solved = core.isSolved(puzzle, guesses);
    $("completion").hidden = !solved;
    document.querySelector(".level.current").classList.toggle("complete", solved);
    renderKey();
  }

  function renderKey() {
    const list = $("key-list");
    list.replaceChildren();
    const entries = puzzle.used.filter((letter) => guesses[letter]);
    $("empty-key").hidden = entries.length > 0;
    for (const letter of entries) {
      const button = document.createElement("button");
      button.className = "key-entry";
      button.type = "button";
      button.dataset.cipher = letter;
      button.setAttribute("aria-label", `${letter} = ${guesses[letter]}, שינוי ההחלפה`);
      for (const [text, className] of [[letter, "cipher-value"], ["=", "key-equals"], [guesses[letter], "guess-value"]]) {
        const span = document.createElement("span");
        span.textContent = text;
        span.className = className;
        button.append(span);
      }
      button.addEventListener("click", () => openLetter(letter, true));
      list.append(button);
    }
  }

  function updateKeyboard() {
    const current = core.parseGuess(input.value);
    for (const button of keyboard.children) {
      const owner = Object.keys(guesses).find((cipherLetter) => guesses[cipherLetter] === button.dataset.letter && cipherLetter !== activeCipher);
      button.classList.toggle("in-use", Boolean(owner));
      button.setAttribute("aria-pressed", String(button.dataset.letter === current));
      button.setAttribute("aria-label", owner ? `${button.dataset.letter}, משויכת לאות ${owner}` : button.dataset.letter);
    }
  }

  function openLetter(letter, fromKey = false) {
    returnToKey = fromKey;
    if (keyDialog.open) keyDialog.close();
    activeCipher = letter;
    $("source-letter").textContent = letter;
    input.value = guesses[letter] || "";
    $("letter-error").textContent = "";
    input.removeAttribute("aria-invalid");
    $("clear-letter").disabled = !guesses[letter];
    updateKeyboard();
    highlight(null);
    letterDialog.showModal();
    // Keep the phone's native keyboard closed; the on-screen Hebrew keyboard is ready.
    // Desktop players can focus the input and type or paste a Hebrew letter.
    keyboard.querySelector(`[data-letter="${guesses[letter] || core.ALPHABET[0]}"]`).focus({ preventScroll: true });
  }

  function reportError(message) {
    $("letter-error").textContent = message;
    input.setAttribute("aria-invalid", "true");
  }

  $("letter-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const guess = core.parseGuess(input.value);
    if (!guess) {
      reportError("יש לבחור אות אחת בעברית.");
      return;
    }
    const owner = Object.keys(guesses).find((letter) => letter !== activeCipher && guesses[letter] === guess);
    if (owner) {
      reportError(`האות ${guess} כבר משויכת ל־${owner}.`);
      return;
    }
    guesses[activeCipher] = guess;
    persist();
    update();
    $("announcement").textContent = `${activeCipher} הוחלפה ב־${guess} בכל ההודעה.`;
    letterDialog.close();
  });

  $("clear-letter").addEventListener("click", () => {
    delete guesses[activeCipher];
    persist();
    update();
    $("announcement").textContent = `ההחלפה של ${activeCipher} נמחקה.`;
    letterDialog.close();
  });

  input.addEventListener("focus", () => input.select());
  input.addEventListener("input", () => {
    $("letter-error").textContent = "";
    input.removeAttribute("aria-invalid");
    updateKeyboard();
  });

  for (const letter of core.ALPHABET) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "keyboard-letter";
    button.dataset.letter = letter;
    button.textContent = letter;
    button.addEventListener("click", () => {
      input.value = letter;
      $("letter-error").textContent = "";
      input.removeAttribute("aria-invalid");
      updateKeyboard();
    });
    keyboard.append(button);
  }

  $("open-key").addEventListener("click", () => keyDialog.showModal());
  for (const dialog of [letterDialog, keyDialog]) {
    dialog.querySelector(".close-dialog").addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (event) => {
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
    });
  }
  letterDialog.addEventListener("close", () => {
    if (returnToKey) {
      returnToKey = false;
      keyDialog.showModal();
      const entry = $("key-list").querySelector(`[data-cipher="${activeCipher}"]`);
      if (entry) entry.focus({ preventScroll: true });
    }
  });

  renderCipher();
  update();
})();
