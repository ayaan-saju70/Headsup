// gameState.js
// -----------------------------------------------------------------------
// Single source of truth for gameplay state.
// Nothing outside this module should mutate state directly — go through
// the functions exposed by gameEngine.js instead.
// -----------------------------------------------------------------------

export function createInitialState() {
  return {
    selectedEras: [],
    selectedDiffs: [],
    roundLength: 60,
    inputMode: "tap", // "tap" | "tilt"
    deck: [],
    currentIndex: 0,
    score: 0,
    played: [], // [{ title, result: "correct" | "passed" }]
    bonusMode: false,
    bonusScore: 0,
    bonusPlayed: [],
    bonusAvailable: false,
    gameActive: false,
    remainingSeconds: 0,
    status: "SETUP", // SETUP | STARTING | PLAYING | TIME_UP | ENDED
  };
}

// Returns a brand-new state object, preserving nothing from the previous
// game. Guarantees a second game never inherits stale gameplay state.
export function resetState() {
  return createInitialState();
}
