-- Spacetrip Catalog (MVP)
--
-- Tables:
-- - categories
-- - products
-- - product_variants (size + stock)
-- - product_images (storage path)
--
-- Notes:
-- - Uses uuid primary keys
-- - Keeps variants as size-only for MVP
-- - RLS policies are in supabase/rls.sql

begin;

-- extensions
create extension if not exists "pgcrypto";

-- categories
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists categories_slug_unique on public.categories (slug);

-- products
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete restrict,
  name text not null,
  slug text not null,
  description text,
  price numeric(12,2) not null,
  status text not null default 'draft' check (status in ('draft', 'active')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists products_slug_unique on public.products (slug);
create index if not exists products_category_id_idx on public.products (category_id);

-- variants (size + stock)
create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  size_label text not null,
  stock int not null default 0 check (stock >= 0),
  sku text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists product_variants_product_id_size_unique
  on public.product_variants (product_id, size_label);
create index if not exists product_variants_product_id_idx on public.product_variants (product_id);

-- product images (supabase storage path)
create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  storage_path text not null,
  alt text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists product_images_product_id_idx on public.product_images (product_id);

-- profiles (auth-owned customer/seller data)
--
-- 1:1 with auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'customer' check (role in ('customer', 'seller', 'admin')),
  full_name text,
  phone text,
  shipping_address jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- store settings (QRIS + instructions)
create table if not exists public.store_settings (
  id uuid primary key default gen_random_uuid(),
  store_name text not null default 'Spacetrip',
  payment_instructions text,
  qris_image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- updated_at triggers
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Auto-create a profile when a new auth user is created.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;

  return new;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'set_categories_updated_at'
  ) then
    create trigger set_categories_updated_at
    before update on public.categories
    for each row execute function public.set_updated_at();
  end if;

  if not exists (
    select 1 from pg_trigger where tgname = 'set_products_updated_at'
  ) then
    create trigger set_products_updated_at
    before update on public.products
    for each row execute function public.set_updated_at();
  end if;

  if not exists (
    select 1 from pg_trigger where tgname = 'set_product_variants_updated_at'
  ) then
    create trigger set_product_variants_updated_at
    before update on public.product_variants
    for each row execute function public.set_updated_at();
  end if;

  if not exists (
    select 1 from pg_trigger where tgname = 'set_profiles_updated_at'
  ) then
    create trigger set_profiles_updated_at
    before update on public.profiles
    for each row execute function public.set_updated_at();
  end if;

  if not exists (
    select 1 from pg_trigger where tgname = 'set_store_settings_updated_at'
  ) then
    create trigger set_store_settings_updated_at
    before update on public.store_settings
    for each row execute function public.set_updated_at();
  end if;

  if not exists (
    select 1 from pg_trigger where tgname = 'on_auth_user_created'
  ) then
    create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();
  end if;
end $$;

commit;

-- Auto-create required storage buckets
insert into storage.buckets (id, name, public)
values
  ('product-images', 'product-images', true),
  ('store-assets', 'store-assets', true),
  ('payment-proofs', 'payment-proofs', false)
on conflict (id) do nothing;
-- Spacetrip Catalog RLS (MVP)
--
-- Strategy:
-- - Public can read active categories/products/variants/images
-- - Admin operations are performed server-side using SUPABASE_SERVICE_ROLE_KEY
--   (so we keep RLS strict for now)
--
-- When auth/roles are implemented, replace service-role usage with role-based policies.

begin;

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;

alter table public.profiles enable row level security;
alter table public.store_settings enable row level security;

-- Public read policies
drop policy if exists "public_read_active_categories" on public.categories;
create policy "public_read_active_categories"
on public.categories
for select
to anon, authenticated
using (is_active = true);

drop policy if exists "public_read_active_products" on public.products;
create policy "public_read_active_products"
on public.products
for select
to anon, authenticated
using (status = 'active');

drop policy if exists "public_read_active_variants" on public.product_variants;
create policy "public_read_active_variants"
on public.product_variants
for select
to anon, authenticated
using (is_active = true);

drop policy if exists "public_read_images" on public.product_images;
create policy "public_read_images"
on public.product_images
for select
to anon, authenticated
using (true);

-- profiles: authenticated users can read/update their own row

drop policy if exists "profiles_read_own" on public.profiles;
create policy "profiles_read_own"
on public.profiles
for select
to authenticated
using (id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- store_settings: no anon/authenticated policies (admin only via service role)

-- No public insert/update/delete policies (admin only via service role)

commit;

-- Auto-create required storage buckets
insert into storage.buckets (id, name, public)
values
  ('product-images', 'product-images', true),
  ('store-assets', 'store-assets', true),
  ('payment-proofs', 'payment-proofs', false)
on conflict (id) do nothing;
-- Spacetrip Orders + Manual Payment Proofs (MVP)
--
-- Adds:
-- - orders
-- - order_items
-- - order_payment_proofs

begin;

create extension if not exists "pgcrypto";

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null,

  -- order owner (Supabase Auth user)
  user_id uuid references auth.users(id) on delete set null,

  -- fulfillment status
  status text not null default 'new' check (status in ('new', 'processing', 'shipped', 'completed', 'cancelled')),

  -- manual payment status
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'submitted', 'verified', 'rejected', 'expired')),

  total_amount numeric(12,2) not null,
  currency text not null default 'IDR',

  customer_name text not null,
  customer_email text,
  customer_phone text,
  shipping_address jsonb not null,

  pay_by timestamptz,

  admin_note text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Ensure legacy installs get the new column too
