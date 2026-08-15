import { createGameEngine } from "./gameEngine/gameEngine.js";
import { startTiltInput } from "./gameEngine/tilt.js";

// DOM Elements - Views
const viewSetup = document.getElementById("view-setup");
const viewGame = document.getElementById("view-game");

// DOM Elements - Setup
const eraChips = document.getElementById("era-chips");
const diffChips = document.getElementById("diff-chips");
const timeControl = document.getElementById("time-control");
const inputControl = document.getElementById("input-control");
const matchCountText = document.getElementById("match-count-text");
const btnStartGame = document.getElementById("btn-start-game");

// DOM Elements - Game
const hudTimer = document.getElementById("hud-timer");
const hudScore = document.getElementById("hud-score");
const movieTitle = document.getElementById("movie-title");
const tagEra = document.getElementById("tag-era");
const tagDiff = document.getElementById("tag-diff");
const btnActionPass = document.getElementById("btn-action-pass");
const btnActionCorrect = document.getElementById("btn-action-correct");

// DOM Elements - End Screen
const viewEnd = document.getElementById("view-end");
const endScoreVal = document.getElementById("end-score-val");
const historyItemsList = document.getElementById("history-items-list");
const btnPlayAgain = document.getElementById("btn-play-again");
const btnChangeFilters = document.getElementById("btn-change-filters");

let tiltHandle = null;

function teardownTilt() {
  if (tiltHandle) {
    tiltHandle.stop();
    tiltHandle = null;
  }
}

// Instantiate the real game engine AFTER all DOM refs are defined
// (onStateChange fires synchronously on setFilters/setRoundLength calls;
// DOM elements must exist before the first callback fires)
const engine = createGameEngine({
  onStateChange: (state) => {
    console.log("[State Update]", {
      gameActive: state.gameActive,
      status: state.status,
      remainingSeconds: state.remainingSeconds,
      score: state.score,
      playedCount: state.played.length,
      currentMovie: state.deck[state.currentIndex]?.t || null
    });

    // Timer and score come exclusively from engine state — no separate UI countdown
    hudTimer.textContent = state.remainingSeconds;
    hudScore.textContent = state.score;

    // Only trigger end screen on final ENDED status to avoid double-call on TIME_UP
    if (state.status === "ENDED") {
      handleRoundCompletion();
    }
  }
});

// Setup state tracked in UI
const configState = {
  selectedEras: ["90s", "00s", "10s", "20s"],
  selectedDiffs: ["easy", "medium", "hard"],
  roundLength: 90,
  inputMode: "tap"
};

// Initialize listeners
setupChipContainer(eraChips, configState.selectedEras);
setupChipContainer(diffChips, configState.selectedDiffs);
setupSegmentedControl(timeControl, (val) => {
  configState.roundLength = parseInt(val, 10);
});
setupSegmentedControl(inputControl, (val) => {
  configState.inputMode = val;
});

btnStartGame.addEventListener("click", () => {
  startGameSession();
});

btnPlayAgain.addEventListener("click", () => {
  teardownTilt();
  engine.resetGame();
  startGameSession();
});

btnChangeFilters.addEventListener("click", () => {
  teardownTilt();
  engine.resetGame();
  viewEnd.classList.remove("active");
  viewSetup.classList.add("active");
  updateMatchedCount();
});

async function startGameSession() {
  console.log("-> startGameSession triggered with configurations:", configState);
  
  // Set filters & configurations on the real engine
  engine.setFilters({ eras: configState.selectedEras, diffs: configState.selectedDiffs });
  engine.setRoundLength(configState.roundLength);
  engine.setInputMode(configState.inputMode);

  // Switch UI view panel
  viewSetup.classList.remove("active");
  viewEnd.classList.remove("active");
  viewGame.classList.add("active");

  if (configState.inputMode === "tilt") {
    tiltHandle = await startTiltInput({
      onTiltDown: () => { engine.handleCorrect(); renderGameScreen(); },
      onTiltUp: () => { engine.handlePass(); renderGameScreen(); },
    });
    if (tiltHandle) {
      movieTitle.textContent = "Get ready...";
      await tiltHandle.calibrate(); // ~400ms window — hold phone at forehead now
    }
    // if tiltHandle is false, sensors unavailable — silently continues as tap-only
  }

  // Call the real engine's startGame
  engine.startGame();

  // Render current stats & card
  renderGameScreen();
}

