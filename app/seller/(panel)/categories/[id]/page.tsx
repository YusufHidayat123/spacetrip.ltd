export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";

import { Breadcrumb } from "@/components/seller/breadcrumb";
import { PageHeader } from "@/components/seller/page-header";
import { PageShell } from "@/components/seller/page-shell";
import { adminGetCategory, adminUpdateCategory } from "@/lib/catalog/admin";
import { categorySchema } from "@/lib/catalog/validation";

import { CategoryForm } from "../_components/category-form";

export default async function CategoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = await adminGetCategory(id);

  async function updateCategoryAction(formData: FormData) {
    "use server";

    const values = {
      name: String(formData.get("name") ?? ""),
      slug: String(formData.get("slug") ?? ""),
      is_active: formData.get("is_active") === "on",
    };

    const parsed = categorySchema.safeParse(values);
    if (!parsed.success) throw new Error("Input kategori tidak valid");

    await adminUpdateCategory(id, parsed.data);
    redirect("/seller/categories");
  }

  return (
    <PageShell>
      <PageHeader
        title="Kelola Kategori"
        breadcrumb={
          <Breadcrumb
            items={[
              { label: "admin", href: "/seller" },
              { label: "kategori", href: "/seller/categories" },
              { label: category.name },
            ]}
          />
        }
      />

      <section className="mt-6 rounded-xl border border-(--st-border) bg-white p-6 shadow-[0_4px_16px_rgba(17,24,39,0.04)]">
        <CategoryForm
          defaultValues={category}
          submitLabel="Simpan"
          action={updateCategoryAction}
        />
      </section>
    </PageShell>
  );
}
