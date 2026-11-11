export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowUpRight, Plus, Search, Star } from "lucide-react";

import { Breadcrumb } from "@/components/seller/breadcrumb";
import { PageHeader } from "@/components/seller/page-header";
import { PageShell } from "@/components/seller/page-shell";
import { Pagination } from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { adminListProducts } from "@/lib/catalog/admin";
import { getPublicProductImageUrl } from "@/lib/catalog/public";
import type { ProductGender } from "@/lib/catalog/types";
import { formatIDR } from "@/lib/orders/format";

type ProductListRow = {
  id: string;
  name: string;
  slug: string;
  price: string;
  original_price: string | null;
  status: string;
  gender: string | null;
  condition: string | null;
  badge: string | null;
  is_featured: boolean | null;
  categories: { name: string } | null;
  product_images: { storage_path: string; sort_order: number }[];
  product_variants: { stock: number; is_active: boolean }[];
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const status = (typeof sp.status === "string" ? sp.status : "all") as "draft" | "active" | "all";
  const gender = (typeof sp.gender === "string" ? sp.gender : "all") as ProductGender | "all";
  const page = typeof sp.page === "string" ? Number(sp.page) : 1;
  const pageSize = typeof sp.pageSize === "string" ? Number(sp.pageSize) : 20;

  const result = await adminListProducts({ q, status, gender, page, pageSize });
  const products = result.data as unknown as ProductListRow[];
  const total = result.count;

  return (
    <PageShell>
      <PageHeader
        title="Katalog Produk"
        description={`Kelola seluruh ${total} item kurasi thrift & streetwear lokal Indonesia.`}
        breadcrumb={<Breadcrumb items={[{ label: "admin", href: "/seller" }, { label: "katalog" }]} />}
        right={
          <Link
            href="/seller/products/new"
            className="inline-flex h-10 items-center gap-2 rounded-full bg-[#0D0D0D] px-5 font-mono-label text-[11px] font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-[#FF5500]"
          >
            <Plus className="h-4 w-4" />
            <span>Produk Baru</span>
          </Link>
        }
      />

      {/* Filter Bar */}
      <section className="mt-6 rounded-2xl border border-(--st-border) bg-white p-4">
        <form className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-(--st-text-muted)" />
            <Input
              name="q"
              defaultValue={q}
              placeholder="Cari nama produk..."
              className="h-10 rounded-full border-(--st-border) bg-(--st-bg) pl-10 text-xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <select
              name="gender"
              defaultValue={gender}
              className="h-10 rounded-xl border border-(--st-border) bg-(--st-bg) px-3 text-xs text-(--st-text) focus:border-[#0D0D0D] focus:outline-none"
            >
              <option value="all">Semua Departemen</option>
              <option value="men">Men</option>
              <option value="women">Women</option>
              <option value="unisex">Unisex</option>
              <option value="accessories">Accessories</option>
            </select>

            <select
              name="status"
              defaultValue={status}
              className="h-10 rounded-xl border border-(--st-border) bg-(--st-bg) px-3 text-xs text-(--st-text) focus:border-[#0D0D0D] focus:outline-none"
            >
              <option value="all">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="draft">Draft</option>
            </select>

            <button
              type="submit"
              className="h-10 rounded-full bg-[#0D0D0D] px-5 font-mono-label text-[11px] font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-[#FF5500]"
            >
              Terapkan
            </button>
          </div>
        </form>
      </section>

      {/* Catalog Table */}
      <section className="mt-4 overflow-hidden rounded-3xl border border-(--st-border) bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produk</TableHead>
              <TableHead>Kategori / Dept</TableHead>
              <TableHead>Kondisi</TableHead>
              <TableHead>Stok</TableHead>
              <TableHead>Harga</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-xs text-(--st-text-muted)">
                  Belum ada produk sesuai filter.
                </TableCell>
              </TableRow>
            ) : (
              products.map((p) => {
                const imgs = (p.product_images ?? [])
                  .slice()
                  .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
                const heroUrl = imgs[0]?.storage_path
                  ? getPublicProductImageUrl(imgs[0].storage_path)
                  : null;
                const totalStock = (p.product_variants ?? [])
                  .filter((v) => v.is_active !== false)
                  .reduce((sum, v) => sum + (v.stock ?? 0), 0);

                return (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="clip-chamfer-diagonal-sm relative h-12 w-10 shrink-0 overflow-hidden rounded-lg bg-(--st-surface-alt)">
                          {heroUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={heroUrl} alt={p.name} className="h-full w-full object-cover" />
                          ) : null}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 font-medium text-(--st-text)">
                            <span className="max-w-[240px] truncate">{p.name}</span>
                            {p.is_featured ? (
                              <Star className="h-3.5 w-3.5 shrink-0 fill-[#FF5500] text-[#FF5500]" />
                            ) : null}
                          </div>
                          <div className="mt-0.5 font-mono-label text-[10px] text-(--st-text-muted)">
                            {p.slug}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-xs font-medium text-(--st-text)">
                        {p.categories?.name ?? "—"}
                      </div>
                      <div className="font-mono-label text-[10px] uppercase text-(--st-text-muted)">
                        {p.gender ?? "unisex"}
                      </div>
                    </TableCell>

                    <TableCell className="text-xs text-(--st-text-muted)">
                      {p.condition ?? "Excellent"}
                    </TableCell>

                    <TableCell>
                      <span
                        className={`rounded-full px-2.5 py-0.5 font-mono-label text-[10px] font-semibold ${
                          totalStock === 0
                            ? "bg-red-100 text-red-800"
                            : totalStock <= 2
                              ? "bg-(--st-accent-soft) text-[#CC4400]"
                              : "bg-emerald-50 text-emerald-800"
                        }`}
                      >
                        {totalStock} pcs
                      </span>
                    </TableCell>

                    <TableCell>
                      <div className="font-semibold text-(--st-text)">{formatIDR(p.price)}</div>
                      {p.original_price && Number(p.original_price) > Number(p.price) ? (
                        <div className="text-[11px] text-(--st-text-muted) line-through">
                          {formatIDR(p.original_price)}
                        </div>
                      ) : null}
                    </TableCell>

                    <TableCell>
                      <span
                        className={`rounded-full px-2.5 py-0.5 font-mono-label text-[10px] font-semibold uppercase tracking-[0.08em] ${
                          p.status === "active"
                            ? "bg-[#0D0D0D] text-white"
                            : "bg-(--st-surface-alt) text-(--st-text-muted)"
                        }`}
                      >
                        {p.status === "active" ? "Aktif" : "Draft"}
                      </span>
                    </TableCell>

                    <TableCell>
                      <Link
                        href={`/seller/products/${p.id}`}
                        className="inline-flex items-center gap-1 font-mono-label text-[11px] font-semibold uppercase tracking-[0.08em] text-[#0D0D0D] transition hover:text-[#FF5500]"
                      >
                        <span>Edit</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </section>

      <Pagination
        className="mt-4"
        page={result.page}
        pageSize={result.pageSize}
        total={total}
        href={(p) => {
          const params = new URLSearchParams();
          if (q) params.set("q", q);
          if (status && status !== "all") params.set("status", status);
          if (gender && gender !== "all") params.set("gender", gender);
          params.set("page", String(p));
          params.set("pageSize", String(result.pageSize));
          return `/seller/products?${params.toString()}`;
        }}
      />
    </PageShell>
  );
}
