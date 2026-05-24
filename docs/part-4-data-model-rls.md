# Part 4 — Data Model + RLS (Supabase) — Spacetrip

Dokumen ini adalah **spesifikasi final** untuk “Part 4” (Data Model + Row Level Security) yang mengunci arah implementasi Supabase agar:

- Customer **login pakai Supabase Auth (Google)**
- Customer hanya bisa mengakses data miliknya (profile + orders)
- Checkout tetap **atomic** (reserve stock + create order) via **RPC**
- Admin tetap bisa full-access via **service role** (sesuai pola MVP saat ini)

> Konteks codebase saat dokumen ini dibuat:
> - Schema katalog ada di `supabase/schema.sql`
> - RLS katalog ada di `supabase/rls.sql` (public read untuk active items)
> - Orders + RPC atomic stock ada di `supabase/orders.sql`
> - Orders RLS enable saja (tanpa policy) di `supabase/orders_rls.sql`
> - App saat ini memakai **service role** untuk checkout & payment proof (`lib/orders/public.ts`) dan “login gate” via cookie (`lib/supabase/auth.ts`).

---

## 0) Target UX / Rules yang harus terpenuhi

### Guest (anon)
- Bisa browse katalog (categories/products/variants/images)
- Tidak bisa melihat orders
- Tidak bisa membuat order

### Logged-in customer (authenticated)
- Bisa melihat & mengubah **profil sendiri**
- Bisa checkout **hanya untuk dirinya**
- Bisa melihat **orders miliknya** (+ order items + payment proofs)
- Bisa upload payment proof untuk **order miliknya**

### Admin
- Admin UI berjalan server-side dan menggunakan `SUPABASE_SERVICE_ROLE_KEY`
- Admin tetap bisa CRUD katalog, verifikasi pembayaran, dan lihat semua order

---

## 1) Data Model (schema) — final

### 1.1 `profiles` (wajib)
Tabel ini menjadi sumber data customer: nama, telp, alamat. Ini juga dasar untuk “profile completion” sebelum checkout.

**Table**: `public.profiles`

| Column | Type | Notes |
|---|---:|---|
| `id` | uuid | **PK**. FK ke `auth.users(id)` (1:1) |
| `role` | text | default `customer` (opsional untuk future role-based admin) |
| `full_name` | text | boleh null untuk onboarding |
| `phone` | text | boleh null; simpan raw user input |
| `shipping_address` | jsonb | format minimal `{ line1, city, province, postal_code }` |
| `created_at` | timestamptz | default now() |
| `updated_at` | timestamptz | default now(); update via trigger |

**Constraints**
- `role` check: `('customer','seller','admin')` (opsional, tapi direkomendasikan agar jelas)

**Index**
- PK sudah cukup untuk MVP. Jika nanti sering query by phone, baru tambah index.

**Trigger**
- Reuse `public.set_updated_at()` (sudah ada di `schema.sql`).

**Auto-provisioning profile**
- Buat trigger pada `auth.users`:
  - `after insert on auth.users` → insert `public.profiles(id)`

> Catatan: menggunakan trigger ini membuat `profiles` tidak perlu policy `INSERT` untuk user.

---

### 1.2 `orders` — tambah owner (`user_id`)
Saat ini `orders` belum punya ownership; ini membuat “My Orders” tidak bisa aman.

**Add column**: `public.orders.user_id uuid` (nullable pada fase migrasi)

| Column | Type | Notes |
|---|---:|---|
| `user_id` | uuid | FK `auth.users(id)`; owner customer |

**FK behavior**
- `on delete set null` direkomendasikan agar histori admin tetap ada jika user dihapus.

**Future tightening (setelah migrasi stabil)**
- Setelah semua order baru selalu punya `user_id`, kolom ini bisa dibuat `not null`.

---

### 1.3 `order_items`
Tidak perlu perubahan schema untuk ownership. Ownership didapat via join ke `orders.user_id`.

---

### 1.4 `order_payment_proofs`
Tidak perlu perubahan schema untuk ownership (cukup join `orders.user_id`).

**Opsional (nice-to-have)**
- Tambah kolom `user_id` untuk mempercepat filter dan mencegah join; diisi via trigger dari `orders.user_id`.

---

### 1.5 `store_settings` (wajib untuk QRIS dinamis)
Di code sudah ada query `store_settings` (`lib/settings/admin.ts`), tapi table belum ada di `supabase/*.sql`.

