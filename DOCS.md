# 📝 Dokumentasi Proyek: Tel-U Verse Admin Dashboard

Proyek ini adalah sistem manajemen terpusat untuk aplikasi **Tel-U Verse**, sebuah platform navigasi dan eksplorasi berbasis *Augmented Reality* (AR) untuk lingkungan Telkom University.

---

## 🚀 1. Tech Stack (Teknologi yang Digunakan)

Sistem ini dibangun dengan arsitektur modern yang berfokus pada kecepatan, skalabilitas, dan sinkronisasi real-time.

*   **Frontend Framework:** [Next.js 15+](https://nextjs.org/) (App Router architecture).
*   **Bahasa Pemrograman:** [TypeScript](https://www.typescriptlang.org/) (Strict type-safety).
*   **Styling & UI:** [Tailwind CSS](https://tailwindcss.com/) dengan pendekatan desain *Premium & Modern Aesthetics*.
*   **Database & Authentication:** [Supabase](https://supabase.com/) (PostgreSQL + Auth + Storage).
*   **Game Backend Integration:** [PlayFab](https://playfab.com/) (Server API untuk konfigurasi operasional game).
*   **Deployment & Hosting:** Vercel (disarankan) atau platform Node.js lainnya.

---

## 🛠️ 2. Arsitektur Sistem

Sistem ini berfungsi sebagai jembatan antara **Admin Kampus**, **Mitra/Tenant**, dan **Aplikasi Unity (User)**.

1.  **Supabase:** Mengelola data akun Mitra, profil, dan otentikasi login.
2.  **PlayFab:** Bertindak sebagai *Remote Configuration* untuk aplikasi Unity. Admin mengubah mode di Dashboard, dan aplikasi Unity akan langsung berubah perilakunya.
3.  **GitHub Releases:** Digunakan sebagai hosting file APK berukuran besar (280MB+) untuk menghindari limitasi penyimpanan database.

---

## 📋 3. Fitur Utama

### A. Landing Page (Public)
*   **Hero Section:** CTA utama untuk mengunduh aplikasi Tel-U Verse versi terbaru.
*   **APK Download System:** Integrasi dengan GitHub Releases untuk distribusi file besar yang stabil.
*   **Live Events Board:** Menampilkan kegiatan aktif yang sedang berlangsung di kampus (sinkron dengan database).
*   **Portal Login:** Akses tersembunyi untuk Admin dan Mitra.

### B. Admin Dashboard (Protected)
*   **Overview Stats:** Ringkasan total mitra dan status mode operasional saat ini.
*   **Mode Management:**
    *   **Normal Mode:** Eksplorasi bebas tanpa rute khusus.
    *   **PKKMB Mode:** Mode khusus orientasi mahasiswa baru.
    *   **Special Event (Kunjungan):** Sistem rute dinamis (1-8 titik) yang diambil dari master data `BuildingLocation` di PlayFab.
*   **Partner Management:**
    *   Pendaftaran akun mitra baru dengan validasi masa aktif (expiry date).
    *   Sistem proteksi input waktu agar tidak bisa memilih waktu lampau.
    *   Paginasi data (10 data per halaman) untuk performa optimal.
    *   Custom Delete Modal dengan verifikasi ganda.

### C. Integrasi Data Dinamis
*   **Building Database:** Daftar gedung diambil secara dinamis dari PlayFab, memungkinkan penambahan gedung baru tanpa menyentuh kode website.

---

## 🗄️ 4. Spesifikasi Database (Supabase)

**Table: `profiles`**

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | uuid (PK) | Relasi ke Supabase Auth |
| `name` | text | Nama Instansi/Mitra |
| `role` | text | 'admin' atau 'mitra' |
| `expires_at` | timestamptz | Tanggal berakhir akun (null = permanen) |
| `created_at` | timestamptz | Waktu registrasi |

---

## 🔌 5. Integrasi PlayFab (Title Data)

*   **Key: `Mode`**: Mengatur status aktif aplikasi (`Normal`, `PKKMB`, `SpecialEvent`).
*   **Key: `SpecialEvent`**: Menyimpan daftar `quests` berisi rute gedung yang harus dikunjungi.
*   **Key: `BuildingLocation`**: Master data seluruh gedung (ID, Nama, Lokasi).

---

## 🛡️ 6. Keamanan & Validasi
*   **Middleware:** Memastikan halaman `/admin` hanya bisa diakses oleh akun dengan `role: admin`.
*   **Time Guard:** Validasi *client-side* dan *server-side* untuk mencegah manipulasi tanggal kadaluarsa mitra.
*   **Environment Variables:** Pengamanan Title ID dan Secret Key PlayFab menggunakan `.env.local` agar tidak terekspos ke publik.

---

## 📦 7. Struktur Folder Proyek
```text
/app
  /admin        -> Dashboard Admin (Protected)
  /api          -> Backend Routes (PlayFab Sync, etc.)
  /login        -> Otentikasi
  /mitra        -> Portal Khusus Mitra
/components     -> UI Components (Modals, Inputs)
/utils          -> Supabase Client & Helper Functions
/public         -> Aset Statis (Logo, Ikon)
```

---
*Dokumen ini dibuat secara otomatis sebagai panduan teknis proyek Tel-U Verse.*
