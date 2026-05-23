export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";

import { SubmitButton } from "@/components/form/submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { findOrderForTracking } from "@/lib/orders/public";

export default async function TrackOrderPage() {
  async function trackAction(formData: FormData) {
    "use server";

    const orderNumber = String(formData.get("order_number") ?? "")
      .trim()
      .toUpperCase();

    const email = String(formData.get("email") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();

    if (!orderNumber) throw new Error("Order number is required");
    if (!email && !phone) {
      throw new Error("Please provide email or phone used at checkout");
    }

    const orderId = await findOrderForTracking({
      order_number: orderNumber,
      customer_email: email || null,
      customer_phone: phone || null,
    });

    redirect(`/orders/${orderId}`);
  }

  return (
    <div className="min-h-screen bg-(--st-bg)">
      <div className="mx-auto w-full max-w-xl px-6 py-10">
        <header className="flex items-center justify-between gap-4">
          <Link href="/" className="text-sm font-semibold tracking-tight text-(--st-text)">
            spacetrip
          </Link>
          <Button asChild variant="outline" className="h-9">
            <Link href="/products">Shop</Link>
          </Button>
        </header>

        <div className="mt-8">
          <h1 className="text-2xl font-semibold tracking-tight text-(--st-text)">
            Track your order
          </h1>
          <p className="mt-2 text-sm text-(--st-text-muted)">
            Enter your order number and the email/phone you used at checkout.
          </p>
        </div>

        <section className="mt-6 rounded-xl border border-(--st-border) bg-white p-6 shadow-[0_4px_16px_rgba(17,24,39,0.04)]">
          <form action={trackAction} className="grid gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-(--st-text)">Order number</label>
              <Input name="order_number" placeholder="ST-20260523-123456" required />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-(--st-text)">Email (optional)</label>
              <Input name="email" type="email" placeholder="you@email.com" />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-(--st-text)">Phone (optional)</label>
              <Input name="phone" placeholder="08xxxxxxxxxx" />
              <div className="text-xs text-(--st-text-muted)">
                Provide at least one: email or phone.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button asChild variant="outline" className="h-10">
                <Link href="/products">Back to products</Link>
              </Button>
              <SubmitButton pendingText="Searching...">Find order</SubmitButton>
            </div>
          </form>
        </section>

        <p className="mt-4 text-xs text-(--st-text-muted)">
          Tip: after checkout, you’ll also get redirected to your order page directly.
        </p>
      </div>
    </div>
  );
}
