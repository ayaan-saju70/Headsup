// movieDataset.js
// -----------------------------------------------------------------------
// Static Malayalam movie dataset for Padam Nokkiye.
// Schema (do not change without telling Person B):
//   { t: "Movie Title", era: "90s" | "00s" | "10s" | "20s", diff: "easy" | "medium" | "hard" }
//
// This dataset is intentionally static — no API calls, no network fetch.
// Feel free to extend the list, but keep the schema identical and avoid
// duplicate titles.
// -----------------------------------------------------------------------

export const ERAS = ["90s", "00s", "10s", "20s"];
export const DIFFICULTIES = ["easy", "medium", "hard"];

export const MOVIE_DATASET = [
  // ---- 90s ----
  { t: "Kilukkam", era: "90s", diff: "easy" },
  { t: "Manichitrathazhu", era: "90s", diff: "easy" },
  { t: "Godfather", era: "90s", diff: "easy" },
  { t: "Devasuram", era: "90s", diff: "medium" },
  { t: "Aram Thampuran", era: "90s", diff: "medium" },
  { t: "Sphadikam", era: "90s", diff: "medium" },
  { t: "Kaalapani", era: "90s", diff: "hard" },
  { t: "Vietnam Colony", era: "90s", diff: "hard" },
  { t: "Chinthavishtayaya Shyamala", era: "90s", diff: "medium" },

  // ---- 00s ----
  { t: "Chronic Bachelor", era: "00s", diff: "easy" },
  { t: "Rajamanikyam", era: "00s", diff: "easy" },
  { t: "Classmates", era: "00s", diff: "easy" },
  { t: "Kaiyoppu", era: "00s", diff: "medium" },
  { t: "Thanmatra", era: "00s", diff: "medium" },
  { t: "Vinodayathra", era: "00s", diff: "hard" },
  { t: "Perumazhakkalam", era: "00s", diff: "hard" },

  // ---- 10s ----
  { t: "Drishyam", era: "10s", diff: "easy" },
  { t: "Premam", era: "10s", diff: "easy" },
  { t: "Bangalore Days", era: "10s", diff: "easy" },
  { t: "Charlie", era: "10s", diff: "easy" },
  { t: "Ustad Hotel", era: "10s", diff: "medium" },
  { t: "Traffic", era: "10s", diff: "medium" },
  { t: "Maheshinte Prathikaram", era: "10s", diff: "medium" },
  { t: "Kumbalangi Nights", era: "10s", diff: "medium" },
  { t: "Angamaly Diaries", era: "10s", diff: "hard" },
  { t: "Ozhivudivasathe Kali", era: "10s", diff: "hard" },
  { t: "Guppy", era: "10s", diff: "hard" },

  // ---- 20s ----
  { t: "Minnal Murali", era: "20s", diff: "easy" },
  { t: "Bheeshma Parvam", era: "20s", diff: "easy" },
  { t: "Romancham", era: "20s", diff: "easy" },
  { t: "Manjummel Boys", era: "20s", diff: "easy" },
  { t: "Aavesham", era: "20s", diff: "easy" },
  { t: "Nna Thaan Case Kodu", era: "20s", diff: "medium" },
  { t: "Jan-E-Man", era: "20s", diff: "medium" },
  { t: "Hridayam", era: "20s", diff: "medium" },
  { t: "Kaathal - The Core", era: "20s", diff: "hard" },
  { t: "Malayankunju", era: "20s", diff: "hard" },
];

export default MOVIE_DATASET;
