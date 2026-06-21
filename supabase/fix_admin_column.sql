-- Perbaikan: Tambah kolom is_admin ke tabel profiles (jika belum ada)
-- Jalankan SQL ini di Supabase SQL Editor

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Setelah menjalankan ini, jangan lupa:
-- 1. Buka Supabase → Table Editor → pilih tabel "profiles"
-- 2. Cari baris data Anda, klik edit, centang is_admin = true
-- 3. Save
-- Atau jalankan query UPDATE dengan ID user Anda sendiri