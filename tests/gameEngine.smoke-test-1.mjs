import { getFilteredMovies } from "../src/gameEngine/filtering.js";
import { generateDeck, getCurrentMovieFromDeck } from "../src/gameEngine/deck.js";
import { createGameEngine } from "../src/gameEngine/gameEngine.js";
import { startTiltInput } from "../src/gameEngine/tilt.js";

// Test filtering
const pool = getFilteredMovies(["10s", "20s"], ["easy"]);
console.log("Filtered pool (10s+20s, easy):", pool.length, "movies");
console.assert(pool.every(m => (m.era === "10s" || m.era === "20s") && m.diff === "easy"), "filter mismatch");

// Test 'all eras/diffs' when empty arrays passed
const allPool = getFilteredMovies([], []);
console.log("All movies pool:", allPool.length);

// Test deck generation + no mutation of source
const deck = generateDeck(pool);
console.log("Deck length:", deck.length, "first card:", deck[0].t);

// Test engine end-to-end without timers running out (we'll call endGame manually)
let lastState = null;
const engine = createGameEngine({ onStateChange: (s) => (lastState = s) });
engine.setFilters({ eras: [], diffs: [] });
engine.setRoundLength(60);
engine.startGame();
console.log("Game active after start:", lastState.gameActive, "deck size:", lastState.deck.length);

engine.handleCorrect();
engine.handlePass();
engine.handleCorrect();
console.log("Score after 2 correct + 1 pass:", engine.getScore(), "(expect 2)");
console.log("History:", engine.getPlayedHistory());

engine.endGame();
console.log("Active after endGame:", lastState.gameActive, "status:", lastState.status);

engine.resetGame();
console.log("Score after reset:", engine.getScore(), "(expect 0)");
console.log("History after reset:", engine.getPlayedHistory().length, "(expect 0)");

// Test deck exhaustion never stops the game — run more correct/pass than pool size
const engine2 = createGameEngine();
engine2.setFilters({ eras: ["90s"], diffs: ["easy"] }); // small pool
engine2.startGame();
const smallPoolSize = engine2.getFilteredMovies().length;
console.log("Small pool size:", smallPoolSize);
for (let i = 0; i < smallPoolSize * 3; i++) {
  engine2.handleCorrect();
}
console.log("Score after cycling through deck 3x:", engine2.getScore(), "(expect", smallPoolSize * 3, ")");
console.log("Current movie still exists after exhaustion:", !!engine2.getCurrentMovie());

// --- NEW TESTS ---

console.log("\n--- Additional Edge Cases ---");
const engine3 = createGameEngine();

// 1a. Start a game with a filter combo that deliberately forces zero matches
engine3.setFilters({ eras: ["3000s"], diffs: ["impossible"] });
let threwExpectedError = false;
try {
  engine3.startGame();
} catch (e) {
  if (e.message.includes("No movies match")) {
    threwExpectedError = true;
  } else {
    throw e;
  }
}
console.log("Throws on zero matches:", threwExpectedError);

// 1b. Start a game with a filter combo that matches very few movies
engine3.setFilters({ eras: ["90s"], diffs: ["hard"] }); // This yields exactly 2 movies
engine3.startGame();
console.log("engine3 pool size:", engine3.getFilteredMovies().length);
// 2. Calling handleCorrect and handlePass rapidly in sequence
engine3.handleCorrect();
engine3.handlePass();
engine3.handleCorrect();
engine3.handlePass();
engine3.handleCorrect();
console.log("Score after rapid calls:", engine3.getScore(), "(expect 3)");

// 3. Calling handleCorrect after the game has ended (should do nothing)
engine3.endGame();
const scoreBeforeEnd = engine3.getScore();
engine3.handleCorrect();
engine3.handlePass();
console.log("Score after endgame calls:", engine3.getScore(), "(expect", scoreBeforeEnd, ")");

// 4. Starting a second game after resetGame() to confirm no old score/history/deck carries over
engine3.resetGame();
engine3.setFilters({ eras: [], diffs: [] });
engine3.startGame();
console.log("Score after restart:", engine3.getScore(), "(expect 0)");
console.log("History length after restart:", engine3.getPlayedHistory().length, "(expect 0)");
const deckAfterRestart = engine3.getState().deck;
console.log("Deck after restart populated:", deckAfterRestart && deckAfterRestart.length > 0);

// --- BONUS ROUND TESTS ---
console.log("\n--- Bonus Round Tests ---");
const bonusEngine = createGameEngine();
bonusEngine.setFilters({ eras: [], diffs: [] });
bonusEngine.startGame();