alter table public.orders
  add column if not exists user_id uuid references auth.users(id) on delete set null;

create unique index if not exists orders_order_number_unique on public.orders (order_number);
create index if not exists orders_user_id_idx on public.orders (user_id);
create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_payment_status_idx on public.orders (payment_status);
create index if not exists orders_status_idx on public.orders (status);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  variant_id uuid not null references public.product_variants(id) on delete restrict,
  product_name text not null,
  variant_label text not null,
  quantity int not null check (quantity > 0),
  price_at_purchase numeric(12,2) not null,
  created_at timestamptz not null default now()
);

create index if not exists order_items_order_id_idx on public.order_items (order_id);

create table if not exists public.order_payment_proofs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  storage_path text not null,
  original_name text,
  mime_type text,
  size_bytes int,
  created_at timestamptz not null default now()
);

create index if not exists order_payment_proofs_order_id_idx on public.order_payment_proofs (order_id);

-- updated_at trigger (reuse set_updated_at from schema.sql)
do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'set_orders_updated_at'
  ) then
    create trigger set_orders_updated_at
    before update on public.orders
    for each row execute function public.set_updated_at();
  end if;
end $$;

-- Atomic stock reservation + order creation (MVP)
--
-- This prevents overselling by locking the involved variants rows and
-- decrementing stock inside a single transaction.
--
-- items JSON format: [{"variant_id": "uuid", "quantity": 1}, ...]
-- Restore stock when an order is cancelled.
-- Idempotent on transition: only runs when status changes into 'cancelled'.
create or replace function public.restore_stock_on_order_cancelled()
returns trigger
language plpgsql
as $$
begin
  if (tg_op = 'UPDATE') then
    if (old.status is distinct from 'cancelled' and new.status = 'cancelled') then
      -- Aggregate per variant_id then restore.
      with sums as (
        select variant_id, sum(quantity)::int as qty
        from public.order_items
        where order_id = new.id
        group by variant_id
      )
      update public.product_variants pv
      set stock = pv.stock + s.qty
      from sums s
      where pv.id = s.variant_id;
    end if;

    -- Optional safety: prevent moving out of cancelled, because it would require
    -- re-reserving stock and could oversell.
    if (old.status = 'cancelled' and new.status <> 'cancelled') then
      raise exception 'Cannot change status from cancelled to %', new.status;
    end if;
  end if;

  return new;
end;
$$;

-- Attach trigger once
do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'orders_restore_stock_on_cancelled') then
    create trigger orders_restore_stock_on_cancelled
    after update of status on public.orders
    for each row
    execute function public.restore_stock_on_order_cancelled();
  end if;
end $$;

create or replace function public.create_order_with_stock(
  _customer_name text,
  _customer_email text,
  _customer_phone text,
  _shipping_address jsonb,
  _items jsonb
)
returns table(order_id uuid, order_number text)
language plpgsql
as $$
declare
  _order_id uuid;
  _order_number text;
  _total numeric(12,2) := 0;
  _it jsonb;
  _variant_id uuid;
  _qty int;
  _v record;
