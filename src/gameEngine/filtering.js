// filtering.js
// -----------------------------------------------------------------------
// Turns (full dataset + selected eras + selected difficulties) into a
// filtered movie pool. Never mutates the original dataset.
// -----------------------------------------------------------------------

import { MOVIE_DATASET } from "./movieDataset.js";

/**
 * @param {string[]} selectedEras  - e.g. ["10s", "20s"]. Empty array = all eras.
 * @param {string[]} selectedDiffs - e.g. ["easy"]. Empty array = all difficulties.
 * @returns {Array}  a new filtered array (source dataset is untouched)
 */
export function getFilteredMovies(selectedEras = [], selectedDiffs = []) {
  const erasFilter = selectedEras.length > 0 ? new Set(selectedEras) : null;
  const diffsFilter = selectedDiffs.length > 0 ? new Set(selectedDiffs) : null;

  return MOVIE_DATASET.filter((movie) => {
    const eraMatch = !erasFilter || erasFilter.has(movie.era);
    const diffMatch = !diffsFilter || diffsFilter.has(movie.diff);
    return eraMatch && diffMatch;
  }).map((movie) => ({ ...movie })); // shallow copy so callers can't mutate the source
}

export function getFilteredMovieCount(selectedEras = [], selectedDiffs = []) {
  return getFilteredMovies(selectedEras, selectedDiffs).length;
}
