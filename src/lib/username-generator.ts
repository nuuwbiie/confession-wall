/**
 * Random username generator with format: kata1kata2xxx (lowercase)
 * Example: burungsenja482, malamsepi921, pelangihujan305
 */

const ADJECTIVES = [
  "sunyi", "hening", "sepi", "lembayung", "luruh", "damai",
  "rindu", "sendu", "gelap", "terang", "basah", "kering",
  "pelangi", "hujan", "angin", "badai", "lautan", "gunung",
  "bintang", "bulan", "mentari", "fajar", "senja", "malam",
  "pagi", "redup", "terik", "lembab", "segar", "layu",
  "mekar", "gugur", "tumbuh", "hanyut", "layar", "tepi",
  "samudra", "langit", "bumi", "api", "air", "debu",
];

const NOUNS = [
  "kupu", "kumbang", "burung", "merpati", "rajawali",
  "cahaya", "bayang", "harapan", "mimpi", "lagu",
  "doa", "syahdu", "riak", "ombak", "pasir",
  "karang", "damar", "embun", "kabut", "awan",
  "daun", "ranting", "akar", "bunga", "buah",
  "nada", "irama", "melodi", "puisi", "prosa",
  "rona", "warna", "corak", "citra", "esa",
  "biru", "kelabu", "perak", "mbun", "senyap",
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDigits(length: number): string {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += Math.floor(Math.random() * 10).toString();
  }
  return result;
}

export function generateUsername(): string {
  const adj = pickRandom(ADJECTIVES);
  const noun = pickRandom(NOUNS);
  const digits = randomDigits(3);
  return `${adj}${noun}${digits}`;
}