begin
  if _customer_name is null or length(trim(_customer_name)) = 0 then
    raise exception 'customer_name is required';
  end if;

  if _shipping_address is null then
    raise exception 'shipping_address is required';
  end if;

  if jsonb_typeof(_items) <> 'array' or jsonb_array_length(_items) = 0 then
    raise exception 'items must be a non-empty array';
  end if;

  _order_number := 'ST-' || to_char(now(), 'YYYYMMDD') || '-' || (100000 + floor(random() * 900000))::int;

  insert into public.orders (
    order_number,
    status,
    payment_status,
    total_amount,
    currency,
    customer_name,
    customer_email,
    customer_phone,
    shipping_address,
    pay_by
  ) values (
    _order_number,
    'new',
    'unpaid',
    0,
    'IDR',
    trim(_customer_name),
    nullif(trim(_customer_email), ''),
    nullif(trim(_customer_phone), ''),
    _shipping_address,
    now() + interval '24 hours'
  ) returning id into _order_id;

  for _it in select * from jsonb_array_elements(_items)
  loop
    _variant_id := (_it->>'variant_id')::uuid;
    _qty := greatest(1, (_it->>'quantity')::int);

    select
      pv.id as variant_id,
      pv.product_id,
      pv.size_label,
      pv.stock,
      pv.is_active as variant_active,
      p.name as product_name,
      p.price as product_price,
      p.status as product_status
    into _v
    from public.product_variants pv
    join public.products p on p.id = pv.product_id
    where pv.id = _variant_id
    for update;

    if not found then
      raise exception 'Invalid variant_id';
    end if;

    if _v.variant_active is distinct from true then
      raise exception 'Variant is not available';
    end if;

    if _v.product_status <> 'active' then
      raise exception 'Product is not available';
    end if;

    if _v.stock < _qty then
      raise exception 'Not enough stock for selected size';
    end if;

    update public.product_variants
    set stock = stock - _qty
    where id = _variant_id;

    insert into public.order_items (
      order_id,
      product_id,
      variant_id,
      product_name,
      variant_label,
      quantity,
      price_at_purchase
    ) values (
      _order_id,
      _v.product_id,
      _variant_id,
      _v.product_name,
      _v.size_label,
      _qty,
      _v.product_price
    );

    _total := _total + (_v.product_price * _qty);
  end loop;

  update public.orders
  set total_amount = _total
  where id = _order_id;

  order_id := _order_id;
  order_number := _order_number;
  return next;
end;
$$;

comment on function public.create_order_with_stock(text, text, text, jsonb, jsonb) is 'Create order & decrement stock atomically (MVP).';

-- Authenticated checkout (per-user orders)
--
-- Creates an order owned by auth.uid() and decrements stock atomically.
-- Requires:
-- - profiles.full_name must be set
-- - shipping_address provided OR profiles.shipping_address must be set
create or replace function public.create_order_with_stock_auth(
  _shipping_address jsonb,
  _items jsonb
)
returns table(order_id uuid, order_number text)
language plpgsql
security definer
set search_path = public
as $$
declare
  _uid uuid;
  _order_id uuid;
  _order_number text;
  _total numeric(12,2) := 0;
  _it jsonb;
  _variant_id uuid;
  _qty int;
  _v record;
  _profile record;
  _customer_name text;
  _customer_email text;
  _customer_phone text;
  _final_shipping jsonb;
begin
  _uid := auth.uid();
  if _uid is null then
    raise exception 'Not authenticated';
  end if;

  if jsonb_typeof(_items) <> 'array' or jsonb_array_length(_items) = 0 then
    raise exception 'items must be a non-empty array';
  end if;

  select p.full_name, p.phone, p.shipping_address
  into _profile
  from public.profiles p
  where p.id = _uid;

  if not found then
    raise exception 'Profile not found';
  end if;

  _customer_name := nullif(trim(coalesce(_profile.full_name, '')), '');
  if _customer_name is null then
    raise exception 'Please complete your profile (full name) before checkout.';
  end if;

  _customer_phone := nullif(trim(coalesce(_profile.phone, '')), '');

  -- Prefer auth email snapshot.
  select u.email
  into _customer_email
  from auth.users u
  where u.id = _uid;
  _customer_email := nullif(trim(coalesce(_customer_email, '')), '');

  _final_shipping := coalesce(_shipping_address, _profile.shipping_address);
  if _final_shipping is null then
    raise exception 'Please complete your shipping address before checkout.';
  end if;

  _order_number := 'ST-' || to_char(now(), 'YYYYMMDD') || '-' || (100000 + floor(random() * 900000))::int;

  insert into public.orders (
    order_number,
    user_id,
    status,
    payment_status,
    total_amount,
    currency,
    customer_name,
    customer_email,
    customer_phone,
    shipping_address,
    pay_by
  ) values (
    _order_number,
    _uid,
    'new',
    'unpaid',
    0,
    'IDR',
    _customer_name,
    _customer_email,
    _customer_phone,
    _final_shipping,
    now() + interval '24 hours'
  ) returning id into _order_id;

  for _it in select * from jsonb_array_elements(_items)
  loop
    _variant_id := (_it->>'variant_id')::uuid;
    _qty := greatest(1, (_it->>'quantity')::int);

    select
      pv.id as variant_id,
      pv.product_id,
      pv.size_label,
      pv.stock,
      pv.is_active as variant_active,
      p.name as product_name,
      p.price as product_price,
      p.status as product_status
    into _v
    from public.product_variants pv
    join public.products p on p.id = pv.product_id
    where pv.id = _variant_id
    for update;

    if not found then
      raise exception 'Invalid variant_id';
    end if;

    if _v.variant_active is distinct from true then
      raise exception 'Variant is not available';
    end if;

    if _v.product_status <> 'active' then
      raise exception 'Product is not available';
    end if;

    if _v.stock < _qty then
      raise exception 'Not enough stock for selected size';
    end if;

    update public.product_variants
    set stock = stock - _qty
    where id = _variant_id;

    insert into public.order_items (
      order_id,
      product_id,
      variant_id,
      product_name,
      variant_label,
      quantity,
      price_at_purchase
    ) values (
      _order_id,
      _v.product_id,
      _variant_id,
      _v.product_name,
      _v.size_label,
      _qty,
      _v.product_price
    );

    _total := _total + (_v.product_price * _qty);
  end loop;

  update public.orders
  set total_amount = _total
  where id = _order_id;

  order_id := _order_id;
  order_number := _order_number;
  return next;
