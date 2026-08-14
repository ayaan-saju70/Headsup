# Padam Nokkiye — Gameplay Engine (Person A)

Covers Day 1–3 of the playbook: dataset, state, filtering, deck
generation, current movie, timer, Correct/Pass, score, played history,
round lifecycle, and reset. Tilt controls and Bonus Round are now implemented.

## Files

```
src/gameEngine/
  movieDataset.js   Static dataset — { t, era, diff }. Edit this to add movies.
  gameState.js       Shape of the single game-state object.
  filtering.js        getFilteredMovies(eras, diffs) — never mutates the dataset.
  deck.js             shuffle / generateDeck / reshuffle on exhaustion.
  timer.js            Timer class — owns remainingSeconds only, no visuals.
  gameEngine.js       Main entry point — the interface contract below.
  useGameEngine.js    React hook wrapper around gameEngine.js.
tests/
  gameEngine.smoke-test.mjs   Run with `node tests/gameEngine.smoke-test.mjs`
```

## Interface contract (for Person B)

```js
import { useGameEngine } from "./src/gameEngine/useGameEngine.js";

function GameScreen() {
  const { state, engine } = useGameEngine();

  // Setup screen
  engine.setFilters({ eras: ["10s", "20s"], diffs: ["easy"] });
  engine.setRoundLength(60); // 60 | 90 | 120

  // Start
  engine.startGame();

  // During play
  const movie = engine.getCurrentMovie(); // { t, era, diff }
  engine.handleCorrect();
  engine.handlePass();
  state.remainingSeconds; // updates every second automatically
  state.score;
  state.gameActive;       // false once time hits 0

  // End screen (Normal Round)
  engine.getScore();
  engine.getPlayedHistory(); // [{ title, result: "correct" | "passed" }]

  // Bonus Round
  if (state.bonusAvailable) {
    engine.startBonusRound();
    
    // ... wait for round to finish, then:
    engine.getBonusScore();
    engine.getBonusPlayedHistory();
  }

  // Play again
  engine.resetGame();
}
```

`state` re-renders your component automatically on every change (score,
timer tick, movie advance, etc.) — you don't need to poll anything.

> **Note on Bonus Round:** The bonus round's score (`bonusScore`) and history (`bonusPlayed`) are completely separate from the normal round. They are **not** additive. A player can get 10 points in the normal round and 4 in the bonus round; they don't combine into 14.

**If you need this outside React** (e.g. testing in plain JS), skip the
hook and use `createGameEngine({ onStateChange })` from `gameEngine.js`
directly — same methods, no React dependency.

## Notes / things to flag before changing

Per the playbook, don't silently change any of these without telling
Person B: state shape, function names in the interface above, the
`{ t, era, diff }` dataset schema, or return value shapes (e.g. what
`getPlayedHistory()` returns).

## Dataset

37 movies across `90s / 00s / 10s / 20s` × `easy / medium / hard`.
Titles and eras were checked, but **double-check the full list against
your own event knowledge before the event** — a couple of entries
(e.g. era placement for less mainstream titles) are worth a second
pass since a bad era tag would break filtering silently.

## Git workflow (per the playbook's Section 18)

```
git checkout -b feature/game-engine
git add .
git commit -m "feat: add movie dataset"
git commit -m "feat: implement filtering"
git commit -m "feat: implement deck generation"
git commit -m "feat: implement timer"
git commit -m "feat: implement scoring"
git push origin feature/game-engine
```

Then merge into `main` once Person B confirms the interface works,
resolving conflicts as they come up (see the git workflow you already
have from our earlier conversation).