**Table**: `public.store_settings`

| Column | Type | Notes |
|---|---:|---|
| `id` | uuid | PK default gen_random_uuid() |
| `store_name` | text | default `Spacetrip` |
| `payment_instructions` | text | boleh null |
| `qris_image_url` | text | boleh null; sesuai implementasi code saat ini |
| `updated_at` | timestamptz | default now(); update via trigger atau “insert new row” |

**Strategy penyimpanan**
- Simpel (sesuai code): setiap update settings → insert row baru; query ambil row terbaru `order(updated_at desc).limit(1)`.

**Alternatif lebih rapi (opsional)**
- Ganti `qris_image_url` menjadi `qris_storage_path` (Supabase Storage) dan generate URL via server.

---

## 2) RLS (Row Level Security) — final

### 2.1 Prinsip
- Katalog: tetap public-read untuk barang active (sudah ada di `supabase/rls.sql`).
- Data customer (profiles, orders, items, proofs): **authenticated-only dan per-user**.
- Write path untuk checkout & payment proof sebaiknya lewat **RPC** (lebih aman dan sederhana daripada memberi policy UPDATE/INSERT ke tabel-tabel sensitif).


### 2.2 `profiles` policies
Enable RLS.

- `SELECT` untuk `authenticated`: `id = auth.uid()`
- `UPDATE` untuk `authenticated`: `id = auth.uid()`
- `INSERT`: tidak perlu (dibuat oleh trigger dari `auth.users`)

Pseudo:
- using: `id = auth.uid()`
- with check: `id = auth.uid()`


### 2.3 `orders` policies
Enable RLS.

**Read**
- `SELECT` untuk `authenticated`:
  - using: `user_id = auth.uid()`

**Write**
- `INSERT/UPDATE/DELETE`: tidak dibuka untuk customer.
  - checkout dibuat via RPC `create_order_with_stock_auth()`
  - submit proof via RPC `submit_payment_proof_auth()`

> Admin tidak butuh policy karena admin memakai service role.


### 2.4 `order_items` policies
Enable RLS.

- `SELECT` untuk `authenticated`:
  - using: `exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())`
- `INSERT/UPDATE/DELETE`: tidak dibuka untuk customer (dibuat via RPC checkout)


### 2.5 `order_payment_proofs` policies
Enable RLS.

- `SELECT` untuk `authenticated`:
  - using: `exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())`

**Write**
- Opsi A (recommended): tidak buka `INSERT`, pakai RPC `submit_payment_proof_auth()`.
- Opsi B (lebih cepat, tapi lebih risk): buka `INSERT` dengan check ownership:
  - with check: ownership join ke orders


### 2.6 `store_settings` policies
Enable RLS.

- Tidak perlu public read (pembayaran bisa dibaca via server action)
- Untuk MVP paling aman:
  - **tidak ada** policy untuk anon/authenticated
  - admin mengelola via service role

Jika ingin customer membaca instruksi pembayaran via client-side:
- Tambah `SELECT` untuk `anon, authenticated` yang hanya mengizinkan row terbaru (ini agak tricky di RLS). Lebih simple: fetch via server component/action.

---

## 3) RPC / Functions — final

### 3.1 Kenapa perlu RPC auth-aware?
Saat ini function `public.create_order_with_stock(...)` melakukan:
- `select ... for update` pada `product_variants`
- `update product_variants set stock = stock - qty`

Namun, `product_variants` tidak punya UPDATE policy untuk customer (dan memang sebaiknya tidak).
Maka checkout customer harus lewat function yang:
- memvalidasi login via `auth.uid()`
- melakukan insert order + decrement stock dalam 1 transaksi
- tidak membutuhkan policy UPDATE untuk user pada `product_variants`

> Implementasi Supabase/Postgres: function dapat dijalankan dengan hak owner/definer bila diset `security definer` + grants yang tepat. Detail grant dieksekusi saat implementasi (Part 5).


### 3.2 Function: `public.create_order_with_stock_auth(_shipping_address jsonb, _items jsonb)`
**Signature (final)**
- Input:
  - `_shipping_address jsonb`
  - `_items jsonb` (format sama: `[{ variant_id, quantity }, ...]`)
- Output:
  - `order_id uuid, order_number text`

