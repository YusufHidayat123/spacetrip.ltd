export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowUpRight, Plus } from "lucide-react";

import { Breadcrumb } from "@/components/seller/breadcrumb";
import { PageHeader } from "@/components/seller/page-header";
import { PageShell } from "@/components/seller/page-shell";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { adminListCategories } from "@/lib/catalog/admin";

export default async function CategoriesPage() {
  const categories = await adminListCategories();

  return (
    <PageShell>
      <PageHeader
        title="Kategori Katalog"
        description={`${categories.length} kategori terstruktur untuk pengelompokan streetwear & curated thrift.`}
        breadcrumb={<Breadcrumb items={[{ label: "admin", href: "/seller" }, { label: "kategori" }]} />}
        right={
          <Link
            href="/seller/categories/new"
            className="inline-flex h-10 items-center gap-2 rounded-full bg-[#0D0D0D] px-5 font-mono-label text-[11px] font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-[#FF5500]"
          >
            <Plus className="h-4 w-4" />
            <span>Kategori Baru</span>
          </Link>
        }
      />

      <section className="mt-6 overflow-hidden rounded-3xl border border-(--st-border) bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Kategori</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="w-32">Status</TableHead>
              <TableHead className="w-28">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-xs text-(--st-text-muted)">
                  Belum ada kategori.
                </TableCell>
              </TableRow>
            ) : (
              categories.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium text-(--st-text)">{c.name}</TableCell>
                  <TableCell className="font-mono-label text-xs text-(--st-text-muted)">
                    {c.slug}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`rounded-full px-2.5 py-0.5 font-mono-label text-[10px] font-semibold uppercase tracking-[0.08em] ${
                        c.is_active
                          ? "bg-[#0D0D0D] text-white"
                          : "bg-(--st-surface-alt) text-(--st-text-muted)"
                      }`}
                    >
                      {c.is_active ? "Aktif" : "Nonaktif"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/seller/categories/${c.id}`}
                      className="inline-flex items-center gap-1 font-mono-label text-[11px] font-semibold uppercase tracking-[0.08em] text-[#0D0D0D] transition hover:text-[#FF5500]"
                    >
                      <span>Edit</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </section>
    </PageShell>
  );
}
