# Rencana Pembuatan Fitur: Logout Pengguna

Dokumen ini berisi langkah-langkah implementasi *(implementation plan)* yang sangat detail bagi *developer* atau model *AI* untuk membangun rute API "Logout". Fitur ini memfokuskan cara memutus otorisasi yang sah dengan cara menghapus catatan sesi (menghapus *token* terkait) dari dalam pangkalan data.

---

## 1. Pembuatan Lapisan Bisnis (*Service Layer*)

**File target utama:** `src/service/service-user.ts`

**Langkah-langkah Eksekusi:**
1. Buka *file* `src/service/service-user.ts`.
2. Pastikan Anda telah mengimpor tabel **`session`** dari `../db/schema` serta modul fungsi operasi Drizzle seperti `eq` dari `'drizzle-orm'`.
3. Buat dan wajibkan ekspor *(export)* satu fungsi asinkron, misalnya diberi nama `logoutUserService`.
4. Jadikan fungsi tersebut bisa menerima persis **satu** argumen *string* bernama: `token` (teks *bearer token* aslinya).
5. **Algoritma Logika Penghapusan:**
   - [A] Gunakan sintaks *query delete* milik Drizzle ORM yang tertuju padat spesifik bertarget tabel `session`. *(Ini dikarenakan pernyataan "token di tabel users" mengacu kepada penampung entitas relasional aslinya—yaitu tabel `session` itu sendiri).*
   - [B] Contoh formulasi penulisan:
     ```typescript
     const affected = await db.delete(session).where(eq(session.token, token));
     ```
   - [C] (Opsional) Apabila diperlukan pengecekan ganda, uji bilamana operasi `affected` baris balikan tak menghasilkan perubahan apapun *(token aslinya tidak pernah ada atau sudah kedaluwarsa)*. Jika ini kosong, boleh diputuskan melempar *throw new Error('Logout failed')*.
   - [D] Apabila sukses mencabut baris sesi dari basis data, perintahkan modul *Service* untuk kembalikan sinyal sukses seperti *boolean `true`* atau balasan *return* kosong *(void)* supaya rute di atasnya siap merakit respons mutlak API.

---

## 2. Pembuatan Rute / Kontroler API HTTP (*Route Layer*) 

**File target utama:** `src/route/route-user.ts`

**Langkah-langkah Eksekusi:**
1. Buka *file* `src/route/route-user.ts`.
2. Segarkan penulisan kode di atas supaya menyertakan panggilan kepada fungsi baru kita `logoutUserService` dari modul berlapis `service/service-user.ts`.
3. Sisipkan integrasi cabang rute baru spesifik memakai *method* **HTTP DELETE** menarget kepada *endpoint* bernama rute `/users/logout`. Rangkaian sintaks yang harus dibuat:
   ```typescript
   userRoute.delete('/users/logout', async ({ headers, set }) => {
       // logic auth dipanggil disini
   });
   ```
4. **Alur di Dalam Rute DELETE `/users/logout`:**
   - Bentengi skenario menggunakan prosedur penanganan kesalahan wajib yaitu blok *Try-Catch*.
   - Lakukan intersepsi parameter masukan ekstraksi `headers.authorization`.
   - **Validasi Header:**
     - Uji persis properti eksisnya *(String / Undefined)*—dan pastikan ia wajib disisipi kata awalan persis `"Bearer "`.
     - Bila tidak sesuai kriteria ekspektasi validasi, patahkan aliran kode dengan memaksa eksekusi *throw new Error("Logout failed")*.
     - Iris/pisahkan teks mentahnya *(split berdasarkan spasi)* untuk menyeduh hanya variabel nilai UUID murni `token`-nya *(berada di indeks ke-1)*.
   - Panggil rutin eksekusi utama pengahapusan yang kita cetak gagasannya: `await logoutUserService(token)`.
   - **Jika operasi sukses menunaikan kewajiban tanpa terinterupsi (Jalur Try):**
     - Ubah angka status paket balikan kepada klien `set.status = 200`.
     - Kembalikan obyek tanggapan format baku *output*:
       ```json
       {
           "status": 200,
           "message": "Logout success",
           "data": null
       }
       ```
   - **Jika operasi tertahan akibat token siluman, salah, atau tak diakui (Jalur Catch):**
     - Sanggupilah perubahan status pelabelan penolakan dengan angka baku `set.status = 401`.
     - Keluarkan respons JSON kegagalan akhir:
       ```json
       {
           "status": 401,
           "message": "Logout failed",
           "data": null
       }
       ```

---

## 3. Kompilasi Terakhir
**Langkah-langkah Eksekusi:**
- Selama penempatan sub-rutenya masuk ke baris `route-user.ts` persis dengan instruksi folder, eksistensinya tidak perlu integrasi ulang lagi di struktur sentral *index*.
- Hidupkan dan pastikan servernya berjalan dengan ketikan komando `bun run dev`. 
- Silakan pakai perkakas utilitas permintaan HTTP (*curl*, REST Client, Insomnia, atau Postman). Jalankan otentikasi POST `/login` terlebih dulu buat mendapat *token UUID*, lalukan pengujian fitur GET `/users/current` untuk menjamin absensi, setelahnya jajal hantarkan fitur `DELETE` ini disertakan Bearer token bersangkutan untuk dievaluasi peretasannya dari basis ketersediaan profil *(jika HTTP GET `/users/current` diuji lagi setelah itu mestinya menyala dengan gagal 401—sebab token terkait telah terlucuti dari sistem)*.
