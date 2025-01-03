# Back End Ticketku

## Deskripsi

API

## Struktur Folder

- **Config**:

  - Berisikan setup prisma, nodemailer dan websocket.

- **Controller**:

  - Berisikan hal yang mengatur segala fitur.

- **Libs**:

  - Berisikan hal yang mengatur imagekit dan multer

- **Media**:

  - Berisikan hal yang mengatur fitur media dengan imagekit.

- **Middleware**:

  - Berisikan perantara berbagai fitur seperti auth, errorhandler dan validation.

- **Routes**:

  - Kumpul endpoint dari fitur yang sudah dibuat.

- **Services**:

  - Berisikan hal yang menghubungkan antara controller dan model/database

- **View**:
  - Tampilan aplikasi seperti mailer.

- **Tests**:
  - Kumpulan pengujian untuk memastikan bahwa fungsi-fungsi dan logika dalam aplikasi berjalan sesuai dengan yang diharapkan. Pengujian dilakukan menggunakan framework Vitest dan memanfaatkan mock untuk mengisolasi dependensi.
  RUN: npx vitest run --coverage

## Fitur

- **Belum tersedia**

## Teknologi yang Digunakan

- **Node.js**: Platform untuk menjalankan JavaScript di server.
- **Express.js**: Framework web untuk membangun API.
- **Prisma**: ORM untuk menghubungkan database dengan JavaScript.
- **PostgreSQL**: Database untuk menyimpan data.
- **Joi**: Library untuk validasi data.
