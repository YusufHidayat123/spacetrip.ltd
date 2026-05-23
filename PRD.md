# PRD — Spacetrip (Website Jual Pakaian)

## 1) Ringkasan Produk
**Nama produk:** Spacetrip  
**Tipe:** Website e-commerce pakaian  
**Kategori produk:** kaos, celana, jeans, topi, sepatu (bisa berkembang)

**Masalah yang diselesaikan:**
- Pembeli butuh pengalaman belanja yang cepat, jelas, dan mudah (browse → cart → checkout).
- Penjual/owner butuh cara mengelola katalog (produk & kategori) dengan sederhana.

**Solusi:**
Platform e-commerce sederhana dengan:
- Katalog produk + pencarian/filter dasar
- Akun pembeli
- Akun penjual (panel sederhana untuk tambah/edit produk & kategori)
- Keranjang (cart) dan proses checkout (tanpa payment gateway untuk sekarang)

---

## 2) Tujuan (Goals) & Non-Goals
### Goals (MVP)
1. Pembeli bisa melihat produk, detail produk, menambahkan ke cart, dan checkout (membuat pesanan).
2. Pembeli bisa login/register dan melihat riwayat pesanan.
3. Penjual bisa login dan mengelola kategori & produk (CRUD minimal).
4. Sistem punya struktur data rapi di Supabase dan siap berkembang untuk pembayaran nanti.

### Non-Goals (fase ini)
- Payment gateway (QRIS/VA/CC) + verifikasi pembayaran otomatis.
- Multi-vendor marketplace kompleks (komisi, payout, dll).
- Fitur promosi advanced (voucher, membership, rekomendasi).
- Manajemen gudang kompleks (multi-warehouse, forecasting).

---

## 3) Target User & Roles
### Role 1: Pembeli (Customer)
- Browse produk
- Add to cart
- Checkout (membuat order)
- Lihat order status dan detail

### Role 2: Penjual (Seller / Admin toko)
- Login khusus seller
- Kelola kategori
- Kelola produk (tambah/edit/hapus, stok, harga, foto)

> Catatan: untuk sederhana, **Seller = Admin toko** (satu toko). Nanti kalau mau multi-seller bisa diekspansi.

---

## 4) Scope Fitur (MVP)
### A. Katalog & Produk
**Halaman:**
- Home (highlight kategori / produk terbaru)
- Product listing (grid)
- Product detail

**Kemampuan:**
- Browse berdasarkan kategori
- Search sederhana (nama produk)
- Tampilkan: nama, harga, foto, ukuran/varian (opsional untuk MVP), stok

**Acceptance criteria:**
- Pengguna bisa membuka detail produk dari listing.
- Jika stok habis, tombol “Add to Cart” nonaktif.

---

### B. Auth: Login Pembeli & Login Penjual
**Customer auth:**
- Register, Login, Logout
- Minimal: email + password

**Seller auth:**
- Login terpisah (mis. halaman `/seller/login`)
- Akses panel seller hanya untuk role seller

**Acceptance criteria:**
- Route seller terproteksi (redirect kalau bukan seller).
- User customer tidak bisa akses fitur add product/category.

---

### C. Cart (Keranjang)
**Fungsi:**
- Add item, update qty, remove item
- Persist cart (pilihan sederhana):
  - Guest cart di localStorage
  - Saat login: opsional untuk MVP (bisa tetap local saja dulu)

**Acceptance criteria:**
- Qty tidak bisa melebihi stok.
- Total harga terhitung benar.

---

### D. Checkout & Order (Tanpa Payment Gateway)
**Proses:**
- Isi data pengiriman (nama, telp, alamat)
- Konfirmasi ringkasan order
- “Place Order” → order tercatat di database

**Status order (sederhana):**
- `pending` (baru dibuat, belum dibayar)
- `confirmed` (manual oleh seller nanti, opsional)
- `shipped` (opsional)
- `cancelled` (opsional)

**Catatan pembayaran:**
- Untuk MVP, setelah place order tampil “Instruksi pembayaran manual” (mis. transfer/QR statis) tanpa otomatisasi.

**Acceptance criteria:**
- Order tersimpan dengan item-itemnya dan total.
- Customer bisa lihat order di halaman “My Orders”.

---

### E. Seller Panel: Add Category & Add Product
**Seller Panel Pages (minimal):**
- Dashboard (ringkasan sederhana)
- Category management (CRUD)
- Product management (CRUD)

**Field kategori:**
- nama
- slug (auto)
- status aktif

