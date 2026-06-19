export const dynamic = "force-dynamic";

import Link from "next/link";

import { ArrowRight, Plus, Search } from "lucide-react";

import { Breadcrumb } from "@/components/seller/breadcrumb";
import { PageHeader } from "@/components/seller/page-header";
import { PageShell } from "@/components/seller/page-shell";
import { Pagination } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
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

function formatIDR(value: string) {
  const n = Number(value);
  return Number.isFinite(n)
    ? new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(n)
    : value;
}

type ProductListRow = {
  id: string;
  name: string;
  slug: string;
  price: string;
  status: string;
  categories: { name: string } | null;
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const status = (typeof sp.status === "string" ? sp.status : "all") as
    | "draft"
    | "active"
    | "all";
  const page = typeof sp.page === "string" ? Number(sp.page) : 1;
  const pageSize = typeof sp.pageSize === "string" ? Number(sp.pageSize) : 20;

  const result = await adminListProducts({ q, status, page, pageSize });
  const products = result.data as unknown as ProductListRow[];
  const total = result.count;

  return (
    <PageShell>
      <PageHeader
        title="Katalog"
        breadcrumb={
          <Breadcrumb
            items={[{ label: "admin", href: "/seller" }, { label: "katalog" }]}
          />
        }
        right={
          <Button asChild>
            <Link href="/seller/products/new">
              <Plus className="h-4 w-4" />
              Produk Baru
            </Link>
          </Button>
        }
      />

      <section className="mt-6 rounded-xl border border-(--st-border) bg-white p-4 shadow-[0_4px_16px_rgba(17,24,39,0.04)]">
        <form className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-105">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--st-text-muted)" />
            <Input
              name="q"
              defaultValue={q}
              placeholder="Cari produk"
              className="h-10 pl-9"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              name="status"
              defaultValue={status}
              className="h-10 rounded-md border border-(--st-border) bg-white px-3 text-sm text-(--st-text) focus:outline-none focus:ring-2 focus:ring-(--st-accent) focus:ring-offset-2 focus:ring-offset-white"
            >
              <option value="all">Semua</option>
              <option value="active">Aktif</option>
              <option value="draft">Draft</option>
            </select>

            <Button type="submit" className="h-10">
              Terapkan
            </Button>
          </div>
        </form>
      </section>

      <section className="mt-4 overflow-hidden rounded-xl border border-(--st-border) bg-white shadow-[0_4px_16px_rgba(17,24,39,0.04)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produk</TableHead>
              <TableHead className="w-45">Kategori</TableHead>
              <TableHead className="w-40">Harga</TableHead>
              <TableHead className="w-30">Status</TableHead>
              <TableHead className="w-30">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-sm text-(--st-text-muted)">
                  Belum ada produk.
                </TableCell>
              </TableRow>
            ) : (
              products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="font-medium">{p.name}</div>
                    <div className="mt-0.5 text-xs text-(--st-text-muted)">
                      {p.slug}
                    </div>
                  </TableCell>
                  <TableCell className="text-(--st-text-muted)">
                    {p.categories?.name ?? "—"}
                  </TableCell>
                  <TableCell className="text-(--st-text)">
                    {formatIDR(p.price)}
                  </TableCell>
                  <TableCell className="text-(--st-text-muted)">
                    {p.status === "active" ? "Aktif" : "Draft"}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/seller/products/${p.id}`}
                      className="inline-flex items-center gap-1 text-sm font-medium text-(--st-text) underline-offset-4 hover:underline"
                    >
                      Kelola
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))
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
          params.set("page", String(p));
          params.set("pageSize", String(result.pageSize));
          return `/seller/products?${params.toString()}`;
        }}
      />
    </PageShell>
  );
}
