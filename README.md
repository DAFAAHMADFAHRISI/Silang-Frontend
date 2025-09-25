# SILANG – Frontend

**SILANG (Sistem Informasi Laporan Magang)** adalah aplikasi web berbasis React TypeScript yang dirancang untuk mendukung aktivitas magang, meliputi absensi, tugas, pelaporan, dan komunikasi antara Siswa, Guru, Mentor, dan Superadmin.

🔗 **GitHub Repository**: https://github.com/DAFAAHMADFAHRISI/Silang-Frontend

## 🚀 Teknologi dan Dependencies

### Core Technologies
- **React 19.1.0** - Library JavaScript untuk membangun antarmuka pengguna
- **TypeScript 4.9.5** - Superset JavaScript dengan static typing
- **React Router DOM 7.7.0** - Routing untuk aplikasi React SPA

### UI & Styling
- **Tailwind CSS 3.4.17** - Framework CSS utility-first
- **Headless UI React 2.2.4** - Komponen UI tanpa styling untuk aksesibilitas
- **Lucide React 0.525.0** - Library icon modern dan konsisten

### HTTP Client & State Management
- **Axios 1.11.0** - HTTP client untuk API calls dengan interceptors
- **Local Storage** - Client-side storage untuk autentikasi dan state management

### Utilities & Helpers
- **Moment.js 2.30.1** - Library untuk manipulasi tanggal dan waktu
- **SweetAlert2 11.22.2** - Library untuk alert dan modal yang menarik
- **React Webcam 7.2.0** - Komponen untuk capture foto absensi

### Development & Testing
- **React Scripts 5.0.1** - Build tools untuk Create React App
- **Testing Library** - Suite untuk testing komponen React
- **Type Definitions** - TypeScript definitions untuk Node.js, React, dan Jest

### Build & Styling Tools
- **PostCSS 8.5.6** - Tool untuk transformasi CSS
- **Autoprefixer 10.4.21** - Plugin PostCSS untuk vendor prefixes
- **Web Vitals 2.1.4** - Library untuk mengukur performa web

## ✨ Fitur Utama

### 1. 🔐 Sistem Autentikasi & Otorisasi
- **Multi-Role Login**: Mendukung 4 jenis pengguna (Superadmin, Mentor, Guru, Siswa)
- **Google OAuth Integration**: Login dengan akun Google dengan validasi email
- **Protected Routes**: Sistem keamanan berbasis role dengan komponen ProtectedRoute
- **Token-based Authentication**: JWT token untuk session management
- **Auto-redirect**: Redirect otomatis berdasarkan role setelah login

### 2. 👨‍💼 Dashboard Superadmin
- **User Management**: CRUD lengkap untuk pengelolaan user (tambah, edit, hapus)
- **Data Institusi**: Manajemen data institusi pendidikan
- **Data Jadwal**: Pengaturan jadwal magang dan kegiatan
- **Data Tugas**: Monitoring semua tugas di sistem
- **Data Absensi**: Overview absensi semua siswa
- **Relasi Mentor-Siswa**: Pengaturan pairing mentor dengan siswa
- **Relasi Guru-Siswa**: Pengaturan pairing guru dengan siswa
- **Data Rekap**: Laporan komprehensif sistem

### 3. 👨‍🏫 Dashboard Mentor
- **Manajemen Tugas**: Buat, edit, dan kelola tugas untuk siswa
- **Penilaian Tugas**: Review dan beri nilai pada submission siswa
- **Monitoring Absensi**: Pantau kehadiran siswa yang dibimbing
- **Data Rekap**: Laporan performa siswa
- **Chat**: Komunikasi dengan siswa dan guru

### 4. 👩‍🏫 Dashboard Guru
- **Review Tugas**: Lihat dan evaluasi tugas siswa
- **Monitoring Absensi**: Pantau kehadiran siswa
- **Data Rekap**: Laporan akademik siswa
- **Detail Siswa**: Akses profil dan progress siswa
- **Chat**: Komunikasi dengan siswa dan mentor

