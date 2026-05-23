import { Calendar, Download, Filter, Search } from "lucide-react";

import { Breadcrumb } from "@/components/seller/breadcrumb";
import { PageHeader } from "@/components/seller/page-header";
import { PageShell } from "@/components/seller/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type TransactionStatus = "New" | "Successful" | "Pending" | "Rejected";

type TransactionRow = {
  id: string;
  orderNumber: string;
  product: string;
  status: TransactionStatus;
  date: string;
  agent: "System" | string;
};

const rows: TransactionRow[] = [
  {
    id: "t_23456_1",
    orderNumber: "#23456",
    product: "Spacetrip Basic Tee 180gsm — Black",
    status: "New",
    date: "7 min ago",
    agent: "System",
  },
  {
    id: "t_23487_1",
    orderNumber: "#23487",
    product: "Spacetrip Denim Jeans — Indigo 13oz",
    status: "New",
    date: "52 min ago",
    agent: "System",
  },
  {
    id: "t_23504_1",
    orderNumber: "#23504",
    product: "Spacetrip Cargo Pants — Olive",
    status: "New",
    date: "1 day ago",
    agent: "System",
  },
  {
    id: "t_23518_1",
    orderNumber: "#23518",
    product: "Spacetrip Cap — Washed Navy",
    status: "New",
    date: "3 day ago",
    agent: "System",
  },
  {
    id: "t_23527_1",
    orderNumber: "#23527",
    product: "Spacetrip Sneakers — White/Gum",
    status: "New",
    date: "21/01/2024",
    agent: "System",
  },
  {
    id: "t_23531_1",
    orderNumber: "#23531",
    product: "Spacetrip Oversized Tee — Stone",
    status: "New",
    date: "21/01/2024",
    agent: "System",
  },
  {
    id: "t_23548_1",
    orderNumber: "#23548",
    product: "Spacetrip Work Pants — Charcoal",
    status: "New",
    date: "21/01/2024",
    agent: "System",
  },
  {
    id: "t_23552_1",
    orderNumber: "#23552",
    product: "Spacetrip Jeans — Black Rinse",
    status: "Successful",
    date: "21/01/2024",
    agent: "System",
  },
  {
    id: "t_23560_1",
    orderNumber: "#23560",
    product: "Spacetrip Canvas Cap — Off-white",
    status: "Pending",
    date: "21/01/2024",
    agent: "Amir",
  },
  {
    id: "t_23566_1",
    orderNumber: "#23566",
    product: "Spacetrip Tee — Heather Grey",
    status: "Rejected",
    date: "21/01/2024",
    agent: "Amir",
  },
];

function StatusBadge({ status }: { status: TransactionStatus }) {
  const variant =
    status === "New"
      ? "amber"
      : status === "Successful"
        ? "green"
        : status === "Pending"
          ? "purple"
          : "red";

  return <Badge variant={variant}>{status}</Badge>;
}

function AgentPill({ agent }: { agent: TransactionRow["agent"] }) {
  const isSystem = agent === "System";
  return (
    <span
      className={
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium " +
        (isSystem
          ? "border-[color:var(--st-border)] bg-[#F7F8FA] text-[color:var(--st-text-muted)]"
          : "border-[color:var(--st-border)] bg-white text-[color:var(--st-text-muted)]")
      }
    >
      {agent}
    </span>
  );
}

export default function TransactionsPage() {
  return (
    <PageShell>
      <PageHeader
        title="Transaction"
        badge={<Badge variant="amber">12 new</Badge>}
        breadcrumb={
          <Breadcrumb
            items={[
              { label: "seller", href: "/seller" },
              { label: "transaction" },
            ]}
          />
        }
        right={
          <Button variant="outline" className="h-10">
            <Download className="h-4 w-4" />
            Export
          </Button>
        }
      />

      <section className="mt-6 rounded-xl border border-[color:var(--st-border)] bg-white p-6 shadow-[0_4px_16px_rgba(17,24,39,0.04)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-[360px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--st-text-muted)]" />
            <Input placeholder="Search" className="pl-9" />
          </div>

          <div className="flex flex-wrap items-center justify-start gap-3 sm:justify-end">
            <Button variant="outline" className="h-10">
              <Calendar className="h-4 w-4" />
              Select dates
            </Button>

            <div className="w-[170px]">
              <Select defaultValue="new">
                <SelectTrigger aria-label="Status" className="h-10">
                  <SelectValue placeholder="New order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New order</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="successful">Successful</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button className="h-10">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-lg border border-[color:var(--st-border)]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[44px] px-3">
                  <div className="flex items-center justify-center">
                    <Checkbox aria-label="Select all" />
                  </div>
                </TableHead>
                <TableHead>Order Number</TableHead>
                <TableHead>Product</TableHead>
                <TableHead className="w-[140px]">Status</TableHead>
                <TableHead className="w-[140px]">Date</TableHead>
                <TableHead className="w-[140px]">Agent</TableHead>
                <TableHead className="w-[120px]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="w-[44px] px-3">
                    <div className="flex items-center justify-center">
                      <Checkbox aria-label={`Select ${r.orderNumber}`} />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{r.orderNumber}</TableCell>
                  <TableCell className="text-[13px] text-[color:var(--st-text)]">
                    {r.product}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={r.status} />
                  </TableCell>
                  <TableCell className="text-[color:var(--st-text-muted)]">
                    {r.date}
                  </TableCell>
                  <TableCell>
                    <AgentPill agent={r.agent} />
                  </TableCell>
                  <TableCell>
                    <button
                      type="button"
                      className="text-sm font-medium text-[color:var(--st-text)] underline-offset-4 hover:underline"
                    >
                      Action
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-[110px]">
            <Select defaultValue="10">
              <SelectTrigger aria-label="Rows per page" className="h-9">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-9">
              Previous
            </Button>

            <div className="flex items-center gap-1">
              {[
                { label: "1", active: true },
                { label: "2" },
                { label: "3" },
                { label: "…" },
                { label: "8" },
                { label: "9" },
                { label: "10" },
              ].map((p, idx) => (
                <button
                  key={`${p.label}-${idx}`}
                  type="button"
                  className={
                    "h-9 min-w-9 rounded-md border px-3 text-sm font-medium " +
                    (p.active
                      ? "border-[color:var(--st-accent-border)] bg-[color:var(--st-accent-soft)] text-[color:var(--st-text)]"
                      : "border-[color:var(--st-border)] bg-white text-[color:var(--st-text-muted)] hover:bg-[#F7F8FA]")
                  }
                  aria-current={p.active ? "page" : undefined}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <Button variant="outline" size="sm" className="h-9">
              Next
            </Button>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
