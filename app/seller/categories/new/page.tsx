export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";

import { Breadcrumb } from "@/components/seller/breadcrumb";
import { PageHeader } from "@/components/seller/page-header";
import { PageShell } from "@/components/seller/page-shell";
import { adminCreateCategory } from "@/lib/catalog/admin";
import { categorySchema } from "@/lib/catalog/validation";

import { CategoryForm } from "../_components/category-form";

export default function NewCategoryPage() {
  async function createCategoryAction(formData: FormData) {
    "use server";

    const values = {
      name: String(formData.get("name") ?? ""),
      slug: String(formData.get("slug") ?? ""),
      is_active: formData.get("is_active") === "on",
    };

    const parsed = categorySchema.safeParse(values);
    if (!parsed.success) throw new Error("Invalid category input");

    await adminCreateCategory(parsed.data);
    redirect("/seller/categories");
  }

  return (
    <PageShell>
      <PageHeader
        title="New Category"
        breadcrumb={
          <Breadcrumb
            items={[
              { label: "seller", href: "/seller" },
              { label: "category", href: "/seller/categories" },
              { label: "new" },
            ]}
          />
        }
      />

      <section className="mt-6 rounded-xl border border-[color:var(--st-border)] bg-white p-6 shadow-[0_4px_16px_rgba(17,24,39,0.04)]">
        <CategoryForm submitLabel="Create" action={createCategoryAction} />
      </section>
    </PageShell>
  );
}
