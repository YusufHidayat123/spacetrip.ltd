import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart/cart-context";
import { CartDrawer } from "@/components/storefront/cart-drawer";
import { ProductQuickViewModal } from "@/components/storefront/product-quick-view";
import { StoreToast } from "@/components/storefront/store-toast";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "spacetrip. — Indonesian Curated Thrift & Local Streetwear",
  description:
    "Curated Indonesian thrift and local streetwear destination. Limited pieces, transparent grading, urban silhouettes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${plusJakarta.variable} ${dmSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-(--st-bg) text-(--st-text) selection:bg-[#FF5500] selection:text-white">
        <CartProvider>
          {children}
          <CartDrawer />
          <ProductQuickViewModal />
          <StoreToast />
        </CartProvider>
      </body>
    </html>
  );
}