### 5. 👨‍🎓 Dashboard Siswa
- **To-Do List**: Daftar tugas yang harus dikerjakan
- **Submit Tugas**: Upload file dan submit tugas
- **Edit Tugas**: Edit submission sebelum deadline
- **Absensi**: Check-in/Check-out dengan foto dan lokasi
- **Laporan**: Generate laporan aktivitas magang
- **Profil**: Kelola data pribadi

### 6. 📱 Fitur Absensi Canggih
- **Geolocation**: Capture lokasi saat check-in/check-out
- **Photo Capture**: Ambil foto selfie menggunakan webcam
- **Real-time Tracking**: Monitoring kehadiran real-time
- **History Absensi**: Riwayat lengkap kehadiran

### 7. 💬 Sistem Chat
- **Multi-user Chat**: Komunikasi antar role (Mentor ↔ Siswa, Guru ↔ Siswa, Mentor ↔ Guru)
- **Real-time Messaging**: Sistem chat real-time
- **Chat History**: Riwayat percakapan tersimpan
- **Role-based Access**: Akses chat berdasarkan permission

### 8. 📊 Sistem Laporan
- **Auto-generated Reports**: Laporan otomatis berdasarkan data
- **Export Functionality**: Export laporan ke berbagai format
- **Dashboard Analytics**: Visualisasi data dan statistik
- **Progress Tracking**: Monitoring progress siswa

### 9. 🔧 Fitur Teknis
- **Responsive Design**: Optimized untuk desktop, tablet, dan mobile
- **Error Handling**: Comprehensive error handling dan user feedback
- **Loading States**: Loading indicators untuk better UX
- **Toast Notifications**: Notifikasi real-time untuk user actions
- **Form Validation**: Client-side dan server-side validation

## 🏗️ Arsitektur Aplikasi

### Struktur Folder
```
src/
├── components/           # Komponen reusable
│   ├── ProtectedRoute.tsx    # Route protection berdasarkan role
│   ├── ErrorBoundary.tsx     # Error handling wrapper
│   ├── ErrorHandler.tsx      # Custom error handler
│   └── ToastManager.tsx      # Toast notification manager
├── Layout/              # Layout components
│   ├── Header.tsx           # Navigation header
│   ├── Footer.tsx           # Application footer
│   └── Layout.tsx           # Main layout wrapper
├── Page/                # Page components
│   ├── Auth/               # Authentication pages
│   │   ├── Login.tsx           # Login form
│   │   └── Register.tsx        # Registration form
│   ├── Siswa/              # Student pages
│   │   ├── Dashboard.tsx       # Student dashboard
│   │   ├── Todo/              # Task management
│   │   ├── Absensi/           # Attendance system
│   │   ├── Chat/              # Chat interface
│   │   └── Report.tsx         # Student reports
│   ├── Mentor/              # Mentor pages
│   │   ├── Dashboard.tsx       # Mentor dashboard
│   │   ├── Tugas/             # Task management
│   │   ├── Absensi/           # Attendance monitoring
│   │   └── Rekap/             # Student reports
│   ├── Guru/                # Teacher pages
│   │   ├── Dashboard.tsx       # Teacher dashboard
│   │   ├── Tugas/             # Task review
│   │   ├── Absensi/           # Attendance monitoring
│   │   └── Rekap/             # Student evaluation
│   ├── SuperAdmin/          # Admin pages
│   │   ├── Dashboard.tsx       # Admin dashboard
│   │   ├── User Management/    # User CRUD
│   │   ├── Data Tugas.tsx      # Task overview
│   │   ├── Data Absensi.tsx    # Attendance overview
│   │   └── Institusi/          # Institution management
│   ├── GoogleCallback.tsx     # Google OAuth callback
│   ├── AuthError.tsx          # Auth error page
│   └── LoadingRole.tsx        # Role loading page
├── services/            # API services
│   └── api.ts               # Axios configuration & API calls
├── App.tsx              # Main application component
├── App.css              # Global styles
├── index.tsx            # Application entry point
└── index.css            # Global CSS
```

