export const dynamic = "force-dynamic";

import Link from "next/link";

import { ArrowRight, Plus } from "lucide-react";

import { Breadcrumb } from "@/components/seller/breadcrumb";
import { PageHeader } from "@/components/seller/page-header";
import { PageShell } from "@/components/seller/page-shell";
import { Button } from "@/components/ui/button";
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
        title="Kategori"
        breadcrumb={
          <Breadcrumb
            items={[
              { label: "admin", href: "/seller" },
              { label: "kategori" },
            ]}
          />
        }
        right={
          <Button asChild>
            <Link href="/seller/categories/new">
              <Plus className="h-4 w-4" />
              Kategori Baru
            </Link>
          </Button>
        }
      />

      <section className="mt-6 overflow-hidden rounded-xl border border-(--st-border) bg-white shadow-[0_4px_16px_rgba(17,24,39,0.04)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="w-30">Aktif</TableHead>
              <TableHead className="w-30">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-sm text-(--st-text-muted)">
                  Belum ada kategori.
                </TableCell>
              </TableRow>
            ) : (
              categories.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-(--st-text-muted)">
                    {c.slug}
                  </TableCell>
                  <TableCell className="text-(--st-text-muted)">
                    {c.is_active ? "Ya" : "Tidak"}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/seller/categories/${c.id}`}
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
    </PageShell>
  );
}
