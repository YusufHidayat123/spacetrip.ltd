import { NextResponse } from "next/server";

import { getPublicProductImageUrl, publicListActiveProducts } from "@/lib/catalog/public";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") ?? "").trim();
    const limitParam = Number(searchParams.get("limit") ?? "6");
    const limit = Number.isFinite(limitParam) ? Math.min(Math.max(1, limitParam), 12) : 6;

    const products = await publicListActiveProducts({
      q: q || undefined,
      sort: q ? "featured" : "newest",
      limit,
    });

    const items = products.map((p) => {
      const imgs = (p.product_images ?? [])
        .slice()
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
      const hero = imgs[0];
      return {
        id: p.id,
        slug: p.slug,
        name: p.name,
        price: p.price,
        original_price: p.original_price,
        condition: p.condition,
        color: p.color,
        badge: p.badge,
        categoryName: p.categories?.name ?? null,
        imageUrl: hero ? getPublicProductImageUrl(hero.storage_path) : "",
      };
    });

    return NextResponse.json({ items }, { status: 200 });
  } catch (err) {
    console.error("Search API error:", err);
    return NextResponse.json({ items: [] }, { status: 500 });
  }
}

