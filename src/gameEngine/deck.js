// deck.js
// -----------------------------------------------------------------------
// Turns a filtered movie pool into a shuffled, playable deck.
// The game must never stop because the deck ran out — when we reach the
// end, we reshuffle and keep going.
// -----------------------------------------------------------------------

// Fisher-Yates shuffle — returns a new array, does not mutate the input.
export function shuffle(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Builds a fresh shuffled deck from a filtered pool.
export function generateDeck(filteredMovies) {
  if (!filteredMovies || filteredMovies.length === 0) {
    throw new Error("Cannot generate a deck from an empty movie pool.");
  }
  return shuffle(filteredMovies);
}

// Returns the movie at the given index, or null if the deck is empty.
export function getCurrentMovieFromDeck(deck, currentIndex) {
  if (!deck || deck.length === 0) return null;
  return deck[currentIndex] ?? null;
}

// True when currentIndex has run past the end of the deck.
export function isDeckExhausted(deck, currentIndex) {
  return !deck || currentIndex >= deck.length;
}

// Reshuffles the same pool into a new deck and resets the index to 0.
// Used automatically when the deck is exhausted mid-round.
export function reshuffleDeck(originalFilteredPool) {
  return {
    deck: shuffle(originalFilteredPool),
    currentIndex: 0,
  };
}
