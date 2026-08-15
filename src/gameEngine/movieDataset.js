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
  { t: "Kilukkam",                    era: "90s", diff: "easy" },
  { t: "Manichitrathazhu",            era: "90s", diff: "easy" },
  { t: "Godfather",                   era: "90s", diff: "easy" },
  { t: "In Harihar Nagar",            era: "90s", diff: "easy" },
  { t: "Thenmavin Kombath",           era: "90s", diff: "easy" },
  { t: "Sandhesam",                   era: "90s", diff: "easy" },
  { t: "Devasuram",                   era: "90s", diff: "medium" },
  { t: "Aaram Thampuran",             era: "90s", diff: "medium" },
  { t: "Sphadikam",                   era: "90s", diff: "medium" },
  { t: "Aniyathipraavu",              era: "90s", diff: "medium" },
  { t: "Kaalapani",                   era: "90s", diff: "hard" },

  // ---- 00s ----
  { t: "Chronic Bachelor",            era: "00s", diff: "easy" },
  { t: "Rajamanikyam",                era: "00s", diff: "easy" },
  { t: "Classmates",                  era: "00s", diff: "easy" },
  { t: "Meesa Madhavan",              era: "00s", diff: "easy" },
  { t: "Kalyanaraman",                era: "00s", diff: "easy" },
  { t: "Narasimham",                  era: "00s", diff: "easy" },
  { t: "Thanmatra",                   era: "00s", diff: "medium" },
  { t: "Chota Mumbai",                era: "00s", diff: "medium" },
  { t: "Arabikatha",                  era: "00s", diff: "medium" },
  { t: "Twenty:20",                   era: "00s", diff: "medium" },
  { t: "Paleri Manikyam",             era: "00s", diff: "hard" },

  // ---- 10s ----
  { t: "Drishyam",                    era: "10s", diff: "easy" },
  { t: "Premam",                      era: "10s", diff: "easy" },
  { t: "Bangalore Days",              era: "10s", diff: "easy" },
  { t: "Charlie",                     era: "10s", diff: "easy" },
  { t: "Lucifer",                     era: "10s", diff: "easy" },
  { t: "Pulimurugan",                 era: "10s", diff: "easy" },
  { t: "Ustad Hotel",                 era: "10s", diff: "medium" },
  { t: "Traffic",                     era: "10s", diff: "medium" },
  { t: "Maheshinte Prathikaram",      era: "10s", diff: "medium" },
  { t: "Kumbalangi Nights",           era: "10s", diff: "medium" },
  { t: "Thattathin Marayathu",        era: "10s", diff: "medium" },
  { t: "Ennu Ninte Moideen",          era: "10s", diff: "medium" },
  { t: "Adaminte Makan Abu",          era: "10s", diff: "medium" },
  { t: "22 Female Kottayam",          era: "10s", diff: "medium" },
  { t: "North 24 Kaatham",            era: "10s", diff: "medium" },
  { t: "How Old Are You",             era: "10s", diff: "medium" },
  { t: "Ohm Shanthi Oshaana",         era: "10s", diff: "medium" },
  { t: "Oru Vadakkan Selfie",         era: "10s", diff: "medium" },
  { t: "Kammatipaadam",               era: "10s", diff: "medium" },
  { t: "Take Off",                    era: "10s", diff: "medium" },
  { t: "Sudani from Nigeria",         era: "10s", diff: "medium" },
  { t: "Virus",                       era: "10s", diff: "medium" },
  { t: "Jallikattu",                  era: "10s", diff: "medium" },
  { t: "Mumbai Police",               era: "10s", diff: "medium" },
  { t: "Thanthonni",                  era: "10s", diff: "medium" },
  { t: "Aanandam",                    era: "10s", diff: "medium" },
  { t: "Angamaly Diaries",            era: "10s", diff: "hard" },
  { t: "Guppy",                       era: "10s", diff: "hard" },
  { t: "Ee.Ma.Yau",                   era: "10s", diff: "hard" },
  { t: "Thondimuthalum Driksakshiyum",era: "10s", diff: "hard" },
  { t: "Helen",                       era: "10s", diff: "hard" },

  // ---- 20s ----
  { t: "Minnal Murali",               era: "20s", diff: "easy" },
  { t: "Bheeshma Parvam",             era: "20s", diff: "easy" },
  { t: "Romancham",                   era: "20s", diff: "easy" },
  { t: "Manjummel Boys",              era: "20s", diff: "easy" },
  { t: "Aavesham",                    era: "20s", diff: "easy" },
  { t: "Premalu",                     era: "20s", diff: "easy" },
  { t: "Ayyappanum Koshiyum",         era: "20s", diff: "easy" },
  { t: "Drishyam 2",                  era: "20s", diff: "easy" },
  { t: "Jana Gana Mana",              era: "20s", diff: "easy" },
  { t: "2018",                        era: "20s", diff: "easy" },
  { t: "Aadujeevitham",               era: "20s", diff: "easy" },
  { t: "L2 Empuraan",                 era: "20s", diff: "easy" },
  { t: "Nna Thaan Case Kodu",         era: "20s", diff: "medium" },
  { t: "Jan-E-Man",                   era: "20s", diff: "medium" },
  { t: "Hridayam",                    era: "20s", diff: "medium" },
  { t: "Jaya Jaya Jaya Jaya Hey",     era: "20s", diff: "medium" },
  { t: "Bramayugam",                  era: "20s", diff: "medium" },
  { t: "Kishkindha Kaandam",          era: "20s", diff: "medium" },
  { t: "Kaduva",                      era: "20s", diff: "medium" },
  { t: "RDX",                         era: "20s", diff: "medium" },
  { t: "Marco",                       era: "20s", diff: "medium" },
  { t: "Turbo",                       era: "20s", diff: "medium" },
  { t: "Rekhachithram",               era: "20s", diff: "medium" },
  { t: "Thudarum",                    era: "20s", diff: "medium" },
  { t: "Bro Daddy",                   era: "20s", diff: "medium" },
  { t: "Ajayante Randam Moshanam",    era: "20s", diff: "hard" },
];

export default MOVIE_DATASET;
