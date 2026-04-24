# Update Seeder - Data Dummy Baru

## ✅ Perubahan yang Dilakukan

### 1. **TravelSeeder - Data Travel Lebih Lengkap**

**Sebelumnya**: 6 rute travel  
**Sekarang**: 17 rute travel dengan variasi lebih banyak

#### Tambahan Rute Baru:
- **Jaya Travel**: 
  - Jakarta → Yogyakarta (8 jam)
  - Jakarta → Surabaya (12 jam, malam)
  
- **Mitra Jaya**:
  - Jakarta → Bandung (siang, 14:00)
  
- **Ekspres Utama**:
  - Surabaya → Malang (sore, 13:00)
  - Malang → Surabaya (pagi, 08:00) - return route
  
- **Nyaman Travel**:
  - Yogyakarta → Solo (siang, 14:00)
  - Solo → Yogyakarta (pagi, 09:00) - return route
  
- **Aman Jaya**:
  - Medan → Berastagi (2.5 jam)
  
- **Cepat Jaya**:
  - Bandung → Cirebon (2.5 jam)
  - Bandung → Jakarta (sore, return route)

#### Fitur Data:
- ✅ Variasi waktu keberangkatan (pagi, siang, sore, malam)
- ✅ Return routes (perjalanan bolak-balik)
- ✅ Variasi available_seats (ada yang sudah terisi sebagian)
- ✅ Contoh travel tidak aktif (`is_active = false`)
- ✅ Fasilitas lengkap dengan JSON format
- ✅ Rating dan reviews_count yang realistis

### 2. **UserSeeder - Lebih Banyak Sample Users**

**Sebelumnya**: 2 users  
**Sekarang**: 6 users

#### Tambahan Users:
- Ahmad Fauzi (Jakarta)
- Siti Rahayu (Surabaya)
- Budi Santoso (Yogyakarta)
- Dewi Lestari (Bandung)

**Total Users**: 
- 1 Admin
- 7 Agents (6 verified + 1 pending)
- 6 Regular Users

### 3. **BookingSeeder - Baru!**

Seeder baru untuk membuat data booking dummy.

#### Fitur:
- ✅ Membuat booking dari users yang ada
- ✅ Menggunakan travels yang aktif
- ✅ Variasi status: pending, confirmed, completed
- ✅ Auto-update available_seats di travel
- ✅ Payment status sesuai dengan booking status
- ✅ Random travel date (1-30 hari ke depan)
- ✅ Random quantity (1-3 penumpang)

### 4. **ReviewSeeder - Baru!**

Seeder baru untuk membuat data review dummy.

#### Fitur:
- ✅ Membuat review hanya untuk completed bookings
- ✅ Rating 4-5 (mostly positive)
- ✅ Comment yang realistis dan bervariasi
- ✅ Auto-update travel rating setelah review dibuat
- ✅ One review per booking (unique constraint)

## 📊 Statistik Data Dummy

Setelah menjalankan semua seeders, akan tersedia:

- **Users**: 14 total
  - 1 Admin
  - 7 Agents (6 verified, 1 pending)
  - 6 Regular Users

- **Travels**: 17 rute
  - 16 Active travels
  - 1 Inactive travel (untuk testing)
  - Multiple routes per agent
  - Variasi waktu dan harga

- **Bookings**: ~5 bookings
  - Berbagai status (pending, confirmed, completed)
  - Terhubung dengan users dan travels yang ada

- **Reviews**: ~10 reviews (jika ada completed bookings)
  - Rating 4-5
  - Comments yang realistis
  - Auto-update travel rating

## 🚀 Cara Menjalankan

```bash
cd gotravel-backend

# Fresh migration dan seed semua data
php artisan migrate:fresh --seed

# Atau hanya seed (jika migration sudah jalan)
php artisan db:seed

# Atau seed specific seeder
php artisan db:seed --class=TravelSeeder
php artisan db:seed --class=BookingSeeder
php artisan db:seed --class=ReviewSeeder
```

## 📝 Catatan Penting

1. **Urutan Seeder**: 
   - UserSeeder → TravelSeeder → BookingSeeder → ReviewSeeder
   - BookingSeeder membutuhkan Users dan Travels
   - ReviewSeeder membutuhkan Completed Bookings

2. **Booking Status**:
   - Jika ingin membuat reviews, pastikan ada bookings dengan status `completed`
   - ReviewSeeder hanya akan membuat review untuk completed bookings

3. **Travel Rating**:
   - Rating travel akan otomatis ter-update setelah review dibuat
   - Menggunakan average dari semua reviews

4. **Available Seats**:
   - BookingSeeder akan mengurangi available_seats di travel
   - Pastikan travel punya available_seats > 0 untuk booking

## 🔑 Test Credentials

### Admin
- Email: `admin@maytravel.com`
- Password: `password123`

### Agents (Verified)
- Jaya Travel: `jaya.travel@example.com` / `password123`
- Mitra Jaya: `mitra.jaya@example.com` / `password123`
- Ekspres Utama: `ekspres.utama@example.com` / `password123`
- Nyaman Travel: `nyaman.travel@example.com` / `password123`
- Aman Jaya: `aman.jaya@example.com` / `password123`
- Cepat Jaya: `cepat.jaya@example.com` / `password123`

### Users
- User 1: `user@example.com` / `password123`
- User 2: `jane@example.com` / `password123`
- User 3: `ahmad@example.com` / `password123`
- User 4: `siti@example.com` / `password123`
- User 5: `budi.user@example.com` / `password123`
- User 6: `dewi@example.com` / `password123`

---

**Status**: ✅ Semua seeders sudah diperbarui dan siap digunakan!

