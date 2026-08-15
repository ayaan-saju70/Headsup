// mock-engine.js
// -----------------------------------------------------------------------
// A mock game engine for UI development.
// Mimics the exact interface of the real game engine but with simplified logic
// and a small hardcoded dataset.
// -----------------------------------------------------------------------

const MOCK_MOVIES = [
  // Edge Case Test Titles
  { t: "CID", era: "90s", diff: "easy" }, // 3-character
  { t: "ManichitrathazhinteThiricharavuAthimanoharam", era: "90s", diff: "hard" }, // Long 40-char, no natural breaks
  { t: "Twenty:20 (ദി ഗ്രേറ്റ് ഷോ)", era: "00s", diff: "medium" }, // Mixed Malayalam + English + Special chars
  { t: "PrahasanangalilekkuThirikeNadakkumbolNjanKandaKazhchakal", era: "20s", diff: "hard" }, // >50-char title

  { t: "Kilukkam", era: "90s", diff: "easy" },
  { t: "Manichitrathazhu", era: "90s", diff: "easy" },
  { t: "Godfather", era: "90s", diff: "easy" },
  { t: "Meesa Madhavan", era: "00s", diff: "easy" },
  { t: "Classmates", era: "00s", diff: "easy" },
  { t: "Rajamanikyam", era: "00s", diff: "easy" },
  { t: "Drishyam", era: "10s", diff: "easy" },
  { t: "Premam", era: "10s", diff: "easy" },
  { t: "Bangalore Days", era: "10s", diff: "easy" },
  { t: "Minnal Murali", era: "20s", diff: "easy" },
  { t: "Bheeshma Parvam", era: "20s", diff: "easy" },
  { t: "Romancham", era: "20s", diff: "easy" },
  { t: "Thanmatra", era: "00s", diff: "medium" },
  { t: "Kumbalangi Nights", era: "10s", diff: "medium" },
  { t: "Angamaly Diaries", era: "10s", diff: "hard" }
];

let mockState = {
  selectedEras: [],
  selectedDiffs: [],
  roundLength: 60,
  inputMode: "tap",
  deck: [],
  currentIndex: 0,
  score: 0,
  played: [],
  gameActive: false
};

function shuffle(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = newArray[i];
    newArray[i] = newArray[j];
    newArray[j] = temp;
  }
  return newArray;
}

export function getFilteredMovies(eras = [], diffs = []) {
  // Bare minimum filtering to return correct shape
  const filtered = MOCK_MOVIES.filter(movie => {
    const eraMatch = eras.length === 0 || eras.includes(movie.era);
    const diffMatch = diffs.length === 0 || diffs.includes(movie.diff);
    return eraMatch && diffMatch;
  });
  return {
    movies: filtered,
    count: filtered.length
  };
}

export function startGame(eras = [], diffs = [], roundLength = 60, inputMode = "tap") {
  const filtered = getFilteredMovies(eras, diffs).movies;
  mockState.selectedEras = eras;
  mockState.selectedDiffs = diffs;
  mockState.roundLength = roundLength;
  mockState.inputMode = inputMode;
  mockState.deck = shuffle(filtered.length > 0 ? filtered : MOCK_MOVIES);
  mockState.currentIndex = 0;
  mockState.score = 0;
  mockState.played = [];
  mockState.gameActive = true;
}

export function getCurrentMovie() {
  if (!mockState.gameActive || mockState.deck.length === 0) return null;
  return mockState.deck[mockState.currentIndex];
}

export function handleCorrect() {
  if (!mockState.gameActive) return;
  const movie = getCurrentMovie();
  if (movie) {
    mockState.score += 1;
    mockState.played.push({ title: movie.t, result: "correct" });
    mockState.currentIndex = (mockState.currentIndex + 1) % mockState.deck.length;
  }
}

export function handlePass() {
  if (!mockState.gameActive) return;
  const movie = getCurrentMovie();
  if (movie) {
    mockState.played.push({ title: movie.t, result: "passed" });
    mockState.currentIndex = (mockState.currentIndex + 1) % mockState.deck.length;
  }
}

export function getScore() {
  return mockState.score;
}

export function getPlayedHistory() {
  return mockState.played;
}

export function endGame() {
  mockState.gameActive = false;
}

export function resetGame() {
  mockState = {
    selectedEras: [],
    selectedDiffs: [],
    roundLength: 60,
    inputMode: "tap",
    deck: [],
    currentIndex: 0,
    score: 0,
    played: [],
    gameActive: false
  };
}
