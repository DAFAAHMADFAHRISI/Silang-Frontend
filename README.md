SILANG – Frontend
Frontend untuk SILANG (Sistem Informasi Laporan Magang), aplikasi berbasis web untuk mendukung aktivitas magang seperti absensi, tugas, pelaporan, dan komunikasi antara Siswa, Guru, dan Mentor.

🔗 GitHub Repo: https://github.com/DAFAAHMADFAHRISI/Silang-Frontend

✨ Fitur Antarmuka

1. Login & Role-based Dashboard
        Login untuk Superadmin, Mentor, Guru, dan Siswa
        Navigasi dan fitur berdasarkan role pengguna
        **Login Google dengan validasi email**: Fitur baru untuk memeriksa ketersediaan email sebelum login Google

2. Dashboard & Notifikasi
        Ringkasan informasi harian
        Notifikasi tugas & absensi

3. Absensi Magang
        Check-in / Check-out dengan tampilan lokasi dan foto
        Histori absensi

4. Tugas & Penilaian
        Tampilan daftar tugas untuk siswa
        Fitur unggah file tugas
        Penilaian dan komentar dari mentor/guru

5. Manajemen Relasi
        Daftar siswa per mentor/guru
        Akses profil & laporan tiap siswa

6. 🗨️ Chatbox Antar Pengguna
        Fitur komunikasi antar pengguna selain Superadmin
        Mendukung realtime atau semi-realtime (polling/socket)
        Riwayat chat per pengguna (mentor ↔ siswa, guru ↔ siswa, mentor ↔ guru)

## 🔐 Fitur Login Google yang Diperbarui

### Penanganan Email Tidak Terdaftar
- **Validasi Email**: Sebelum melakukan login Google, sistem akan memeriksa apakah email sudah terdaftar di database
- **Endpoint Test**: Menggunakan `http://localhost:3000/API/auth/google/test` untuk memeriksa ketersediaan email
- **Pesan Error yang Jelas**: Menampilkan pesan "Akun belum terdaftar" dengan opsi untuk langsung ke halaman register
- **Callback Handler**: Komponen `GoogleCallback` untuk menangani response dari Google OAuth
- **Fallback**: Jika terjadi error saat pengecekan email, sistem tetap melanjutkan ke Google OAuth

### Alur Kerja
1. User mengklik tombol "Login dengan Google"
2. Sistem langsung redirect ke Google OAuth
3. Setelah OAuth, callback ditangani oleh komponen `GoogleCallback`
4. Jika terjadi error `account_not_found`, redirect ke halaman `/auth-error` dengan informasi akun Google

### Halaman AuthError
- **URL**: `/auth-error` - Halaman khusus untuk menampilkan error akun Google yang belum terdaftar
- **Fitur**:
  - Menampilkan informasi akun Google (nama, email, Google ID)
  - Tombol "Kembali ke Login" untuk kembali ke halaman login
  - Tombol "Hubungi Administrator" untuk menghubungi admin via WhatsApp
  - Desain yang sesuai dengan gambar yang ditampilkan
  - Gradient background dan card design yang modern

### Komponen yang Ditambahkan
- `src/Page/GoogleCallback.tsx`: Menangani callback dari Google OAuth
- `src/Page/AuthError.tsx`: Halaman error untuk akun Google yang belum terdaftar
- Route `/google-callback` dan `/auth-error` di `App.tsx`
- Tombol "Login dengan Google" yang langsung redirect ke OAuth
- Penanganan error yang lebih baik untuk kasus akun tidak terdaftar
- Tombol "Kembali ke Login" dan "Hubungi Administrator" di halaman error
