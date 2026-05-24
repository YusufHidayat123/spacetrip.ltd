# Supabase Setup (Spacetrip MVP)

This project uses Supabase for **Postgres** + **Storage**.

## 1) Create Supabase project
1. Create a project at https://supabase.com
2. Go to **Project Settings → API**
   - Copy **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - Copy **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Copy **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (server-only)

Create a local `.env.local` based on `.env.example`.

## 2) Create Storage buckets
Create buckets:
- `product-images` (or set `SUPABASE_PRODUCT_IMAGES_BUCKET`)
- `payment-proofs` (or set `SUPABASE_PAYMENT_PROOFS_BUCKET`)
- `store-assets` (or set `SUPABASE_STORE_ASSETS_BUCKET`) — for QRIS image, logos, etc.

Recommended for MVP:
- `product-images`: **public** (for catalog)
- `payment-proofs`: **private** (payment proof is sensitive). The admin UI uses signed URLs.
- `store-assets`: **public** (QRIS needs to be viewable by customers).

Path convention used by the app:
- `{productId}/{uuid}.{ext}`

## 3) Create DB schema
Open **SQL Editor** in Supabase and run:
1. `supabase/schema.sql`
2. `supabase/rls.sql`
3. `supabase/orders.sql`
4. `supabase/orders_rls.sql`

> Important: `schema.sql` includes a trigger on `auth.users` to auto-create a `profiles` row for every new user.

## 4) Configure Auth redirect URLs (Google OAuth)
In Supabase Dashboard → Authentication → URL Configuration:
- Site URL: `http://localhost:3000` (or your deployed URL)
- Redirect URLs: add `http://localhost:3000/auth/callback`

Then enable Google provider in Authentication → Providers.

## 5) Run the app
```sh
npm run dev
```

Admin pages:
- `/seller/categories`
- `/seller/products`
- `/seller/products/new`

## Notes (Security)
- Customer pages use **Supabase Auth** (Google) + server-side session cookies.
- Seller pages (`/seller/*`) are protected by middleware and require `profiles.role` = `seller`/`admin`.
  - To grant access, update the user's `profiles.role` in the DB (service role / SQL Editor).

Admin writes (create/update) are done server-side using the **service role key**.
- Do **not** expose `SUPABASE_SERVICE_ROLE_KEY` to the browser.
