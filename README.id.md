<div align="center">

# 🧱 Confession Wall

**Ruang aman dan anonim untuk berbagi isi hati.**

*Sebuah dinding curhatan anonim yang dirancang untuk kesehatan emosional di tempat kerja — di mana setiap kartu adalah bagian dari hati seseorang, dibagikan dalam keheningan yang aman.*

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB-3ECF8E?logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)

**🌐 Bahasa Lain / Other Languages:**
[![EN](https://img.shields.io/badge/🇺🇸-English-blue)](./README.md)
[![ID](https://img.shields.io/badge/🇮🇩-Indonesia-red)](./README.id.md)
[![ZH](https://img.shields.io/badge/🇨🇳-简体中文-green)](./README.zh-CN.md)

[🚀 Mulai Cepat](#-mulai-cepat) · [✨ Fitur](#-fitur) · [📡 API](#-referensi-api) · [🤝 Kontribusi](./CONTRIBUTING.md) · [📄 Lisensi](#-lisensi)

</div>

---

## 📸 Tangkapan Layar

<!-- Tambahkan screenshot Anda di sini! Contoh: -->
<!--
| The Wall | Form Curhat | Dashboard HR |
|----------|-------------|--------------|
| ![Wall](./docs/screenshots/wall.png) | ![Form](./docs/screenshots/form.png) | ![Dashboard](./docs/screenshots/dashboard.png) |
-->

> 🎯 **Tip:** Ambil screenshot dari aplikasi yang sedang berjalan dan letakkan di `docs/screenshots/`, lalu hapus komentar pada tabel di atas.

---

## ✨ Fitur

### 🎨 Suara Visual — Pemilih Font
Setiap curhatan berhak mendapatkan suaranya sendiri. Pilih dari 4 font yang dikurasi dengan cermat:

| Font | Tipografi | Nuansa |
|------|-----------|--------|
| **Sans** | Inter | Modern & langsung |
| **Serif** | Playfair Display | Reflektif & sastrawi |
| **Mono** | Fira Code | Mentah & tanpa filter |
| **Handwriting** | Dancing Script | Personal & intim |

### 🧱 Dinding Grid Masonry
Curhatan ditampilkan dalam tata letak grid masonry yang indah dan responsif — seperti sticky notes di dinding sungguhan. Setiap kartu bernapas dengan ritmenya sendiri berdasarkan panjang konten.

### ❤️ Sistem Like
- Pembaruan UI optimistis untuk respons instan
- Beralih like/unlike dengan satu ketukan
- Jumlah like yang disinkronkan dengan server
- Memerlukan login dengan fallback yang halus ke modal login

### 💬 Sistem Komentar
- Komentar pada curhatan apa pun
- UI komentar berbasis modal
- Jumlah komentar pada kartu dinding
- Hanya tersedia jika penulis mengizinkan balasan

### 🔒 Kontrol Privasi
Setiap curhatan memberikan kendali penuh kepada penulis:

| Pengaturan | Deskripsi |
|------------|-----------|
| **Publik / Pribadi** | Curhatan publik muncul di The Wall; yang pribadi hanya masuk ke HR |
| **Izinkan Balasan** | Aktifkan/nonaktifkan komentar orang lain pada curhatan Anda |
| **Identitas Anonim** | Sembunyikan atau tampilkan nama pengguna Anda — pilihan Anda, keamanan Anda |

### 🛡️ Moderasi Konten
- **Filter Kata Kasar** — Deteksi otomatis kata-kata tidak pantas dalam Bahasa Indonesia & Inggris sebelum pengiriman
- **Tinjauan Pra-Publikasi** — Curhatan baru mulai sebagai `pending` dan perlu persetujuan HR
- **Timer Publikasi Otomatis** — Curhatan pending otomatis tayang setelah 3 jam jika tidak ditinjau
- **Moderasi HR** — Setujui, tolak, atau hapus dari dashboard

### 🔔 Sistem Notifikasi
- Lonceng notifikasi di header
- Lencana jumlah notifikasi belum dibaca
- Notifikasi saat HR membalas secara pribadi ke curhatan Anda
- Tandai sudah dibaca dengan satu klik
- Modal notifikasi untuk melihat balasan HR dalam konteks

### 🏢 Dashboard HR
Dashboard admin lengkap untuk tim HR:

| Fitur | Deskripsi |
|-------|-----------|
| **Kartu Metrik** | Total curhatan, jumlah pending, persentase kesehatan emosional, jumlah yang diterbitkan |
| **Navigasi Tab** | Beralih antara "Perlu Review" dan "Terfilter" |
| **Aksi Massal** | Setujui semua curhatan publik yang pending dengan satu klik |
| **Aksi Individual** | Setujui, tolak, hapus, atau kirim balasan pribadi HR |
| **Balasan Pribadi HR** | Tanggapi secara rahasia — hanya penulis curhatan yang melihatnya |
| **Paginasi** | Paginasi yang rapi untuk kedua tab (20 item/halaman) |
| **Responsif** | Tampilan tabel desktop + tampilan kartu mobile |

### 👤 Autentikasi
- Integrasi Supabase Auth
- Modal login dengan UX yang mulus
- Deteksi admin melalui flag `is_admin` di profil
- Navigasi dinamis (tautan Dashboard hanya untuk admin)
- Riwayat curhatan pengguna di dropdown avatar

### 📝 Pengalaman Menulis
- **Draft Simpan Otomatis** — Jangan pernah kehilangan kata-kata Anda; draft disimpan di localStorage
- **Pratinjau Langsung** — Lihat bagaimana curhatan Anda akan terlihat sebelum dikirim
- **Penghitung Karakter** — Bilah progres visual dengan status peringatan/berbahaya
- **Validasi** — Minimal 10 karakter, maksimal 2000 karakter

### 📱 Desain Responsif
- Pendekatan mobile-first dengan target ramah sentuhan
- Menu hamburger dengan laci navigasi geser ke bawah
- Grid masonry responsif (1 kolom mobile → banyak kolom desktop)
- Floating Action Button untuk menulis curhatan cepat

### 🦴 Status Loading & Error
- Grid kartu skeleton selama pemuatan data
- Status error dengan tombol coba lagi
- Status kosong dengan pesan yang mendorong semangat
- Animasi spinner untuk aksi asinkron

---

## 🏗️ Tech Stack

| Teknologi | Tujuan |
|-----------|--------|
| [Next.js 16](https://nextjs.org/) | Framework React dengan App Router & API Routes |
| [React 19](https://react.dev/) | Library UI dengan fitur terbaru |
| [Supabase](https://supabase.com/) | Autentikasi, database PostgreSQL, Row Level Security |
| [Tailwind CSS v4](https://tailwindcss.com/) | Framework CSS utility-first |
| [TypeScript 5](https://www.typescriptlang.org/) | JavaScript yang aman tipe |
| [Material Symbols](https://fonts.google.com/icons) | Sistem ikon |

---

## 🚀 Mulai Cepat

### Prasyarat

- **Node.js** ≥ 18
- **npm** atau **pnpm** atau **yarn**
- Akun [Supabase](https://supabase.com/) (tingkat gratis sudah bisa!)

### 1. Clone Repository

```bash
git clone https://github.com/nuuwbiie/confession-wall.git
cd confession-wall
```

### 2. Install Dependensi

```bash
npm install
```

### 3. Atur Variabel Lingkungan

```bash
cp .env.example .env.local
```

Edit `.env.local` dengan kredensial Supabase Anda:

```env
NEXT_PUBLIC_SUPABASE_URL=https://id-proyek-anda.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=anon-key-anda
SUPABASE_SERVICE_ROLE_KEY=service-role-key-anda
```

> 💡 Dapatkan ini dari [Dashboard Supabase → Pengaturan → API](https://app.supabase.com/project/_/settings/api)

### 4. Siapkan Database Supabase

1. Buka proyek Supabase Anda di **SQL Editor**
2. Salin dan jalankan isi dari [`supabase/migration.sql`](./supabase/migration.sql)
3. Opsional: jalankan [`supabase/fix_admin_column.sql`](./supabase/fix_admin_column.sql) jika diperlukan

### 5. Aktifkan Autentikasi Supabase

Di dashboard Supabase Anda:
1. Buka **Authentication → Providers**
2. Aktifkan penyedia **Email**
3. Konfigurasi URL situs dan URL redirect Anda

### 6. Buat Pengguna Admin

1. Daftarkan pengguna baru melalui modal login aplikasi
2. Di SQL Editor Supabase, atur pengguna sebagai admin:

```sql
UPDATE profiles SET is_admin = true WHERE username = 'nama-pengguna-anda';
```

### 7. Jalankan Server Pengembangan

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) dan mulailah curhat! 🎉

### 8. (Opsional) Atur Cron Publikasi Otomatis

Untuk mempublikasikan curhatan pending secara otomatis setelah 3 jam, atur cron job yang memanggil:

```
GET https://domain-anda.com/api/cron/publish
```

Anda bisa menggunakan [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs), [Supabase Edge Functions](https://supabase.com/docs/guides/functions), atau layanan cron eksternal lainnya.

---

## ⚙️ Variabel Lingkungan

| Variabel | Wajib | Deskripsi |
|----------|-------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | URL proyek Supabase Anda |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Kunci anonim/publik Supabase (aman untuk sisi klien) |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Kunci peran layanan Supabase (hanya sisi server, melewati RLS) |

> ⚠️ **Jangan pernah mengekspos `SUPABASE_SERVICE_ROLE_KEY` ke klien!** Hanya digunakan di route API sisi server.

---

## 📂 Struktur Proyek

```
confession-wall/
├── public/                     # Aset statis
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx            # Beranda — The Wall (grid masonry)
│   │   ├── layout.tsx          # Layout root dengan provider
│   │   ├── confess/            # Halaman tulis curhatan
│   │   ├── dashboard/          # Dashboard admin HR
│   │   ├── login/              # Halaman login
│   │   ├── auth/               # Penangan callback auth
│   │   └── api/                # Route API
│   │       ├── confessions/    # CRUD + like + komentar + balasan HR
│   │       ├── moderate/       # Aksi moderasi admin
│   │       ├── notifications/  # Endpoint notifikasi
│   │       ├── auth/           # Pemeriksaan admin
│   │       ├── comments/       # CRUD komentar
│   │       ├── user/           # Data khusus pengguna
│   │       └── cron/           # Endpoint publikasi otomatis
│   ├── components/             # Komponen React
│   │   ├── Header.tsx          # Navigasi, auth, notifikasi
│   │   ├── WallCard.tsx        # Kartu curhatan dengan like/komentar
│   │   ├── ConfessionForm.tsx  # Formulir tulis dengan semua kontrol
│   │   ├── ConfessionPreview.tsx
│   │   ├── CommentModal.tsx    # Modal thread komentar
│   │   ├── NotificationModal.tsx
│   │   ├── LoginModal.tsx      # Modal auth
│   │   ├── LoginModalWrapper.tsx
│   │   ├── AuthProvider.tsx    # Konteks auth global
│   │   ├── MasonryGrid.tsx    # Tata letak CSS masonry
│   │   ├── SkeletonCard.tsx    # Skeleton loading
│   │   └── Footer.tsx
│   ├── hooks/
│   │   └── useConfessionForm.ts  # Manajemen state form dengan useReducer
│   └── lib/
│       ├── constants.ts        # Font, batasan, data dummy
│       ├── profanity-filter.ts # Filter kata kasar Indonesia + Inggris
│       ├── username-generator.ts
│       ├── auth-helpers.ts
│       ├── actions/
│       └── supabase/
│           └── client.ts       # Klien browser Supabase
├── supabase/
│   ├── migration.sql           # Skema database lengkap
│   └── fix_admin_column.sql   # Perbaikan kolom admin
├── .env.example                # Template variabel lingkungan
├── CONTRIBUTING.md             # Panduan kontribusi
└── LICENSE                     # Lisensi MIT
```

---

## 🗄️ Skema Database

### Relasi Entitas

```
┌─────────────┐       ┌──────────────────┐       ┌──────────────┐
│  profiles   │       │   confessions    │       │    likes      │
├─────────────┤       ├──────────────────┤       ├──────────────┤
│ id (PK, FK) │──┐    │ id (PK)          │───┐   │ id (PK)      │
│ username    │  │    │ content          │   │   │ confession_id│
│ is_admin    │  └───▶│ user_id (FK)     │   └──▶│ user_id (FK) │
│ created_at  │       │ font             │       │ created_at   │
└─────────────┘       │ is_public        │       └──────────────┘
                      │ allow_replies    │
                      │ is_anonymous     │       ┌──────────────┐
                      │ status (enum)    │       │   comments   │
                      │ likes            │       ├──────────────┤
                      │ published_at     │       │ id (PK)      │
                      └──────┬──────────┘       │ confession_id│
                             │                   │ content      │
                     ┌───────┴───────┐           │ user_id (FK) │
                     │               │           │ created_at   │
              ┌──────┴─────┐  ┌─────┴──────┐    └──────────────┘
              │ hr_replies │  │notifications│
              ├────────────┤  ├────────────┤
              │ id (PK)    │  │ id (PK)    │
              │confession_id│  │ user_id    │
              │ content    │  │confession_id│
              │ admin_id   │  │ type       │
              │ created_at │  │ content    │
              └────────────┘  │ is_read    │
                              │ created_at │
                              └────────────┘
```

### Status Enum (`confession_status`)

| Status | Deskripsi |
|--------|-----------|
| `pending` | Menunggu review HR (publikasi otomatis setelah 3 jam) |
| `published` | Terlihat di The Wall |
| `private` | Hanya terlihat oleh HR (tidak ditampilkan di Wall) |
| `rejected` | Difilter oleh HR |

### Row Level Security (RLS)

Semua tabel memiliki RLS yang diaktifkan dengan kebijakan yang dirancang dengan cermat:

- **Curhatan publik** — dapat dibaca oleh semua orang
- **Curhatan sendiri** — pengguna dapat melihat posting pending/pribadi mereka sendiri
- **Like** — siapa pun dapat melihat; pengguna terautentikasi dapat memberi/menghapus like
- **Komentar** — dapat dilihat pada curhatan yang diterbitkan; dapat ditambahkan jika balasan diizinkan
- **Balasan HR** — hanya terlihat oleh pemilik curhatan dan admin
- **Notifikasi** — pengguna hanya dapat melihat dan memperbarui notifikasi mereka sendiri

---

## 📡 Referensi API

### Curhatan

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET` | `/api/confessions` | Ambil curhatan berdasarkan status |
| `POST` | `/api/confessions` | Kirim curhatan baru |
| `POST` | `/api/confessions/[id]/like?action=like\|unlike` | Beralih like |
| `GET` | `/api/confessions/[id]/like` | Periksa apakah pengguna saat ini memberi like |
| `GET` | `/api/confessions/[id]/comments` | Dapatkan komentar untuk curhatan |
| `POST` | `/api/confessions/[id]/comments` | Tambah komentar |
| `POST` | `/api/confessions/[id]/hr-reply` | Balasan pribadi HR (khusus admin) |

#### `GET /api/confessions` Parameter Query

| Param | Tipe | Default | Deskripsi |
|-------|------|---------|-----------|
| `status` | string | `published` | Status yang dipisahkan koma (`published`, `pending`, `private`, `rejected`) |
| `limit` | number | `50` | Hasil per halaman |
| `offset` | number | `0` | Offset paginasi |

#### `POST /api/confessions` Body

```json
{
  "content": "Teks curhatan Anda...",
  "font": "sans | serif | mono | handwriting",
  "is_public": true,
  "allow_replies": true,
  "is_anonymous": true
}
```

### Moderasi (Khusus Admin)

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `POST` | `/api/moderate` | Lakukan aksi moderasi |

#### `POST /api/moderate` Body

```json
// Setujui satu curhatan
{ "action": "approve", "confession_id": "uuid" }

// Tolak curhatan
{ "action": "reject", "confession_id": "uuid" }

// Hapus curhatan
{ "action": "delete", "confession_id": "uuid" }

// Setujui semua curhatan publik yang pending
{ "action": "approve_all" }

// Balas sebagai admin
{ "action": "reply", "confession_id": "uuid", "message": "..." }
```

### Notifikasi

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET` | `/api/notifications` | Dapatkan notifikasi pengguna |
| `PUT` | `/api/notifications/[id]/read` | Tandai notifikasi sudah dibaca |

### Autentikasi

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET` | `/api/auth/check-admin` | Periksa apakah pengguna saat ini adalah admin |
| `GET` | `/api/user/confessions` | Dapatkan curhatan pengguna saat ini |

### Cron

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET` | `/api/cron/publish` | Publikasikan otomatis curhatan pending yang lebih dari 3 jam |

---

## 🚢 Deployment

### Vercel (Direkomendasikan)

1. Dorong kode Anda ke GitHub
2. Impor repository di [Vercel](https://vercel.com/new)
3. Tambahkan variabel lingkungan di pengaturan proyek Vercel
4. Deploy!

Untuk cron publikasi otomatis, tambahkan ke `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/publish",
      "schedule": "0 * * * *"
    }
  ]
}
```

### Platform Lain

Ini adalah aplikasi Next.js standar — dapat di-deploy ke platform apa pun yang mendukung Node.js:

```bash
npm run build
npm start
```

---

## 🗺️ Peta Pengembangan

Ide untuk pengembangan masa depan:

- [ ] 🌙 Tombol mode gelap
- [ ] 🏷️ Tag/kategori untuk curhatan
- [ ] 📊 Dashboard analitik untuk HR (analisis sentimen, grafik tren)
- [ ] 🔗 Tautan curhatan yang dapat dibagikan
- [ ] 📧 Notifikasi email untuk balasan HR
- [ ] 🎨 Tema warna kustom untuk kartu curhatan
- [ ] 📱 Dukungan PWA dengan notifikasi push
- [ ] 🤖 Kategorisasi konten berbasis AI
- [ ] 🌐 Dukungan i18n / multi-bahasa
- [ ] 💾 Dukungan lampiran gambar

---

## 🤝 Kontribusi

Kami menyambut kontribusi! Silakan baca [**Panduan Kontribusi**](./CONTRIBUTING.md) untuk detail tentang:

- 🍴 Cara fork dan setup proyek
- 🌿 Konvensi penamaan branch
- 📝 Format pesan commit
- 🔀 Proses pull request
- 🏗️ Arsitektur proyek

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah Lisensi MIT — lihat file [LICENSE](./LICENSE) untuk detailnya.

---

<div align="center">

**Dibuat dengan ❤️ untuk kesehatan emosional di tempat kerja**

*Setiap kartu di dinding ini adalah bagian dari hati seseorang, dibagikan dalam keheningan yang aman.*

[⬆ Kembali ke Atas](#-confession-wall)

</div>