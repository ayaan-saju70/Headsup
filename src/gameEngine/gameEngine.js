// gameEngine.js
// -----------------------------------------------------------------------
// The single entry point Person B (UI) should import from.
// Exposes exactly the interface agreed in the playbook:
//
//   getFilteredMovies()
//   startGame()
//   getCurrentMovie()
//   handleCorrect()
//   handlePass()
//   getScore()
//   getPlayedHistory()
//   endGame()
//   resetGame()
//
// Internally this wraps gameState / filtering / deck / timer so the UI
// never has to know how any of those work.
// -----------------------------------------------------------------------

import { createInitialState, resetState } from "./gameState.js";
import { getFilteredMovies as filterMovies } from "./filtering.js";
import {
  generateDeck,
  getCurrentMovieFromDeck,
  isDeckExhausted,
  reshuffleDeck,
} from "./deck.js";
import { Timer } from "./timer.js";

const NORMAL_CORRECT_POINTS = 1;
const BONUS_CORRECT_POINTS = 2;
const BONUS_QUALIFICATION_THRESHOLD = 0.6;

export function createGameEngine({ onStateChange } = {}) {
  let state = createInitialState();
  let filteredPool = []; // the pool the current deck was built from (for reshuffles)

  const notify = () => onStateChange && onStateChange({ ...state });

  const timer = new Timer({
    onTick: (remainingSeconds) => {
      state.remainingSeconds = remainingSeconds;
      notify();
    },
    onComplete: () => {
      endGame();
    },
  });

  // ---- Setup / filtering --------------------------------------------
  function getFilteredMovies(selectedEras = state.selectedEras, selectedDiffs = state.selectedDiffs) {
    return filterMovies(selectedEras, selectedDiffs);
  }

  function setFilters({ eras, diffs } = {}) {
    if (eras) state.selectedEras = eras;
    if (diffs) state.selectedDiffs = diffs;
    notify();
  }

  function setRoundLength(seconds) {
    state.roundLength = seconds;
    notify();
  }

  function setInputMode(mode) {
    state.inputMode = mode;
    notify();
  }

  // ---- Lifecycle -------------------------------------------------------
  let lastActionTimestamp = 0;
  const ACTION_DEBOUNCE_MS = 250;

  function startGame(eras = state.selectedEras, diffs = state.selectedDiffs, roundLength = state.roundLength, inputMode = state.inputMode) {
    if (eras !== undefined) state.selectedEras = eras;
    if (diffs !== undefined) state.selectedDiffs = diffs;
    if (roundLength !== undefined) state.roundLength = roundLength;
    if (inputMode !== undefined) state.inputMode = inputMode;

    filteredPool = getFilteredMovies(state.selectedEras, state.selectedDiffs);
    if (filteredPool.length === 0) {
      throw new Error("No movies match the selected filters — cannot start game.");
    }

    state.deck = generateDeck(filteredPool);
    state.currentIndex = 0;
    state.score = 0;
    state.played = [];
    state.bonusMode = false;
    state.bonusAvailable = false;
    state.gameActive = true;
    state.status = "PLAYING";

    lastActionTimestamp = 0;
    notify();
    timer.start(state.roundLength);
  }

  function checkBonusQualification() {
    if (state.played.length === 0) return;
    const correctCount = state.played.filter((m) => m.result === "correct").length;
    const accuracy = correctCount / state.played.length;
    if (accuracy >= BONUS_QUALIFICATION_THRESHOLD) {
      state.bonusAvailable = true;
    }
  }

  function startBonusRound() {
    state.bonusMode = true;
    state.bonusScore = 0;
    state.bonusPlayed = [];

    // Attempt hard pool, fallback to hard+medium
    let bonusPool = getFilteredMovies(state.selectedEras, ["hard"]);
    if (bonusPool.length === 0) {
      bonusPool = getFilteredMovies(state.selectedEras, ["hard", "medium"]);
    }
    if (bonusPool.length === 0) {
      throw new Error("Not enough hard/medium movies for a bonus round.");
    }

    filteredPool = bonusPool;
    state.deck = generateDeck(filteredPool);
    state.currentIndex = 0;
    state.gameActive = true;
    state.status = "PLAYING";

    lastActionTimestamp = 0;
    notify();
    timer.start(30); // Bonus round is always 30s
  }

  function endGame() {
    state.gameActive = false;
    state.status = state.status === "PLAYING" ? "TIME_UP" : state.status;
    timer.stop();
    
    // Check for bonus qualification if this was a normal round ending naturally
    if (!state.bonusMode && state.status === "TIME_UP") {
      checkBonusQualification();
    }

    notify();
    // Move to fully ENDED after signaling TIME_UP so UI can show the transition.
    state.status = "ENDED";
    notify();
  }

  function resetGame() {
    timer.stop();
    state = resetState();
    filteredPool = [];
    lastActionTimestamp = 0;
    notify();
  }

  // ---- Current movie -----------------------------------------------
  function getCurrentMovie() {
    if (!state.deck || state.deck.length === 0) {
      if (filteredPool.length === 0) {
        filteredPool = getFilteredMovies();
      }
      if (filteredPool.length === 0) return null;
      state.deck = generateDeck(filteredPool);
      state.currentIndex = 0;
    }
    if (isDeckExhausted(state.deck, state.currentIndex)) {
      const reshuffled = reshuffleDeck(filteredPool);
      state.deck = reshuffled.deck;
      state.currentIndex = reshuffled.currentIndex;
    }
    return getCurrentMovieFromDeck(state.deck, state.currentIndex);
  }

  function _advance() {
    state.currentIndex += 1;
    if (isDeckExhausted(state.deck, state.currentIndex)) {
      const reshuffled = reshuffleDeck(filteredPool);
      state.deck = reshuffled.deck;
      state.currentIndex = reshuffled.currentIndex;
    }
  }

  // ---- Correct / Pass --------------------------------------------------
  function handleCorrect() {
    if (!state.gameActive) return;
    const now = Date.now();
    if (now - lastActionTimestamp < ACTION_DEBOUNCE_MS) return;
    lastActionTimestamp = now;

    const movie = getCurrentMovie();
    if (!movie) return;

    if (state.bonusMode) {
      state.bonusScore += BONUS_CORRECT_POINTS;
      state.bonusPlayed.push({ title: movie.t, result: "correct" });
    } else {
      state.score += NORMAL_CORRECT_POINTS;
      state.played.push({ title: movie.t, result: "correct" });
    }

    _advance();
    notify();
  }

  function handlePass() {
    if (!state.gameActive) return;
    const now = Date.now();
    if (now - lastActionTimestamp < ACTION_DEBOUNCE_MS) return;
    lastActionTimestamp = now;

    const movie = getCurrentMovie();
    if (!movie) return;

    if (state.bonusMode) {
      state.bonusPlayed.push({ title: movie.t, result: "passed" });
    } else {
      state.played.push({ title: movie.t, result: "passed" });
    }

    _advance();
    notify();
  }

  function getScore() {
    return state.score;
  }

  function getPlayedHistory() {
    return [...state.played];
  }

  function getBonusScore() {
    return state.bonusScore;
  }

  function getBonusPlayedHistory() {
    return [...state.bonusPlayed];
  }

  function getState() {
    return { ...state };
  }

  return {
    getFilteredMovies,
    setFilters,
    setRoundLength,
    setInputMode,
    startGame,
    getCurrentMovie,
    handleCorrect,
    handlePass,
    getScore,
    getPlayedHistory,
    // Scope cut: Bonus round functions (getBonusScore, getBonusPlayedHistory, checkBonusQualification, startBonusRound)
    // were removed from the public interface as the UI does not implement bonus rounds.
    endGame,
    resetGame,
    getState,
  };
}
