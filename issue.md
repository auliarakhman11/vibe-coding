# Rencana Pembuatan Project: Bun + ElysiaJS + Drizzle + MySQL

Dokumen ini berisi panduan tingkat tinggi (high-level) untuk menginisialisasi dan membangun backend menggunakan stack Bun, ElysiaJS, Drizzle ORM, dan MySQL. Dokumen ini sengaja disusun agar tidak terlalu detail (low-level).

## 1. Inisialisasi Project
- Buat dan inisialisasi project baru menggunakan lingkungan *runtime* **Bun** di *root folder* ini (misal menggunakan `bun init`).

## 2. Instalasi Dependensi Inti
- Install **ElysiaJS** (sebagai *framework* layanan HTTP utama).
- Install **Drizzle ORM** dan **Drizzle Kit** (sebagai *tools* CLI-nya).
- Install *driver* **MySQL** yang kompatibel (seperti `mysql2`).

## 3. Setup Koneksi Database (MySQL & Drizzle)
- Siapkan kredensial koneksi database MySQL menggunakan *environment variables* (lewat file `.env`).
- Buat konfigurasi koneksi *database* MySQL untuk diproses oleh Drizzle ORM.
- Definisikan draf awal skema (*schema*) untuk database Anda lewat kode (seperti di `schema.ts`).
- Siapkan konfigurasi Drizzle (`drizzle.config.ts`) untuk keperluan manajemen *migration*.

## 4. Konfigurasi Server Backend
- Siapkan file pengaturan titik-masuk program (contohnya di `src/index.ts`).
- Bangun *instance server* **ElysiaJS** dan injeksikan atau sediakan akses ke *connection pool* yang dikelola Drizzle.
- Buat dan sambungkan sebuah *route* sederhana (misal `GET /`) untuk memastikan aplikasi dan koneksi server bisa diakses.

## 5. Script Manajemen (Opsional)
- Tambahkan *scripts syntax* singkat di `package.json` untuk membantu mempermudah:
  - Menjalankan aplikasi dalam layanan mode *development* dengan *hot-reload* (misal via `bun --watch`).
  - Menjalankan generasi (*generate*) dan pendorongan migrasi basis data (menggunakan Drizzle Kit).
