// tests/gameIntegration.test.mjs
// -----------------------------------------------------------------------
// Verifies integration of gameEngine, timer engine, and app callbacks.
// -----------------------------------------------------------------------

import { createGameEngine } from "../src/gameEngine/gameEngine.js";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

console.log("=== START INTEGRATION VERIFICATION ===");

// 1. Setup Engine subscriber to track ticks
const stateChanges = [];
const engine = createGameEngine({
  onStateChange: (state) => {
    stateChanges.push({
      gameActive: state.gameActive,
      status: state.status,
      score: state.score,
      remainingSeconds: state.remainingSeconds,
      playedCount: state.played.length,
      currentMovie: state.deck[state.currentIndex]?.t || null
    });
  }
});

// Set config for a short round (2s for quick integration verification)
console.log("-> Initializing settings and filters");
engine.setFilters({ eras: ["90s", "20s"], diffs: ["easy", "hard"] });
engine.setRoundLength(2); // 2 seconds
engine.setInputMode("tap");

const initialCount = engine.getFilteredMovies().length;
console.log(`-> getFilteredMovies() matched count: ${initialCount} movies`);

// 2. Start game round
console.log("-> Starting Game");
engine.startGame();

// Validate deck generation
console.log("-> Current deck size in state:", engine.getState().deck.length);
console.log("-> Current movie card:", engine.getCurrentMovie().t);

// Simulate Correct click
console.log("-> Simulating CORRECT click");
engine.handleCorrect();
await delay(300); // Debounce delay
console.log("-> New movie card after correct:", engine.getCurrentMovie().t);
console.log("-> Score after correct:", engine.getScore());

// Simulate Pass click
console.log("-> Simulating PASS click");
engine.handlePass();
await delay(300); // Debounce delay
console.log("-> New movie card after pass:", engine.getCurrentMovie().t);
console.log("-> Score after pass:", engine.getScore());

// 3. Let timer exhaust naturally
console.log("-> Waiting for timer ticking...");
await delay(2500); // Exceeds the 2s limit to trigger onComplete -> endGame()

console.log("=== STATE TRANSITIONS LOGGED ===");
stateChanges.forEach((log, index) => {
  console.log(`State Change [${index}]: active=${log.gameActive}, status=${log.status}, remaining=${log.remainingSeconds}s, score=${log.score}, played=${log.playedCount}, movie=${log.currentMovie}`);
});

console.log("=== FINAL STATISTICS ===");
console.log("-> Game Active:", engine.getState().gameActive);
console.log("-> Status:", engine.getState().status);
console.log("-> Score:", engine.getScore());
console.log("-> Played History:", engine.getPlayedHistory());

console.log("=== INTEGRATION VERIFICATION ENDED ===");
process.exit(0);
