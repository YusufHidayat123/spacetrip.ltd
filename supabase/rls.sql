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

-- No public insert/update/delete policies (admin only via service role)

commit;