**Field produk (MVP):**
- nama produk
- deskripsi
- harga
- kategori
- stok
- status (draft/active)
- foto produk (1–5)

**Acceptance criteria:**
- Seller bisa membuat kategori dan produk baru, muncul di katalog jika status `active`.
- Upload gambar tersimpan di Supabase Storage dan URL tersimpan di DB.

---

## 5) User Stories (ringkas)
### Customer
1. Sebagai customer, saya ingin mencari produk berdasarkan kategori agar cepat menemukan barang.
2. Sebagai customer, saya ingin menambahkan produk ke cart dan mengubah jumlahnya.
3. Sebagai customer, saya ingin checkout dan mendapatkan nomor/order detail.
4. Sebagai customer, saya ingin login dan melihat riwayat pesanan saya.

### Seller
1. Sebagai seller, saya ingin menambah kategori agar produk terorganisir.
2. Sebagai seller, saya ingin menambah produk lengkap dengan foto, harga, dan stok.
3. Sebagai seller, saya ingin menonaktifkan produk (draft/inactive) tanpa menghapus.

---

## 6) Alur Utama (User Flow)
**Customer Flow:**
1. Home → Listing → Detail Produk
2. Add to Cart → Cart → Checkout → Order Created → My Orders

**Seller Flow:**
1. Seller Login → Seller Dashboard
2. Manage Categories → Manage Products

---

## 7) Requirements
### Must Have (MVP)
- Auth customer & seller (role-based access)
- Katalog produk + kategori
- Cart CRUD
- Checkout menghasilkan order
- Seller CRUD kategori & produk
- Upload gambar produk

### Nice to Have (jika sempat)
- Filter harga, sorting (terbaru/termurah)
- Wishlist
- Order status update oleh seller
- Simple banner/hero management

---

## 8) Non-Functional Requirements
- **Performance:** listing cepat (pagination sederhana / limit query)
- **Security:**
  - RLS (Row Level Security) Supabase untuk proteksi data user/order
  - Seller-only untuk operasi admin
- **Reliability:** hindari “double submit” order (disable button + server check)
- **SEO basic:** metadata, URL slug produk/kategori
- **Maintainability:** struktur code jelas (mis. `app/`, `components/`, `lib/`)

---

## 9) Data Model (Supabase) — Sederhana tapi siap scale
Minimal tabel:
- `profiles` (id user, role: customer/seller, name, phone)
- `categories` (id, name, slug, is_active)
- `products` (id, name, slug, description, price, stock, category_id, is_active, created_at)
- `product_images` (id, product_id, url, sort_order)
- `carts` (opsional kalau mau server-side) / atau localStorage untuk MVP
- `orders` (id, user_id, status, total_amount, shipping_address json, created_at)
- `order_items` (id, order_id, product_id, quantity, price_at_purchase)

> Untuk MVP yang simpel: cart bisa **client-side**, tapi `orders` wajib server-side.

---

## 10) Tech Stack & Deployment
- **Frontend:** Next.js (App Router), TypeScript
- **Auth & DB:** Supabase Auth + Postgres + RLS
- **File storage:** Supabase Storage (gambar produk)
- **Deployment:** Vercel
- **Data fetching:** Server Actions atau Route Handlers (pilih satu pendekatan konsisten)

---

## 11) Analytics (minimal)
Event sederhana untuk mengukur funnel:
- `view_product`
- `add_to_cart`
- `begin_checkout`
- `place_order`
- `login` / `register`

KPI MVP:
- Conversion rate: `place_order / add_to_cart`
- Cart abandonment: `begin_checkout` tanpa `place_order`
- Produk paling sering dilihat & ditambahkan ke cart

---

## 12) Milestone (contoh roadmap MVP)
1. Setup proyek & auth (customer + seller role)
2. Katalog + detail produk
3. Cart
4. Checkout → Order
5. Seller panel (kategori + produk + upload image)
6. Hardening: RLS, validation, basic SEO, pagination
7. Deploy Vercel + env config

---

## 13) Open Questions (perlu diputuskan cepat)
1. **Apakah produk punya varian ukuran/warna?** (S/M/L, 42/43, dll)
   - Jika ya, data model stok per-varian (lebih kompleks).
2. **Cart ingin persist lintas device?**
   - Jika ya, simpan cart di DB per user.
3. **Order status siapa yang update?**
   - Untuk MVP bisa manual di panel seller.
4. **Pengiriman:** fixed shipping fee atau dihitung/diinfokan belakangan?
