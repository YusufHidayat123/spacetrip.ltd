export function formatIDR(value: string | number) {
  const n = typeof value === "string" ? Number(value) : value;
  return Number.isFinite(n)
    ? new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(n)
    : String(value);
}

export function formatDateTime(value: string) {
  const d = new Date(value);
  return Number.isFinite(d.getTime())
    ? d.toLocaleString("id-ID", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : value;
}
