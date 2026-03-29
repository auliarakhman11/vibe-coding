# Vibe Coding — User Management REST API

Aplikasi REST API sederhana untuk manajemen pengguna (*User Management*) yang dibangun menggunakan **Bun**, **ElysiaJS**, **Drizzle ORM**, dan **MySQL/MariaDB**. Mendukung fitur registrasi, login berbasis session token (UUID), pengambilan profil user yang sedang login, dan logout.

---

## Technology Stack

| Kategori | Teknologi | Keterangan |
|---|---|---|
| **Runtime** | [Bun](https://bun.sh) v1.3.11 | JavaScript/TypeScript runtime yang cepat |
| **Framework** | [ElysiaJS](https://elysiajs.com) v1.4.28 | Web framework untuk Bun |
| **ORM** | [Drizzle ORM](https://orm.drizzle.team) v0.45.2 | TypeScript ORM yang type-safe |
| **Database** | MySQL / MariaDB | Relational database |
| **Database Driver** | [mysql2](https://www.npmjs.com/package/mysql2) v3.20.0 | MySQL client untuk Node.js/Bun |
| **Hashing** | [bcryptjs](https://www.npmjs.com/package/bcryptjs) v3.0.3 | Library untuk hashing password |
| **Migration Tool** | [drizzle-kit](https://orm.drizzle.team/kit-docs/overview) v0.31.10 | CLI untuk generate & push schema |
| **Testing** | Bun Test (built-in) | Test runner bawaan Bun |

---

## Struktur Folder & Penamaan File

```
vibe-coding/
├── src/
│   ├── index.ts              # Entry point aplikasi (Elysia instance)
│   ├── db/
│   │   ├── index.ts          # Konfigurasi koneksi database (Drizzle + mysql2)
│   │   └── schema.ts         # Definisi skema tabel (users, session)
│   ├── route/
│   │   ├── route-user.ts     # Routing: registrasi, get current user, logout
│   │   └── route-auth.ts     # Routing: login
│   └── service/
│       ├── service-user.ts   # Logic bisnis: registrasi, get current user, logout
│       └── service-auth.ts   # Logic bisnis: login & pembuatan session token
├── test/
│   ├── helper.ts             # Helper: cleanDatabase, createTestUser, loginTestUser
│   ├── user.test.ts          # Unit test: POST /api/users
│   ├── auth.test.ts          # Unit test: POST /api/login
│   ├── current-user.test.ts  # Unit test: GET /api/users/current
│   └── logout.test.ts        # Unit test: DELETE /api/users/logout
├── drizzle/                  # File migrasi database (auto-generated)
├── drizzle.config.ts         # Konfigurasi Drizzle Kit
├── .env                      # Environment variables (DATABASE_URL)
├── package.json
└── tsconfig.json
```

### Konvensi Penamaan File

| Folder | Prefix | Contoh |
|---|---|---|
| `src/route/` | `route-` | `route-user.ts`, `route-auth.ts` |
| `src/service/` | `service-` | `service-user.ts`, `service-auth.ts` |

- **Route**: Berisi definisi rute HTTP dan validasi request (menggunakan ElysiaJS schema validation).
- **Service**: Berisi logika bisnis murni (query database, hashing, dll). Tidak mengetahui tentang HTTP request/response.

---

## Database Schema

### Tabel `users`

| Kolom | Tipe | Constraint |
|---|---|---|
| `id` | `INT` | Primary Key, Auto Increment |
| `name` | `VARCHAR(255)` | NOT NULL |
| `username` | `VARCHAR(255)` | NOT NULL, UNIQUE |
| `password` | `VARCHAR(255)` | NOT NULL (bcrypt hash) |
| `email` | `VARCHAR(255)` | NOT NULL, UNIQUE |
| `created_at` | `TIMESTAMP` | NOT NULL, Default: NOW() |
| `updated_at` | `TIMESTAMP` | NOT NULL, Default: NOW(), On Update: NOW() |

### Tabel `session`

| Kolom | Tipe | Constraint |
|---|---|---|
| `id` | `INT` | Primary Key, Auto Increment |
| `token` | `VARCHAR(255)` | NOT NULL (UUID v4) |
| `user_id` | `INT` | NOT NULL, Foreign Key → `users.id` |
| `created_at` | `TIMESTAMP` | NOT NULL, Default: NOW() |
| `updated_at` | `TIMESTAMP` | NOT NULL, Default: NOW(), On Update: NOW() |

---

## API Endpoints

### 1. Registrasi User

```
POST /api/users
```

**Request Body:**
```json
{
    "name": "Rakhman",
    "username": "rakhman",
    "email": "auliarakhman1107@gmail.com",
    "password": "12345678"
}
```

**Validasi:**
- `name`: min 1, max 255 karakter
- `username`: min 3, max 255 karakter
- `email`: min 5, max 255 karakter
- `password`: min 8, max 255 karakter

**Response (201 Created):**
```json
{
    "status": 201,
    "message": "User created successfully",
    "data": {
        "id": 1,
        "name": "Rakhman",
        "username": "rakhman",
        "email": "auliarakhman1107@gmail.com",
        "created_at": "2026-03-29T17:41:06.000Z",
        "updated_at": "2026-03-29T17:41:06.000Z"
    }
}
```

**Response (400 Bad Request):**
```json
{
    "status": 400,
    "message": "User already exists",
    "data": null
}
```

---

### 2. Login User

```
POST /api/login
```

**Request Body:**
```json
{
    "username": "rakhman",
    "password": "12345678"
}
```

**Response (200 OK):**
```json
{
    "status": 200,
    "message": "User login successfully",
    "data": "550e8400-e29b-41d4-a716-446655440000"
}
```

> `data` berisi UUID token yang disimpan di tabel `session`. Gunakan token ini sebagai Bearer token untuk endpoint yang memerlukan autentikasi.

**Response (401 Unauthorized):**
```json
{
    "status": 401,
    "message": "User not found",
    "data": null
}
```

---

### 3. Get Current User

```
GET /api/users/current
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
    "status": 200,
    "message": "User current found",
    "data": {
        "id": 1,
        "username": "rakhman",
        "email": "auliarakhman1107@gmail.com",
        "created_at": "2026-03-29T17:41:06.000Z",
        "updated_at": "2026-03-29T17:41:06.000Z"
    }
}
```

**Response (401 Unauthorized):**
```json
{
    "status": 401,
    "message": "Unauthorized",
    "data": null
}
```

---

### 4. Logout User

```
DELETE /api/users/logout
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
    "status": 200,
    "message": "Logout success",
    "data": null
}
```

> Operasi DELETE bersifat **idempotent** — mengirim logout dua kali dengan token yang sama tetap menghasilkan response `200 OK`.

**Response (401 Unauthorized):**
```json
{
    "status": 401,
    "message": "Logout failed",
    "data": null
}
```

---

## Setup Project

### Prerequisites

- [Bun](https://bun.sh) v1.3+ terinstal
- MySQL atau MariaDB berjalan di lokal

### Langkah-langkah

1. **Clone repository:**
   ```bash
   git clone https://github.com/auliarakhman11/vibe-coding.git
   cd vibe-coding
   ```

2. **Install dependencies:**
   ```bash
   bun install
   ```

3. **Buat file `.env`** di root project:
   ```env
   DATABASE_URL=mysql://root:@localhost:3306/vibe-coding
   ```
   Sesuaikan kredensial database sesuai lingkungan Anda.

4. **Buat database:**
   ```sql
   CREATE DATABASE `vibe-coding`;
   ```

5. **Push schema ke database:**
   ```bash
   bun run db:push
   ```

---

## Menjalankan Aplikasi

```bash
bun run dev
```

Server akan berjalan di `http://localhost:3000` dengan mode *watch* (auto-reload saat ada perubahan file).

---

## Menjalankan Unit Test

```bash
bun test
```

> ⚠️ **Peringatan:** Unit test akan **menghapus semua data** di tabel `users` dan `session` sebelum setiap skenario dijalankan. Pastikan Anda tidak memiliki data penting di database yang digunakan.

**Cakupan test (20 skenario):**

| File | Endpoint | Jumlah Skenario |
|---|---|---|
| `test/user.test.ts` | `POST /api/users` | 7 |
| `test/auth.test.ts` | `POST /api/login` | 4 |
| `test/current-user.test.ts` | `GET /api/users/current` | 4 |
| `test/logout.test.ts` | `DELETE /api/users/logout` | 5 |
