import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Spacetrip Admin",
};

// NOTE:
// Seller panel UI (sidebar, counts, etc) lives in `app/seller/(panel)/layout.tsx`.
// This top-level layout stays minimal so `/seller/login` doesn't render the admin sidebar.
export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
