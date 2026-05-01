# SIGAPP — School Intervention Gap Prioritization Platform

SIGAPP adalah platform dashboard pemerintah yang dirancang untuk membantu pengambil kebijakan pendidikan dalam memprioritaskan intervensi sekolah di Jakarta. Dengan menggabungkan berbagai aliran data menjadi satu indeks komposit, SIGAPP memberikan kerangka kerja yang objektif, berbasis spasial, dan berorientasi pada kebutuhan untuk alokasi sumber daya.

## 🚀 Fitur Utama

- **Dashboard Utama**: Ringkasan indikator kinerja utama (KPI), distribusi tingkat prioritas, dan daftar 10 sekolah dengan indeks tertinggi.
- **Daftar Sekolah**: Tabel komprehensif seluruh sekolah di Jakarta dengan fitur filter berdasarkan Kecamatan dan Jenjang (SD, SMP, SMA, SMK).
- **Detail Sekolah**: Analisis mendalam per sekolah, termasuk breakdown skor pilar, grafik radar interaktif, dan narasi ringkasan analisis.
- **Insights & Analitik**: Visualisasi data makro untuk melihat performa antar kecamatan dan perbandingan pilar antar jenjang sekolah.
- **Sistem Indeks Komposit**: Perhitungan otomatis berdasarkan 4 pilar utama untuk menentukan tingkat prioritas (CRITICAL, HIGH, MEDIUM, LOW).

## 📊 4 Pilar Utama SIGAPP

Indeks SIGAPP dihitung berdasarkan pembobotan berikut:

1.  **P1: Quality Gap (35%)**: Mengukur kekurangan akademik dan kerentanan sosio-ekonomi (Skor Literasi, Numerasi, Kualitas Guru).
2.  **P2: Spatial Inequity (25%)**: Menilai isolasi geografis dan beban perjalanan siswa (Waktu tempuh, aksesibilitas).
3.  **P3: Structural Risk (25%)**: Menguantifikasi kerusakan infrastruktur fisik dan tren penurunan jumlah siswa.
4.  **P4: Public Signal (15%)**: Menggabungkan keluhan masyarakat dan sentimen publik terhadap fasilitas sekolah.

## 🛠️ Teknologi

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Bahasa**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **Font**: Inter (Google Fonts)

## 📦 Instalasi & Penggunaan

1. **Clone repository:**
   ```bash
   git clone https://github.com/zakiulfahmijailani/SIGAPP.git
   cd SIGAPP
   ```

2. **Instal dependensi:**
   ```bash
   npm install
   ```

3. **Konfigurasi Environment Variables:**
   Buat file `.env.local` di direktori root dan masukkan kredensial Supabase Anda:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Jalankan server pengembangan:**
   ```bash
   npm run dev
   ```
   Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

## 📂 Struktur Folder

- `src/app/`: Routing dan halaman aplikasi.
- `src/components/`: Komponen UI yang reusable (Badge, Sidebar, Skeleton, dll).
- `src/lib/`: Konfigurasi Supabase, definisi tipe TypeScript, dan fungsi utilitas.
- `public/`: Aset statis.

---
**SIGAPP MVP v0.1** · Jakarta · 2025
*Dikembangkan untuk efisiensi alokasi intervensi pendidikan yang lebih tepat sasaran.*
