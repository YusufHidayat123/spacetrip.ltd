-- RLS for orders (MVP)
--
-- For MVP simplicity:
-- - public can insert orders & upload payment proof via server actions using service role
-- - public can read orders via server actions too
--
-- Here we only enable RLS and allow public select on products already.
-- For production, implement auth and strict per-user policies.

begin;

alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_payment_proofs enable row level security;

-- No anon policies for now.

commit;
