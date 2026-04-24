# GoTravel

GoTravel adalah aplikasi web untuk pemesanan travel.  
Project ini terdiri dari:
- `gotravel-backend` (API Laravel)
- `gotravel-frontend` (Web Next.js)

## Deskripsi Singkat

GoTravel digunakan untuk:
- mencari jadwal travel,
- melakukan pemesanan kursi,
- mengelola data travel,
- memantau transaksi melalui dashboard.

Sistem memiliki 3 peran utama:
- **User**: mencari dan memesan travel.
- **Agent**: mengelola travel dan booking.
- **Admin**: mengelola data utama aplikasi.

## Fitur Dasar

- Login dan registrasi.
- Daftar dan detail travel.
- Booking travel.
- Riwayat booking.
- Dashboard sesuai role (user/agent/admin).

## Struktur Project

```text
gotravel/
├── gotravel-backend/
└── gotravel-frontend/
```

## Cara Menjalankan (Lokal)

### 1. Jalankan Backend

```bash
cd gotravel-backend
composer install
php artisan serve
```

Backend berjalan di `http://localhost:8000`

### 2. Jalankan Frontend

Buka terminal baru:

```bash
cd gotravel-frontend
npm install
npm run dev
```

Frontend berjalan di `http://localhost:3000`

