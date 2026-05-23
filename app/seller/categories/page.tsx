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
        title="Category"
        breadcrumb={
          <Breadcrumb
            items={[
              { label: "seller", href: "/seller" },
              { label: "category" },
            ]}
          />
        }
        right={
          <Button asChild>
            <Link href="/seller/categories/new">
              <Plus className="h-4 w-4" />
              New Category
            </Link>
          </Button>
        }
      />

      <section className="mt-6 overflow-hidden rounded-xl border border-[color:var(--st-border)] bg-white shadow-[0_4px_16px_rgba(17,24,39,0.04)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="w-[120px]">Active</TableHead>
              <TableHead className="w-[120px]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-sm text-[color:var(--st-text-muted)]">
                  No categories yet.
                </TableCell>
              </TableRow>
            ) : (
              categories.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-[color:var(--st-text-muted)]">
                    {c.slug}
                  </TableCell>
                  <TableCell className="text-[color:var(--st-text-muted)]">
                    {c.is_active ? "Yes" : "No"}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/seller/categories/${c.id}`}
                      className="inline-flex items-center gap-1 text-sm font-medium text-[color:var(--st-text)] underline-offset-4 hover:underline"
                    >
                      Manage
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
