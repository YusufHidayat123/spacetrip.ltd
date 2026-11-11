-- Backward-compatible SpaceTrip Streetwear & Curated Thrift expansion
begin;

-- Extend products with rich streetwear & thrift metadata
alter table public.products
  add column if not exists gender text default 'unisex' check (gender in ('men', 'women', 'unisex', 'accessories')),
  add column if not exists condition text default 'Excellent',
  add column if not exists color text,
  add column if not exists material text,
  add column if not exists original_price numeric(12,2),
  add column if not exists style_tags text[] default '{}',
  add column if not exists measurements text,
  add column if not exists is_featured boolean not null default false,
  add column if not exists badge text;

create index if not exists products_gender_idx on public.products (gender);
create index if not exists products_is_featured_idx on public.products (is_featured);

-- Editorial Lookbook table linking Indonesian model photos to actual catalog product IDs
create table if not exists public.editorial_looks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  model_name text,
  location text,
  image_path text not null,
  product_ids uuid[] not null default '{}',
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.editorial_looks enable row level security;

drop policy if exists "public_read_active_looks" on public.editorial_looks;
create policy "public_read_active_looks"
on public.editorial_looks
for select
to anon, authenticated
using (is_active = true);

-- Wishlist table for authenticated customers (idempotent, backward-compatible)
create table if not exists public.wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, product_id)
);

alter table public.wishlists enable row level security;

drop policy if exists "wishlists_own_all" on public.wishlists;
create policy "wishlists_own_all"
on public.wishlists
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

commit;

