import { Breadcrumb } from "@/components/seller/breadcrumb";
import { PageHeader } from "@/components/seller/page-header";
import { PageShell } from "@/components/seller/page-shell";

export default function SettingsPage() {
  return (
    <PageShell>
      <PageHeader
        title="Setting"
        breadcrumb={
          <Breadcrumb
            items={[
              { label: "seller", href: "/seller" },
              { label: "setting" },
            ]}
          />
        }
      />

      <div className="mt-6 rounded-xl border border-[color:var(--st-border)] bg-white p-6 shadow-[0_4px_16px_rgba(17,24,39,0.04)]">
        <div className="text-sm text-[color:var(--st-text-muted)]">
          Settings UI will be implemented next.
        </div>
      </div>
    </PageShell>
  );
}
