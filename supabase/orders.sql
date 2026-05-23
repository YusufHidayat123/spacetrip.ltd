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

create unique index if not exists orders_order_number_unique on public.orders (order_number);
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

commit;
