# spacetrip.

Platform e-commerce kurasi thrift & streetwear lokal Indonesia berbasis **Next.js** dan **Supabase**, dilengkapi storefront editorial *Momento*, pembayaran QRIS manual, dan panel operasional seller/admin.

<p>
  <img src="https://img.shields.io/badge/Next.js-16.2%20%7C%20React%2019-5C6BC0?style=flat-square&logo=nextdotjs&logoColor=white" alt="Next.js 16.2 | React 19" />
  <img src="https://img.shields.io/badge/Architecture-App%20Router%20%7C%20Server%20Actions-0284C7?style=flat-square" alt="Architecture: App Router | Server Actions" />
  <img src="https://img.shields.io/badge/Database-Supabase%20PostgreSQL%20%7C%20Storage-00758F?style=flat-square&logo=postgresql&logoColor=white" alt="Database: Supabase PostgreSQL | Storage" />
  <img src="https://img.shields.io/badge/UI%20Design-Momento%20Editorial-FF5500?style=flat-square" alt="UI Design: Momento Editorial" />
  <br />
  <img src="https://img.shields.io/badge/Frontend-Tailwind%20CSS%204%20%2B%20Framer%20Motion-7C3AED?style=flat-square&logo=tailwindcss&logoColor=white" alt="Frontend: Tailwind CSS 4 + Framer Motion" />
  <img src="https://img.shields.io/badge/Commerce-QRIS%20%7C%20Atomic%20Stock%20RPC-EC4899?style=flat-square&logo=supabase&logoColor=white" alt="Commerce: QRIS | Atomic Stock RPC" />
  <img src="https://img.shields.io/badge/Security-Supabase%20Auth%20%7C%20RLS%20%7C%20RBAC-16A34A?style=flat-square" alt="Security: Supabase Auth | RLS | RBAC" />
  <br />
  <img src="https://img.shields.io/badge/Runtime-Node.js%20%7C%20TypeScript%205%20%7C%20Turbopack-1D4ED8?style=flat-square&logo=nodedotjs&logoColor=white" alt="Runtime: Node.js | TypeScript 5 | Turbopack" />
</p>

## Fitur Utama

- **Storefront Responsif**: Katalog multi-filter (`/products`), pencarian instan (`/api/search`), quick view, wishlist, dan slide-out cart drawer.
- **Checkout & QRIS**: Pemesanan dengan kunci stok atomik via PostgreSQL RPC dan unggah bukti transfer QRIS manual.
- **Portal Seller & Admin (`/seller`)**: Dashboard ringkasan, manajemen produk/varian/kategori, verifikasi QRIS (`/seller/transactions`), pengaturan QRIS toko, serta manajemen staff dengan RBAC (`customer`, `seller`, `admin`).

## Menjalankan Secara Lokal

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Konfigurasi `.env.local`**

   ```env
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   SUPABASE_PRODUCT_IMAGES_BUCKET=product-images
   SUPABASE_PAYMENT_PROOFS_BUCKET=payment-proofs
   SUPABASE_STORE_ASSETS_BUCKET=store-assets
   ```

3. **Jalankan Supabase lokal & aplikasi**

   ```bash
   supabase start
   npm run dev
   ```

   Buka [http://localhost:3000](http://localhost:3000) untuk storefront dan [http://localhost:3000/seller/login](http://localhost:3000/seller/login) untuk portal admin/seller.