### Komponen Utama

#### 1. **ProtectedRoute Component**
- Melindungi route berdasarkan role pengguna
- Auto-redirect ke dashboard yang sesuai jika role tidak cocok
- Menyimpan last valid page untuk setiap role

#### 2. **Layout System**
- Header dengan navigasi dan user profile dropdown
- Sidebar navigasi berdasarkan role
- Footer dengan informasi aplikasi
- Responsive design untuk semua device

#### 3. **API Service Layer**
- Centralized API configuration dengan Axios
- Request/Response interceptors untuk token management
- Error handling untuk semua API calls
- Type-safe API functions

#### 4. **State Management**
- Local Storage untuk authentication state
- Context API untuk global state (jika diperlukan)
- Component-level state untuk UI interactions

## 🔐 Sistem Autentikasi & Keamanan

### Authentication Flow
1. **Login Form**: Email/password atau Google OAuth
2. **Token Storage**: JWT token disimpan di localStorage
3. **Role-based Redirect**: Redirect ke dashboard sesuai role
4. **Protected Routes**: Setiap route dilindungi berdasarkan role
5. **Auto-logout**: Token expired atau invalid akan logout otomatis

### Security Features
- **JWT Token Authentication**: Secure token-based auth
- **Role-based Access Control**: Fine-grained permission system
- **Route Protection**: ProtectedRoute component untuk security
- **Input Validation**: Client dan server-side validation
- **Error Handling**: Comprehensive error handling
- **XSS Protection**: Sanitized input dan output

### User Roles & Permissions
- **Superadmin**: Full access ke semua fitur
- **Mentor**: Manage tasks, monitor attendance, chat
- **Guru**: Review tasks, monitor students, chat
- **Siswa**: Submit tasks, attendance, reports, chat

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

## 🚀 Instalasi & Konfigurasi

### Prerequisites
- **Node.js** (versi 16.0 atau lebih baru)
- **npm** atau **yarn** package manager
- **Backend API** yang berjalan di `http://localhost:3000`

### Langkah Instalasi

#### 1. Clone Repository
```bash
git clone https://github.com/DAFAAHMADFAHRISI/Silang-Frontend.git
cd Silang-Frontend
```

#### 2. Install Dependencies
```bash
npm install
# atau
yarn install
```

#### 3. Environment Configuration
Buat file `.env` di root directory:
```env
REACT_APP_API_URL=http://localhost:3000
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
REACT_APP_GOOGLE_REDIRECT_URI=http://localhost:3333/google-callback
```

#### 4. Start Development Server
```bash
npm start
# atau
yarn start
```
Aplikasi akan berjalan di `http://localhost:3333`

#### 5. Build untuk Production
```bash
npm run build
# atau
yarn build
```

### Konfigurasi Tailwind CSS
Tailwind CSS sudah dikonfigurasi dengan custom theme:
- Custom color palette untuk gray scale
- Extended spacing dan font sizes
- Responsive breakpoints (xs, sm, md, lg, xl, 2xl)
- PostCSS configuration untuk optimal build

### Konfigurasi API
API service dikonfigurasi di `src/services/api.ts`:
- Base URL: `http://localhost:3000` (dapat diubah via environment variable)
- Timeout: 10 detik
- Automatic token injection untuk authenticated requests
- Global error handling untuk 401, 403, 404, 500 errors

## 📡 API Integration

### Endpoints yang Digunakan

#### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/google/callback` - Google OAuth callback
- `POST /api/auth/forgot-password` - Forgot password
- `POST /api/auth/reset-password` - Reset password

#### Data Endpoints
- `GET /users` - Get users list (Superadmin)
- `POST /users` - Create new user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user
- `GET /institutions` - Get institutions
- `GET /tasks` - Get tasks
- `GET /attendance` - Get attendance data
- `GET /reports` - Get reports

