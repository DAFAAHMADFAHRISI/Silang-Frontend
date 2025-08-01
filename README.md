# SILANG - Sistem Informasi Layanan Magang

Aplikasi web untuk mengelola sistem magang dengan fitur responsive design yang optimal untuk semua ukuran layar.

## 🚀 Fitur Responsive Design

### Breakpoints yang Didukung
- **Mobile**: < 640px (sm)
- **Tablet**: 640px - 1024px (sm, md, lg)
- **Desktop**: > 1024px (lg, xl, 2xl)

### Komponen Responsive
1. **Layout & Navigation**
   - Sidebar yang bisa di-toggle di mobile
   - Header dengan hamburger menu untuk mobile
   - Menu yang menyesuaikan ukuran layar

2. **Halaman Login & Register**
   - Form yang responsive dengan padding yang menyesuaikan
   - Input fields dengan ukuran yang optimal untuk touch
   - Button yang mudah diakses di mobile

3. **Dashboard**
   - Grid layout yang menyesuaikan jumlah kolom
   - Card components dengan padding yang responsive
   - Statistik yang mudah dibaca di semua ukuran

4. **Tabel & Data**
   - Tabel dengan horizontal scroll di mobile
   - Pagination yang responsive
   - Search dan filter yang mudah digunakan

5. **Komponen UI**
   - Text size yang menyesuaikan ukuran layar
   - Icon yang proporsional
   - Spacing yang konsisten

## 🛠️ Teknologi

- **React 18** dengan TypeScript
- **Tailwind CSS** untuk styling
- **React Router** untuk navigation
- **Lucide React** untuk icons
- **Headless UI** untuk komponen interaktif

## 📱 Responsive Features

### Mobile-First Approach
- Semua komponen dirancang dengan mobile-first approach
- Touch-friendly interface
- Optimal performance di perangkat mobile

### Adaptive Layout
- Sidebar yang bisa disembunyikan di mobile
- Grid yang menyesuaikan jumlah kolom
- Text yang readable di semua ukuran

### Performance
- Lazy loading untuk komponen besar
- Optimized images dan assets
- Smooth transitions dan animations

## 🎨 Design System

### Colors
- Primary: Blue gradient (#3B82F6 to #8B5CF6)
- Background: Dark gray (#111827)
- Text: White dan gray variants
- Accent: Green, Red, Yellow untuk status

### Typography
- Mobile: 12px - 16px
- Tablet: 14px - 18px  
- Desktop: 16px - 24px

### Spacing
- Mobile: 4px - 16px
- Tablet: 8px - 24px
- Desktop: 12px - 32px

## 🚀 Cara Menjalankan

```bash
# Install dependencies
npm install

# Run development server
npm start

# Build for production
npm run build
```

## 📋 Struktur Responsive

```
src/
├── Layout/
│   ├── Layout.tsx      # Responsive layout dengan sidebar
│   ├── Header.tsx      # Header dengan mobile menu
│   └── Footer.tsx      # Footer responsive
├── Page/
│   ├── Login.tsx       # Form responsive
│   ├── Register.tsx    # Form responsive
│   └── Siswa/
│       ├── Dashboard.tsx   # Grid responsive
│       ├── Todo.tsx        # Card responsive
│       ├── Attendance.tsx  # Table responsive
│       └── Report.tsx      # Card responsive
└── index.css          # Global responsive styles
```

## 🔧 Customization

### Menambah Breakpoint Baru
```javascript
// tailwind.config.js
screens: {
  'xs': '475px',
  'sm': '640px',
  'md': '768px',
  'lg': '1024px',
  'xl': '1280px',
  '2xl': '1536px',
}
```

### Responsive Classes
```jsx
// Mobile first approach
className="text-sm sm:text-base lg:text-lg"
className="p-4 sm:p-6 lg:p-8"
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
```

## 📱 Testing Responsive

1. **Browser DevTools**
   - Gunakan device toolbar
   - Test di berbagai ukuran layar

2. **Real Devices**
   - Test di smartphone
   - Test di tablet
   - Test di desktop

3. **Performance**
   - Lighthouse audit
   - Core Web Vitals
   - Mobile performance

## 🎯 Best Practices

1. **Mobile-First**: Mulai dari mobile, lalu scale up
2. **Touch-Friendly**: Minimal 44px untuk touch targets
3. **Readable Text**: Minimal 12px untuk mobile
4. **Fast Loading**: Optimize images dan assets
5. **Accessible**: Support screen readers dan keyboard navigation

## 📄 License

MIT License - lihat file LICENSE untuk detail.