// Game screen interactions
btnActionCorrect.addEventListener("click", () => {
  console.log("-> Correct Button Clicked");
  engine.handleCorrect();
  renderGameScreen();
});

btnActionPass.addEventListener("click", () => {
  console.log("-> Pass Button Clicked");
  engine.handlePass();
  renderGameScreen();
});

// Draw current details on the canvas
function renderGameScreen() {
  const currentMovie = engine.getCurrentMovie();
  const state = engine.getState();
  
  if (currentMovie && state.gameActive) {
    movieTitle.textContent = currentMovie.t;
    tagEra.textContent = currentMovie.era;
    tagDiff.textContent = currentMovie.diff;
    console.log("-> Card Rendered:", currentMovie.t);
  } else {
    // Deck exhausted or game not active
    movieTitle.textContent = "Round Finished!";
    tagEra.textContent = "—";
    tagDiff.textContent = "—";
  }
}

function handleRoundCompletion() {
  teardownTilt();
  const state = engine.getState();
  console.log("-> handleRoundCompletion triggered. Game Active:", state.gameActive, "Status:", state.status);

  // Configure and show the End Screen
  endScoreVal.textContent = engine.getScore();
  
  // Build and insert history items list
  historyItemsList.innerHTML = "";
  const history = engine.getPlayedHistory();
  console.log("-> End Screen History populated. History list length:", history.length);
  
  if (history.length === 0) {
    const emptyRow = document.createElement("div");
    emptyRow.className = "history-row";
    emptyRow.style.justifyContent = "center";
    emptyRow.style.color = "var(--text-disabled)";
    emptyRow.textContent = "No movies played / ചരിത്രം ലഭ്യമല്ല";
    historyItemsList.appendChild(emptyRow);
  } else {
    history.forEach(item => {
      const row = document.createElement("div");
      const isCorrect = item.result === "correct";
      row.className = `history-row ${isCorrect ? "correct-row" : "passed-row"}`;
      
      const titleSpan = document.createElement("span");
      titleSpan.className = "history-title";
      titleSpan.textContent = item.title;
      
      const statusIcon = document.createElement("span");
      statusIcon.className = "history-status-icon";
      statusIcon.textContent = isCorrect ? "✓" : "→";
      
      row.appendChild(titleSpan);
      row.appendChild(statusIcon);
      historyItemsList.appendChild(row);
    });
  }

  // Switch View Panel
  viewGame.classList.remove("active");
  viewEnd.classList.add("active");
}

// Initial movie match rendering
updateMatchedCount();

// Multi-select Chips Controller
function setupChipContainer(container, targetArray) {
  container.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;

    const value = chip.dataset.value;
    const isSelected = chip.classList.contains("active");

    if (isSelected) {
      // De-select
      const index = targetArray.indexOf(value);
      if (index > -1) {
        targetArray.splice(index, 1);
      }
      chip.classList.remove("active");
      chip.setAttribute("aria-pressed", "false");
    } else {
      // Select
      if (!targetArray.includes(value)) {
        targetArray.push(value);
      }
      chip.classList.add("active");
      chip.setAttribute("aria-pressed", "true");
    }

    updateMatchedCount();
  });
}

// Segmented single-choice controller
function setupSegmentedControl(container, onSelect) {
  container.addEventListener("click", (e) => {
    const segment = e.target.closest(".segment");
    if (!segment) return;

    const siblings = container.querySelectorAll(".segment");
    siblings.forEach(sib => sib.classList.remove("active"));
    
    segment.classList.add("active");
    onSelect(segment.dataset.value);
  });
}

// Live calculation via engine integration
function updateMatchedCount() {
  const count = engine.getFilteredMovies(configState.selectedEras, configState.selectedDiffs).length;

  // Single string — count appears once in English, once in Malayalam; no duplication
  if (count === 0) {
    matchCountText.textContent = "No movies match / ഒരു പടവും യോജിക്കുന്നില്ല";
  } else if (count === 1) {
    matchCountText.textContent = "1 movie matches / 1 പടം യോജിക്കുന്നു";
  } else {
    matchCountText.textContent = `${count} movies match / ${count} പടങ്ങൾ`;
  }

  // Disable Start Button when count is 0
  btnStartGame.disabled = (count === 0);
}
