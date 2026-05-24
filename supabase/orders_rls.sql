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
