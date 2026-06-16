/**
 * Simple profanity filter for Indonesian and English bad words.
 * Used as a basic bot filter before confession enters database.
 */

const BAD_WORDS = [
  "anjing", "babi", "bangsat", "kontol", "memek",
  "ngentot", "ngewe", "pecun", "bego", "tolol",
  "goblok", "idiot", "kampret", "brengsek", "tai",
  "keparat", "bajingan", "setan", "iblis", "sialan",
  "fuck", "shit", "asshole", "bitch", "dick",
  "pussy", "bastard", "damn", "crap", "stupid",
];

export function containsProfanity(text: string): boolean {
  const lowerText = text.toLowerCase();

  // Check for whole word matches (surrounded by non-letter chars or string boundaries)
  for (const word of BAD_WORDS) {
    const regex = new RegExp(`\\b${word}\\b`, "i");
    if (regex.test(lowerText)) {
      return true;
    }
  }

  // Also check for partial matches if the text contains the word as substring
  // (catches cases where words are combined with other chars)
  for (const word of BAD_WORDS) {
    if (lowerText.includes(word)) {
      // Only flag if it appears as a standalone word-like pattern
      const idx = lowerText.indexOf(word);
      const before = idx > 0 ? lowerText[idx - 1] : " ";
      const after =
        idx + word.length < lowerText.length
          ? lowerText[idx + word.length]
          : " ";
      // Check if surrounded by non-alphabetic characters
      if (!/[a-z]/.test(before) && !/[a-z]/.test(after)) {
        return true;
      }
    }
  }

  return false;
}