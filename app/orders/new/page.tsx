import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function NewOrderMvpPage() {
  // Deprecated: checkout flow lives in /products/[slug].
  redirect("/products");
}
