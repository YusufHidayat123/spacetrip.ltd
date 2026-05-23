export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";

import { Breadcrumb } from "@/components/seller/breadcrumb";
import { PageHeader } from "@/components/seller/page-header";
import { PageShell } from "@/components/seller/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createOrderMvp } from "@/lib/orders/public";

export default async function NewOrderMvpPage() {
  const supabase = createSupabaseAdminClient();

  // List active products + variants for quick MVP testing.
  const { data: variants, error } = await supabase
    .from("product_variants")
    .select("id,size_label,stock,is_active,products(id,name,price,status)")
    .eq("is_active", true);

  if (error) throw error;

  const variantOptions = (variants ?? [])
    .filter((v: any) => v.products?.status === "active")
    .map((v: any) => ({
      id: v.id as string,
      label: `${v.products.name} — Size ${v.size_label} (stock: ${v.stock})`,
    }));

  async function createOrderAction(formData: FormData) {
    "use server";

    const variant_id = String(formData.get("variant_id") ?? "");
    const quantity = Number(String(formData.get("quantity") ?? "1"));

    const customer_name = String(formData.get("customer_name") ?? "");
    const customer_email = String(formData.get("customer_email") ?? "");
    const customer_phone = String(formData.get("customer_phone") ?? "");

    const line1 = String(formData.get("line1") ?? "");
    const city = String(formData.get("city") ?? "");
    const province = String(formData.get("province") ?? "");
    const postal_code = String(formData.get("postal_code") ?? "");

    if (!variant_id) throw new Error("Select a variant");
    if (!customer_name) throw new Error("Customer name is required");
    if (!line1 || !city || !province || !postal_code)
      throw new Error("Complete shipping address");

    const { orderId } = await createOrderMvp({
      customer_name,
      customer_email: customer_email || null,
      customer_phone: customer_phone || null,
      shipping_address: { line1, city, province, postal_code },
      items: [{ variant_id, quantity: Number.isFinite(quantity) ? quantity : 1 }],
    });

    redirect(`/orders/${orderId}`);
  }

  return (
    <PageShell>
      <PageHeader
        title="Create Order (MVP Test)"
        breadcrumb={
          <Breadcrumb
            items={[{ label: "home", href: "/" }, { label: "orders" }, { label: "new" }]}
          />
        }
        right={
          <Button asChild variant="outline">
            <Link href="/seller/orders">Go to Admin Orders</Link>
          </Button>
        }
      />

      <section className="mt-6 rounded-xl border border-[color:var(--st-border)] bg-white p-6 shadow-[0_4px_16px_rgba(17,24,39,0.04)]">
        <form action={createOrderAction} className="grid gap-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-[color:var(--st-text)]">
                Customer name
              </label>
              <Input name="customer_name" placeholder="John Doe" required />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-[color:var(--st-text)]">
                Email (optional)
              </label>
              <Input name="customer_email" type="email" placeholder="john@email.com" />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-[color:var(--st-text)]">
                Phone (optional)
              </label>
              <Input name="customer_phone" placeholder="08xxxxxxxxxx" />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-[color:var(--st-text)]">
                Item
              </label>
              <select
                name="variant_id"
                className="h-10 w-full rounded-md border border-[color:var(--st-border)] bg-white px-3 text-sm text-[color:var(--st-text)] focus:outline-none focus:ring-2 focus:ring-[color:var(--st-accent)] focus:ring-offset-2 focus:ring-offset-white"
                required
                defaultValue={variantOptions[0]?.id ?? ""}
              >
                {variantOptions.length === 0 ? (
                  <option value="" disabled>
                    No active product variants found
                  </option>
                ) : (
                  variantOptions.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.label}
                    </option>
                  ))
                )}
              </select>
              <p className="text-xs text-[color:var(--st-text-muted)]">
                Tip: create an active product + variants in Admin Catalog first.
              </p>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-[color:var(--st-text)]">
                Quantity
              </label>
              <Input name="quantity" type="number" min={1} defaultValue={1} />
            </div>
          </div>

          <div className="rounded-lg border border-[color:var(--st-border)] p-4">
            <div className="text-sm font-semibold text-[color:var(--st-text)]">
              Shipping address
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="grid gap-2 md:col-span-2">
                <label className="text-sm font-medium text-[color:var(--st-text)]">
                  Address line
                </label>
                <Input name="line1" placeholder="Jl. Example No. 123" required />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-[color:var(--st-text)]">
                  City
                </label>
                <Input name="city" placeholder="Jakarta" required />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-[color:var(--st-text)]">
                  Province
                </label>
                <Input name="province" placeholder="DKI Jakarta" required />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-[color:var(--st-text)]">
                  Postal code
                </label>
                <Input name="postal_code" placeholder="12345" required />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <Button type="submit">Create order</Button>
          </div>
        </form>
      </section>

      <p className="mt-4 text-xs text-[color:var(--st-text-muted)]">
        MVP test page only. Replace with real checkout flow later.
      </p>
    </PageShell>
  );
}
