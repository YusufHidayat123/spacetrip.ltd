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

Recommended for MVP:
- `product-images`: **public** (for catalog)
- `payment-proofs`: **private** (payment proof is sensitive). The admin UI uses signed URLs.

Path convention used by the app:
- `{productId}/{uuid}.{ext}`

## 3) Create DB schema
Open **SQL Editor** in Supabase and run:
1. `supabase/schema.sql`
2. `supabase/rls.sql`
3. `supabase/orders.sql`
4. `supabase/orders_rls.sql`

## 4) Run the app
```sh
npm run dev
```

Admin pages:
- `/seller/categories`
- `/seller/products`
- `/seller/products/new`

## Notes (MVP security)
Currently, admin writes (create/update) are done server-side using the **service role key**.
- Do **not** expose `SUPABASE_SERVICE_ROLE_KEY` to the browser.
- Before production, replace this with Supabase Auth + role-based RLS policies.
