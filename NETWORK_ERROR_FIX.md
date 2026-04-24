# Fix Network Error - Login Issue

## 🔴 Masalah
Network Error saat login - tidak dapat terhubung ke backend server.

## ✅ Perbaikan yang Dilakukan

### 1. **Error Handling di API Client** (`lib/api.js`)
- ✅ Ditambahkan timeout (10 detik)
- ✅ Better error handling untuk network errors
- ✅ Deteksi ECONNREFUSED, ERR_NETWORK
- ✅ Logging yang lebih detail

### 2. **Error Handling di AuthContext** (`contexts/AuthContext.jsx`)
- ✅ Deteksi network errors dengan lebih baik
- ✅ Pesan error yang lebih informatif
- ✅ Handle timeout errors
- ✅ Handle berbagai HTTP status codes

### 3. **Error Handling di Login Page** (`app/login/page.jsx`)
- ✅ Tampilkan error message yang lebih jelas

## 🔧 Cara Memperbaiki

### Langkah 1: Pastikan Backend Berjalan

1. **Buka terminal baru** dan jalankan:
```bash
cd gotravel-backend
php artisan serve
```

2. **Pastikan server berjalan di** `http://localhost:8000`
   - Anda akan melihat: "Server started on http://127.0.0.1:8000"

3. **Test backend dengan browser**:
   - Buka: `http://localhost:8000/api/auth/login`
   - Harus muncul error (karena tidak ada POST data), tapi artinya backend berjalan

### Langkah 2: Pastikan Frontend URL Benar

1. **Buat file `.env.local`** di folder `gotravel-frontend/`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_STORAGE_URL=http://localhost:8000/storage
```

2. **Restart frontend** setelah membuat `.env.local`:
```bash
cd gotravel-frontend
# Stop server (Ctrl+C)
npm run dev
```

### Langkah 3: Clear Browser Cache

1. Clear localStorage:
   - Buka Developer Tools (F12)
   - Application tab → Local Storage
   - Clear semua data

2. Hard refresh browser:
   - Windows/Linux: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

## 🐛 Troubleshooting

### Error: "Tidak dapat terhubung ke server"

**Penyebab**: Backend tidak berjalan

**Solusi**:
1. Pastikan backend server berjalan:
   ```bash
   cd gotravel-backend
   php artisan serve
   ```

2. Test dengan curl:
   ```bash
   curl http://localhost:8000/api/auth/login -X POST -H "Content-Type: application/json" -d "{\"email\":\"test@test.com\",\"password\":\"test\"}"
   ```

3. Jika curl tidak ada, test dengan browser:
   - Buka: `http://localhost:8000/api/auth/login`
   - Harus ada response (bukan "This site can't be reached")

### Error: "CORS policy"

**Penyebab**: CORS tidak dikonfigurasi dengan benar

**Solusi**:
1. Pastikan `config/cors.php` ada
2. Clear config cache:
   ```bash
   cd gotravel-backend
   php artisan config:clear
   php artisan cache:clear
   ```
3. Restart backend server

### Error: "Connection refused"

**Penyebab**: Port 8000 sudah digunakan atau backend tidak running

**Solusi**:
1. Cek port 8000:
   ```bash
   # Windows
   netstat -ano | findstr :8000
   
   # Linux/Mac
   lsof -i :8000
   ```

2. Jika port sudah digunakan, gunakan port lain:
   ```bash
   php artisan serve --port=8001
   ```

3. Update `.env.local` di frontend:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8001/api
   ```

### Error: Timeout

**Penyebab**: Server terlalu lama merespons

**Solusi**:
1. Cek apakah backend masih running
2. Cek Laravel log untuk error:
   ```bash
   cd gotravel-backend
   tail -f storage/logs/laravel.log
   ```

## 📝 Checklist

Sebelum test login, pastikan:

- [ ] Backend server berjalan (`php artisan serve`)
- [ ] Backend accessible di `http://localhost:8000`
- [ ] File `.env.local` ada di frontend dengan `NEXT_PUBLIC_API_URL=http://localhost:8000/api`
- [ ] Frontend server sudah restart setelah membuat `.env.local`
- [ ] Browser cache sudah di-clear
- [ ] localStorage sudah di-clear

## 🔍 Debug Steps

1. **Buka Browser Console** (F12 → Console tab)
   - Lihat log "Attempting login to: http://localhost:8000/api/auth/login"

2. **Buka Network Tab** (F12 → Network tab)
   - Lihat request ke `/auth/login`
   - Cek status code
   - Cek response body

3. **Cek Backend Logs**:
   ```bash
   cd gotravel-backend
   tail -f storage/logs/laravel.log
   ```

4. **Test API Langsung**:
   ```bash
   curl -X POST http://localhost:8000/api/auth/login \
     -H "Content-Type: application/json" \
     -H "Accept: application/json" \
     -d "{\"email\":\"user@example.com\",\"password\":\"password123\"}"
   ```

## ✅ Expected Response

Jika backend berjalan dengan benar, response seharusnya:
```json
{
  "success": true,
  "message": "Login berhasil",
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "expires_in": 60,
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "role": "user",
    ...
  }
}
```

---

**Status**: ✅ Error handling sudah diperbaiki. Pastikan backend berjalan sebelum test login.

