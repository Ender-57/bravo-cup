# Badminton Biro Advokasi Cup (Bravo Cup) 🏸

Aplikasi pengelolaan turnamen badminton sistem skor maksimal 30 poin, lengkap dengan:
- **Tabel Peringkat (Klasemen)** Ganda Putra (MD) & Ganda Putri (WD)
- **Jadwal & Skor Langsung (LIVE)**
- **Riwayat Pertandingan** dengan share WhatsApp
- **Real-time Database Cloud Firestore** (Sinkronisasi langsung antar perangkat)
- **Admin PIN Auth** untuk wasit/panitia (Default PIN: `1234`)

---

## 🚀 Panduan Deploy ke GitHub & Vercel

### Langkah 1: Push ke GitHub Repository

1. **Buka terminal lokal di folder proyek Anda** (setelah mengunduh/clone proyek ini).
2. **Inisialisasi Git & Tambahkan Remote**:
   ```bash
   git init
   git add .
   git commit -m "feat: initial commit Bravo Cup dengan integrasi Firestore"
   ```
3. **Buat repository baru di [GitHub](https://github.com/new)** (misal bernama `bravo-cup`).
4. **Hubungkan dan Push ke GitHub**:
   ```bash
   git remote add origin https://github.com/USERNAME_ANDA/bravo-cup.git
   git branch -M main
   git push -u origin main
   ```

---

### Langkah 2: Deploy ke Vercel

1. Buka [Vercel](https://vercel.com) dan login dengan akun GitHub Anda.
2. Klik tombol **"Add New..."** lalu pilih **"Project"**.
3. Pilih repository **`bravo-cup`** yang baru saja di-push dan klik **"Import"**.
4. Pastikan **Framework Preset** terpilih sebagai **Vite**.
5. Klik **"Deploy"**.
6. Dalam ~1 menit, aplikasi Anda akan live di domain gratis Vercel (misal: `https://bravo-cup.vercel.app`)!

---

## 🛠️ Pengembangan Lokal

```bash
# Install dependencies
npm install

# Jalankan server lokal
npm run dev

# Build untuk produksi
npm run build
```
