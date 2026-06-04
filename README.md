# 🌙 Neo Kalender Hijriah Modern

![Neo Kalender Hijriah](https://img.shields.io/badge/Status-Active-brightgreen) ![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black) ![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite&logoColor=white) ![Vitest](https://img.shields.io/badge/Tested_with-Vitest-FCC72C?logo=vitest&logoColor=black)

**Kalender Islami Hijriah** dengan antarmuka modern, estetik, dan informatif. Aplikasi ini dirancang untuk memudahkan umat muslim memantau tanggal Hijriah sekaligus mendapatkan jadwal akurat mengenai puasa sunnah, puasa wajib, dan anjuran amalan ibadah harian beserta dalil hadits pendukungnya.

> 🌐 **Live Demo:** [https://neo-kalender-hijriah.vercel.app](https://neo-kalender-hijriah.vercel.app)

---

## ✨ Fitur Utama

- **Deteksi Hari Waktu Nyata:** Mengambil waktu perangkat pengguna untuk secara otomatis menyorot hari dan tanggal saat ini.
- **Kalkulasi Kalender Hijriah:** Konversi otomatis kalender Gregorian ke kalender Islam (Hijriah) tanpa bergantung pada layanan API eksternal yang lambat.
- **Koreksi Tanggal Hijriah (Manual Adjustment):** Fitur penyesuaian penanggalan Hijriah sebesar -2 hingga +2 hari untuk sinkronisasi dengan hasil rukyatul hilal lokal, tersimpan secara persisten di `localStorage`.
- **Navigasi Cepat Dropdown:** Mempermudah pencarian tanggal dan bulan tertentu melalui dropdown Bulan dan Tahun secara langsung.
- **Widget Jadwal Sholat & Countdown Real-Time:** 
  - Deteksi lokasi otomatis via Geolocation API (dengan fallback Jakarta) untuk mengambil jadwal sholat akurat dari API Aladhan.
  - Menampilkan countdown dinamis (detik demi detik) ke waktu sholat berikutnya.
- **Tracker Amal Harian & Progress Bar:**
  - Sistem checklist amalan harian (shalat fardhu, ibadah sunnah, dan puasa hari berjalan) yang disimpan di `localStorage` per tanggal.
  - Dilengkapi *progress bar* interaktif untuk memantau persentase penyelesaian amalan harian.
- **Navigasi Tab Sidebar:** Desain sidebar baru yang rapi menggunakan sistem tab (**Amalan**, **Sholat**, **Puasa**) untuk menghemat ruang, mencegah scrolling berlebih, dan meningkatkan kejelasan UI.
- **Sel Kalender Persegi & Rapi:** Sel tanggal kalender presisi tinggi (`aspect-ratio: 1`) dengan penempatan rapi tanggal Gregorian dan Hijriah di baris atas sel (`.day-cell-top`).
- **Dilengkapi Dalil:** Setiap rekomendasi ibadah dilengkapi dengan kutipan hadits sahih (Bukhari, Muslim, Tirmidzi, dll).

---

## 🛠️ Tech Stack & Alat Pengembangan

- **Framework:** [React 19](https://react.dev/)
- **Build Tool:** [Vite](https://vitejs.dev/) (Sangat cepat dan ringan)
- **Styling:** Vanilla CSS 3 (CSS Grid, Flexbox, Variables, Glassmorphism UI)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Date Utilities:** [date-fns](https://date-fns.org/)
- **Testing:** [Vitest](https://vitest.dev/) & [Testing Library](https://testing-library.com/)

---

## 💡 Developer Insights & Architecture

Bagi Anda yang ingin berkontribusi atau mempelajari struktur kode aplikasi ini, berikut adalah arsitektur utamanya:

1. **Konversi Penanggalan (`src/utils.js`)**
   Aplikasi menggunakan `Intl.DateTimeFormat` bawaan JavaScript secara internal untuk mendapatkan parameter tanggal Hijriah (`en-US-u-ca-islamic`). Hal ini memastikan akurasi internasional dan menghemat beban karena tidak memerlukan API HTTP untuk memuat penanggalan per harinya.
   
2. **Logika Puasa (`src/data.js`)**
   Setiap jenis ibadah atau puasa bukan hanya sekadar data statis, tetapi memegang fungsi `check(gregorianDate, hijriParts)`. 
   - Fungsi callback ini dipanggil di setiap sel kalender untuk memvalidasi secara *O(1)* apakah suatu hari tertentu disunnahkan berpuasa.
   - Mengadopsi hierarki, contoh: **Puasa Ayyamul Bidh** secara otomatis dinonaktifkan (`return false`) di bulan Ramadhan dan dilarang pada tanggal 13 Dzulhijjah (Hari Tasyrik).

3. **TDD (Test-Driven Development)**
   Kehandalan dari logika penanggalan serta validasi status puasa diuji dengan **Vitest** melalui `utils.test.js` dan `data.test.js`. TDD memastikan tidak ada *regression bugs* saat jadwal atau fungsi utilitas kalender di-update di masa mendatang.

---

## 🚀 Memulai (Getting Started)

Langkah-langkah untuk menjalankan aplikasi secara lokal di perangkat pengembangan Anda:

### 1. Kloning Repositori
```bash
git clone https://github.com/FuzeHere/Neo-Kalender-Hijriah.git
cd Neo-Kalender-Hijriah
```

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Jalankan Mode Pengembangan (Development)
```bash
npm run dev
```
Buka browser dan akses `http://localhost:5173`. Aplikasi akan melakukan _Hot Module Replacement_ (HMR) jika Anda mengubah kode.

### 4. Menjalankan Unit Tests (TDD)
Untuk memverifikasi algoritma kalkulator Hijriah dan fungsi validasi ibadah:
```bash
npm run test
```
*(Atau gunakan `npm run test:watch` untuk terus memonitor file yang berubah selama pengembangan).*

### 5. Build untuk Produksi (Production)
```bash
npm run build
```
Vite akan mem-bundle seluruh aset dan mengoptimalkan output di dalam folder `dist/`, yang sudah siap untuk di-deploy ke hosting seperti **Vercel**, **Netlify**, atau **GitHub Pages**.

---

## 📄 Lisensi
Proyek ini dibuat untuk kebaikan umat. Silakan gunakan, pelajari, dan modifikasi. Semoga bermanfaat!