end;
$$;

revoke all on function public.create_order_with_stock_auth(jsonb, jsonb) from public;
grant execute on function public.create_order_with_stock_auth(jsonb, jsonb) to authenticated;

comment on function public.create_order_with_stock_auth(jsonb, jsonb) is 'Authenticated checkout: create per-user order & decrement stock atomically.';

-- Authenticated payment proof submission
create or replace function public.submit_payment_proof_auth(
  _order_id uuid,
  _storage_path text,
  _original_name text,
  _mime_type text,
  _size_bytes int
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  _uid uuid;
  _order record;
begin
  _uid := auth.uid();
  if _uid is null then
    raise exception 'Not authenticated';
  end if;

  if _order_id is null then
    raise exception 'order_id is required';
  end if;

  if _storage_path is null or length(trim(_storage_path)) = 0 then
    raise exception 'storage_path is required';
  end if;

  select id, user_id, status, payment_status
  into _order
  from public.orders
  where id = _order_id;

  if not found then
    raise exception 'Order not found';
  end if;

  if _order.user_id is distinct from _uid then
    raise exception 'Forbidden';
  end if;

  if _order.status in ('cancelled', 'completed') then
    raise exception 'Cannot submit proof for this order';
  end if;

  if _order.payment_status = 'verified' then
    raise exception 'Payment already verified';
  end if;

  insert into public.order_payment_proofs (
    order_id,
    storage_path,
    original_name,
    mime_type,
    size_bytes
  ) values (
    _order_id,
    _storage_path,
    nullif(trim(coalesce(_original_name, '')), ''),
    nullif(trim(coalesce(_mime_type, '')), ''),
    _size_bytes
  );

  update public.orders
  set payment_status = 'submitted'
  where id = _order_id;
end;
$$;

revoke all on function public.submit_payment_proof_auth(uuid, text, text, text, int) from public;
grant execute on function public.submit_payment_proof_auth(uuid, text, text, text, int) to authenticated;

comment on function public.submit_payment_proof_auth(uuid, text, text, text, int) is 'Authenticated payment proof submission for owned order.';

commit;

-- Auto-create required storage buckets
insert into storage.buckets (id, name, public)
values
  ('product-images', 'product-images', true),
  ('store-assets', 'store-assets', true),
  ('payment-proofs', 'payment-proofs', false)
on conflict (id) do nothing;
-- RLS for orders (per-user)
--
-- Strategy:
-- - authenticated customers can read their own orders, items, and payment proofs
-- - customers do not get direct insert/update/delete policies (write paths go through RPC)
-- - admin operations continue to use service role (bypasses RLS)

begin;

alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_payment_proofs enable row level security;

-- orders: read own

drop policy if exists "orders_read_own" on public.orders;
create policy "orders_read_own"
on public.orders
for select
to authenticated
using (user_id = auth.uid());

-- order_items: read if parent order is owned

drop policy if exists "order_items_read_own" on public.order_items;
create policy "order_items_read_own"
on public.order_items
for select
to authenticated
using (
  exists (
    select 1
    from public.orders o
    where o.id = order_id
      and o.user_id = auth.uid()
  )
);

-- order_payment_proofs: read if parent order is owned

drop policy if exists "order_payment_proofs_read_own" on public.order_payment_proofs;
create policy "order_payment_proofs_read_own"
on public.order_payment_proofs
for select
to authenticated
using (
  exists (
    select 1
    from public.orders o
    where o.id = order_id
      and o.user_id = auth.uid()
  )
);

commit;

-- Auto-create required storage buckets
insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true), ('store-assets', 'store-assets', true), ('payment-proofs', 'payment-proofs', false) on conflict (id) do nothing;

-- Auto-create required storage buckets
insert into storage.buckets (id, name, public)
values
  ('product-images', 'product-images', true),
  ('store-assets', 'store-assets', true),
  ('payment-proofs', 'payment-proofs', false)
on conflict (id) do nothing;
