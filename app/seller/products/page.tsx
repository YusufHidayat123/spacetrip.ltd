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

export default async function ProductsPage() {
  const products = await adminListProducts();

  return (
    <PageShell>
      <PageHeader
        title="Catalog"
        breadcrumb={
          <Breadcrumb
            items={[{ label: "seller", href: "/seller" }, { label: "catalog" }]}
          />
        }
        right={
          <Button asChild>
            <Link href="/seller/products/new">
              <Plus className="h-4 w-4" />
              New Product
            </Link>
          </Button>
        }
      />

      <section className="mt-6 overflow-hidden rounded-xl border border-[color:var(--st-border)] bg-white shadow-[0_4px_16px_rgba(17,24,39,0.04)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead className="w-[180px]">Category</TableHead>
              <TableHead className="w-[160px]">Price</TableHead>
              <TableHead className="w-[120px]">Status</TableHead>
              <TableHead className="w-[120px]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-sm text-[color:var(--st-text-muted)]">
                  No products yet.
                </TableCell>
              </TableRow>
            ) : (
              products.map((p: any) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="font-medium">{p.name}</div>
                    <div className="mt-0.5 text-xs text-[color:var(--st-text-muted)]">
                      {p.slug}
                    </div>
                  </TableCell>
                  <TableCell className="text-[color:var(--st-text-muted)]">
                    {p.categories?.name ?? "—"}
                  </TableCell>
                  <TableCell className="text-[color:var(--st-text)]">
                    {formatIDR(p.price)}
                  </TableCell>
                  <TableCell className="text-[color:var(--st-text-muted)]">
                    {p.status}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/seller/products/${p.id}`}
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