**Behavior**
1. `uid := auth.uid()`; jika null → reject
2. Ambil data `profiles` untuk snapshot ke `orders`:
   - `full_name` menjadi `orders.customer_name`
   - `phone` menjadi `orders.customer_phone`
   - (email bisa dari `auth.users.email` atau input opsional)
3. Insert `orders` dengan `user_id = uid`
4. Loop items:
   - lock variant row (`FOR UPDATE`)
   - validate variant active, product active, stock cukup
   - decrement stock
   - insert order_items dengan snapshot name/size/price
5. update `orders.total_amount`

**Profile completion rule (final)**
- Wajibkan:
  - `profiles.full_name` tidak kosong
  - `shipping_address` lengkap
- Jika belum lengkap → raise exception

> Ini yang menjamin “profile completion before checkout”.


### 3.3 Function: `public.submit_payment_proof_auth(order_id uuid, storage_path text, original_name text, mime_type text, size_bytes int)`
**Behavior**
1. `uid := auth.uid()`; jika null → reject
2. Pastikan order exists dan `orders.user_id = uid`
3. Insert row ke `order_payment_proofs`
4. Update `orders.payment_status = 'submitted'`

**Rule (final)**
- Jangan izinkan submit proof jika:
  - `orders.status = 'cancelled'` atau `orders.status = 'completed'`
  - (opsional) `payment_status in ('verified')`


### 3.4 Trigger: restore stock on cancel (tetap)
Function `public.restore_stock_on_order_cancelled()` sudah ada dan bagus.
Pastikan update status ke `cancelled` hanya dilakukan admin (service role), atau via RPC admin.

---

## 4) Migration Plan (dari MVP ke Auth+RLS)

### Fase 0 — Persiapan (tanpa mengubah perilaku app)
- Tambah table `store_settings` agar admin settings bisa dibangun rapi.
- Tambah table `profiles` + trigger create profile on signup (belum dipakai app).

### Fase 1 — Supabase Auth (Google)
- Implement Next.js auth session.
- Ganti “cookie gate” `st_customer` dengan Supabase session.

### Fase 2 — Ownership pada orders
- Tambah kolom `orders.user_id` (nullable).
- Buat RPC `create_order_with_stock_auth()` yang mengisi `user_id`.
- Ubah app checkout supaya memanggil RPC auth-aware menggunakan user session.

### Fase 3 — RLS enforcement
- Enable + pasang policies sesuai Bab 2.
- Stop memakai service role untuk customer flows:
  - list orders
  - read order detail
  - submit proof (kecuali upload file storage masih server-side sementara)

### Fase 4 — Tighten constraints
- Jika semua order baru selalu punya owner:
  - set `orders.user_id` menjadi `not null` (opsional, setelah data legacy dibereskan)

---

## 5) Open Decisions (dikunci sekarang)

1) **Alamat**
- MVP: `profiles.shipping_address` jsonb (single address)
- Next: tabel `addresses` jika perlu multi alamat

2) **QRIS field**
- MVP: `store_settings.qris_image_url`
- Next: `qris_storage_path` + signed/public URL server-side

3) **Email di orders**
- Opsi A: snapshot dari `auth.users.email`
- Opsi B: tetap input manual (sekarang masih ada field)

Rekomendasi final:
- gunakan email dari auth (lebih konsisten), dan jadikan input email optional hanya untuk fallback.

---

## 6) Mapping ke file Supabase yang ada (agar implementasi nanti rapih)

Saat implementasi (Part 5), perubahan dipecah begini:

- `supabase/schema.sql`
  - (tetap) katalog
  - (tambahan) `store_settings` + `profiles` + triggers

- `supabase/rls.sql`
  - (tetap) public read katalog

- `supabase/orders.sql`
  - alter `orders` add `user_id`
  - tambah `create_order_with_stock_auth`
  - tambah `submit_payment_proof_auth`

- `supabase/orders_rls.sql`
  - policies untuk orders/items/proofs sesuai Bab 2

---

## 7) Acceptance Criteria (untuk verifikasi setelah implementasi)

- Guest (anon) bisa browse katalog, tapi tidak bisa akses `orders` table.
- User A tidak bisa melihat order milik user B.
- Checkout menolak jika profile belum lengkap.
- Checkout tidak bisa oversell (stock tidak menjadi negatif).
- Cancelled order mengembalikan stock tepat.
- Payment proof hanya bisa ditambahkan oleh pemilik order.