// 1. Fail to qualify (< 60%)
bonusEngine.handleCorrect();
bonusEngine.handlePass();
bonusEngine.handlePass();
bonusEngine.endGame();
console.log("Bonus available (1/3 correct):", bonusEngine.getState().bonusAvailable, "(expect false)");

// 2. Qualify (>= 60%)
bonusEngine.resetGame();
bonusEngine.setFilters({ eras: [], diffs: [] });
bonusEngine.startGame();
bonusEngine.handleCorrect();
bonusEngine.handleCorrect();
bonusEngine.handlePass();
bonusEngine.endGame();
console.log("Bonus available (2/3 correct):", bonusEngine.getState().bonusAvailable, "(expect true)");

// 3. Play Bonus Round
const normalScore = bonusEngine.getScore();
bonusEngine.startBonusRound();
console.log("Bonus mode active:", bonusEngine.getState().bonusMode, "(expect true)");
const bonusDeck = bonusEngine.getState().deck;
const allHardOrMedium = bonusDeck.every(m => m.diff === "hard" || m.diff === "medium");
console.log("Bonus deck is only hard/medium:", allHardOrMedium, "(expect true)");

// 4. Isolated Scoring
bonusEngine.handleCorrect();
console.log("Normal score after bonus correct:", bonusEngine.getScore(), "(expect", normalScore, ")");
console.log("Bonus score after 1 correct:", bonusEngine.getBonusScore(), "(expect 2)");
console.log("Bonus history length:", bonusEngine.getBonusPlayedHistory().length, "(expect 1)");

// 5. Reset clears bonus
bonusEngine.resetGame();
const resetState = bonusEngine.getState();
console.log("Bonus available after reset:", resetState.bonusAvailable, "(expect false)");
console.log("Bonus score after reset:", resetState.bonusScore, "(expect 0)");

// --- TILT INPUT TESTS ---
console.log("\n--- Tilt Input Tests ---");

class MockWindow {
  constructor() {
    this.listeners = {};
    this.DeviceOrientationEvent = {};
  }
  addEventListener(event, handler) {
    this.listeners[event] = handler;
  }
  removeEventListener(event, handler) {
    if (this.listeners[event] === handler) delete this.listeners[event];
  }
  triggerDeviceOrientation(beta, gamma) {
    if (this.listeners['deviceorientation']) {
      this.listeners['deviceorientation']({ beta, gamma });
    }
  }
}

await (async function runTiltTests() {
  const win = new MockWindow();
  
  let downCount = 0;
  let upCount = 0;
  
  const tiltControl = await startTiltInput({
    onTiltDown: () => downCount++,
    onTiltUp: () => upCount++,
    windowObj: win
  });

  // 1. Initial calibration (should not fire)
  win.triggerDeviceOrientation(50, 0); // Neutral is now 50 beta
  console.log("After calibration, counts:", downCount, upCount, "(expect 0 0)");
  
  // 2. Small movement (should not fire)
  win.triggerDeviceOrientation(60, 0); // Delta 10
  console.log("Small movement, counts:", downCount, upCount, "(expect 0 0)");

  // 3. Tilt Down (Delta > 30)
  win.triggerDeviceOrientation(85, 0); // Delta 35
  console.log("Tilt Down, counts:", downCount, upCount, "(expect 1 0)");

  // 4. Debounce (Keeping it tilted shouldn't fire again)
  win.triggerDeviceOrientation(90, 0); // Delta 40
  console.log("Debounce Down, counts:", downCount, upCount, "(expect 1 0)");

  // 5. Must return to neutral before another fire
  win.triggerDeviceOrientation(60, 0); // Delta 10 (Neutral is < 15)
  win.triggerDeviceOrientation(85, 0); // Delta 35 (Tilt Down again)
  console.log("Return to neutral + Tilt Down, counts:", downCount, upCount, "(expect 2 0)");

  // 6. Tilt Up
  win.triggerDeviceOrientation(50, 0); // Neutral (Delta 0)
  win.triggerDeviceOrientation(10, 0); // Delta -40
  console.log("Tilt Up, counts:", downCount, upCount, "(expect 2 1)");

  // 7. Sideways tilt (large gamma, small beta) should be ignored
  win.triggerDeviceOrientation(50, 0); // Neutral (Delta 0)
  win.triggerDeviceOrientation(60, 50); // Large gamma, small beta (delta 10)
  console.log("Sideways tilt, counts:", downCount, upCount, "(expect 2 1)");

  // 8. Test fallback / rejection
  const winNoEvent = { DeviceOrientationEvent: undefined };
  const result = await startTiltInput({ onTiltDown: () => {}, onTiltUp: () => {}, windowObj: winNoEvent });
  console.log("Fallback when no DeviceOrientation API:", result === false, "(expect true)");

  tiltControl.stop();
})();

console.log("\nAll checks ran.");
