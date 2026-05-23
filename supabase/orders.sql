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

commit;
