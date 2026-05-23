import { PageShell } from "@/components/seller/page-shell";
import { PageHeader } from "@/components/seller/page-header";
import { Breadcrumb } from "@/components/seller/breadcrumb";
import { Badge } from "@/components/ui/badge";

export default function SellerDashboardPage() {
  return (
    <PageShell>
      <PageHeader
        title="Dashboard"
        badge={<Badge>Overview</Badge>}
        breadcrumb={<Breadcrumb items={[{ label: "seller", href: "/seller" }, { label: "dashboard" }]} />}
      />
      <div className="mt-6 rounded-xl border border-[color:var(--st-border)] bg-white p-6 shadow-[0_4px_16px_rgba(17,24,39,0.04)]">
        <div className="text-sm text-[color:var(--st-text-muted)]">
          Dashboard will be filled with metrics (new orders, stock alerts, recent activity).
        </div>
      </div>
    </PageShell>
  );
}
