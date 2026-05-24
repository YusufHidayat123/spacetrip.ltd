import Image from "next/image";
import Link from "next/link";

import { formatIDR } from "@/lib/orders/format";
import { getPublicProductImageUrl } from "@/lib/catalog/public";

export function ProductCard({
  slug,
  name,
  price,
  image,
}: {
  slug: string;
  name: string;
  price: string;
  image: { storage_path: string; alt: string | null } | null;
}) {
  const imgUrl = image ? getPublicProductImageUrl(image.storage_path) : null;

  return (
    <Link
      href={`/products/${slug}`}
      className="group overflow-hidden rounded-2xl bg-white shadow-[0_10px_24px_rgba(17,24,39,0.08)]"
    >
      <div className="relative aspect-[3/4] w-full bg-[#F7F8FA]">
        {imgUrl ? (
          <Image
            src={imgUrl}
            alt={image?.alt ?? name}
            fill
            sizes="(max-width: 420px) 50vw, 210px"
            className="object-cover transition group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-(--st-text-muted)">
            No image
          </div>
        )}
      </div>

      <div className="p-3">
        <div className="text-sm font-medium leading-snug text-(--st-text)">
          <span className="block overflow-hidden text-ellipsis whitespace-nowrap">
            {name}
          </span>
        </div>
        <div className="mt-1 text-sm font-semibold text-(--st-text)">
          {formatIDR(price)}
        </div>
      </div>
    </Link>
  );
}