### Error Handling
- **401 Unauthorized**: Auto-redirect ke login page
- **403 Forbidden**: Show access denied message
- **404 Not Found**: Show not found message
- **500 Server Error**: Show server error message
- **Network Error**: Show connection error message

### Request/Response Interceptors
- **Request Interceptor**: Menambahkan Authorization header dengan JWT token
- **Response Interceptor**: Menangani error responses dan auto-logout jika token expired

## 🎯 Scripts yang Tersedia

### Development Scripts
```bash
npm start          # Start development server di port 3333
npm run dev        # Alias untuk npm start
npm run build      # Build aplikasi untuk production
npm test           # Run test suite
npm run eject      # Eject dari Create React App (tidak disarankan)
```

### Port Configuration
- **Development**: Port 3333 (dapat diubah di package.json)
- **Backend API**: Port 3000 (proxy configuration)
- **Production**: Port sesuai konfigurasi server

## 🔧 Development Guidelines

### Code Structure
- **Components**: Functional components dengan TypeScript
- **Hooks**: Custom hooks untuk reusable logic
- **Services**: Centralized API calls
- **Types**: TypeScript interfaces untuk type safety
- **Styling**: Tailwind CSS dengan utility-first approach

### Best Practices
- **Component Naming**: PascalCase untuk components
- **File Naming**: PascalCase untuk component files
- **Folder Structure**: Organized by feature/role
- **Error Handling**: Try-catch blocks dan error boundaries
- **Loading States**: Loading indicators untuk better UX
- **Form Validation**: Client-side validation dengan feedback

### State Management
- **Local State**: useState untuk component state
- **Global State**: localStorage untuk auth state
- **API State**: Axios interceptors untuk global API state
- **Form State**: Controlled components dengan validation

## 🚀 Deployment

### Production Build
```bash
npm run build
```
Build files akan tersedia di folder `build/`

### Environment Variables
```env
REACT_APP_API_URL=https://your-api-domain.com
REACT_APP_GOOGLE_CLIENT_ID=your_production_google_client_id
REACT_APP_GOOGLE_REDIRECT_URI=https://your-domain.com/google-callback
```

### Server Configuration
- **Static Files**: Serve files dari folder `build/`
- **SPA Routing**: Configure server untuk redirect semua routes ke `index.html`
- **HTTPS**: Gunakan HTTPS untuk production
- **CORS**: Configure CORS untuk API integration

## 🐛 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Kill process di port 3333
npx kill-port 3333
# atau
netstat -ano | findstr :3333
taskkill /PID <PID_NUMBER> /F
```

#### 2. API Connection Error
- Pastikan backend API berjalan di `http://localhost:3000`
- Check network connectivity
- Verify API endpoints dan CORS configuration

#### 3. Google OAuth Error
- Verify Google Client ID configuration
- Check redirect URI configuration
- Ensure domain terdaftar di Google Console

#### 4. Build Errors
```bash
# Clear cache dan reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Performance Optimization
- **Code Splitting**: Lazy loading untuk components
- **Bundle Analysis**: Analyze bundle size dengan webpack-bundle-analyzer
- **Image Optimization**: Optimize images sebelum upload
- **Caching**: Implement proper caching strategy

## 📝 Contributing

### Development Workflow
1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

### Code Standards
- **ESLint**: Follow ESLint configuration
- **Prettier**: Use Prettier untuk code formatting
- **TypeScript**: Strict type checking enabled
- **Testing**: Write tests untuk new features

## 📄 License

Distributed under the ISC License. See `LICENSE` for more information.

## 👥 Authors

- **Dafa Ahmad Fahrisi** - *Initial work* - [DAFAAHMADFAHRISI](https://github.com/DAFAAHMADFAHRISI)

## 🙏 Acknowledgments

- Backend API team untuk integration support
- UI/UX design inspiration
- Open source libraries yang digunakan
- Community support dan feedback

---

**SILANG Frontend** - Sistem Informasi Laporan Magang yang modern dan user-friendly! 🚀
