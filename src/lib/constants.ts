export type ConfessionFont = "sans" | "serif" | "mono" | "handwriting";

export interface FontOption {
  id: ConfessionFont;
  label: string;
  fontFamily: string;
  fontFamilyClass: string;
  description: string;
}

// Font sesuai SPESIFIKASI (Inter, Playfair Display, Dancing Script, Fira Code)
export const FONT_OPTIONS: FontOption[] = [
  {
    id: "sans",
    label: "Sans",
    fontFamily: "'Inter', sans-serif",
    fontFamilyClass: "font-confession-sans",
    description: "Modern & direct",
  },
  {
    id: "serif",
    label: "Serif",
    fontFamily: "'Playfair Display', serif",
    fontFamilyClass: "font-confession-serif",
    description: "Reflective & literary",
  },
  {
    id: "mono",
    label: "Mono",
    fontFamily: "'Fira Code', monospace",
    fontFamilyClass: "font-confession-mono",
    description: "Raw & unfiltered",
  },
  {
    id: "handwriting",
    label: "Handwriting",
    fontFamily: "'Dancing Script', cursive",
    fontFamilyClass: "font-confession-handwriting",
    description: "Personal & intimate",
  },
];

export interface Confession {
  id: string;
  content: string;
  font: ConfessionFont;
  isPublic: boolean;
  allowReplies: boolean;
  status: "pending" | "published" | "private" | "rejected";
  likes: number;
  comments: number;
  timestamp: string;
}

export const DUMMY_CONFESSIONS: Confession[] = [
  {
    id: "1",
    content:
      "Hari ini terasa sedikit lebih ringan. Menyadari bahwa tidak apa-apa untuk tidak produktif selama satu hari benar-benar membantu kecemasanku mereda.",
    font: "sans",
    isPublic: true,
    allowReplies: true,
    status: "published",
    likes: 24,
    comments: 8,
    timestamp: "2 jam yang lalu",
  },
  {
    id: "2",
    content:
      '"Ada keindahan dalam kesunyian yang tidak pernah dipahami oleh keramaian. Aku belajar untuk mencintai bayanganku sendiri sebelum aku meminta orang lain untuk melakukannya."',
    font: "serif",
    isPublic: true,
    allowReplies: true,
    status: "published",
    likes: 42,
    comments: 15,
    timestamp: "2 jam yang lalu",
  },
  {
    id: "3",
    content:
      "Kangen banget sama masakan Ibu. Rasanya ingin pulang tapi tanggung jawab di sini belum selesai. Semoga semua lelah ini berbuah manis ya...",
    font: "handwriting",
    isPublic: true,
    allowReplies: true,
    status: "published",
    likes: 128,
    comments: 32,
    timestamp: "2 jam yang lalu",
  },
  {
    id: "4",
    content:
      "system_log: [EMOTION_OVERLOAD]\nstatus: trying_to_process\naction: deep_breathing_initiated\n\nJujur, aku capek pura-pura oke di depan semua orang. Capek jadi 'the reliable one' pas aku sendiri butuh pegangan. Hari ini aku nyerah sebentar ya.",
    font: "mono",
    isPublic: true,
    allowReplies: true,
    status: "published",
    likes: 56,
    comments: 12,
    timestamp: "2 jam yang lalu",
  },
  {
    id: "5",
    content:
      "Ternyata benar ya, dewasa itu bukan soal umur, tapi soal seberapa kuat kita menelan kecewa tanpa harus meledak ke orang lain. Tadi di kantor kena tegur bos karena kesalahan yang sebenarnya bukan punyaku, tapi aku cuma bisa diam dan minta maaf. Rasanya sesak, tapi ya sudahlah. Besok hari baru lagi.",
    font: "sans",
    isPublic: true,
    allowReplies: true,
    status: "published",
    likes: 89,
    comments: 21,
    timestamp: "4 jam yang lalu",
  },
];

export const DUMMY_PENDING_CONFESSIONS: Confession[] = [
  {
    id: "6",
    content:
      '"Kadang merasa tidak cukup baik meskipun sudah berusaha keras di kantor..."',
    font: "sans",
    isPublic: true,
    allowReplies: true,
    status: "pending",
    likes: 0,
    comments: 0,
    timestamp: "2 menit yang lalu",
  },
  {
    id: "7",
    content: '"Kangen rumah, kangen masakan ibu. Hidup merantau itu ternyata sunyi."',
    font: "serif",
    isPublic: false,
    allowReplies: true,
    status: "pending",
    likes: 0,
    comments: 0,
    timestamp: "15 menit yang lalu",
  },
  {
    id: "8",
    content:
      '"Terima kasih untuk hari ini. Akhirnya project yang bikin begadang selesai!"',
    font: "sans",
    isPublic: true,
    allowReplies: true,
    status: "pending",
    likes: 0,
    comments: 0,
    timestamp: "1 jam yang lalu",
  },
  {
    id: "9",
    content: '"Benci banget kalau ide diambil orang terus diakui sebagai miliknya."',
    font: "sans",
    isPublic: true,
    allowReplies: true,
    status: "pending",
    likes: 0,
    comments: 0,
    timestamp: "2 jam yang lalu",
  },
  {
    id: "10",
    content: '"Meeting terus, kerjaannya kapan selesainya ya Tuhan?"',
    font: "mono",
    isPublic: true,
    allowReplies: true,
    status: "pending",
    likes: 0,
    comments: 0,
    timestamp: "4 jam yang lalu",
  },
];

// Key untuk localStorage draft
export const DRAFT_STORAGE_KEY = "confession-wall-draft";

// Validasi
export const CONFESSION_MIN_CHARS = 10;
export const CONFESSION_MAX_CHARS = 2000;