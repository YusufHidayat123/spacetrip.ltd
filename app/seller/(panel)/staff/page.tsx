export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";

import { Breadcrumb } from "@/components/seller/breadcrumb";
import { PageHeader } from "@/components/seller/page-header";
import { PageShell } from "@/components/seller/page-shell";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ROLE_LABELS,
  requireSuperAdmin,
  type StaffRole,
} from "@/lib/auth/roles";
import {
  adminCreateStaffAccount,
  adminListTeamMembers,
  adminUpdateStaffProfile,
} from "@/lib/team/admin";
import { formatDateTime } from "@/lib/orders/format";
import { AddUserModal } from "./_components/add-user-modal";
import { StaffActionsMenu } from "./_components/staff-actions-menu";

function RoleBadge({ role }: { role: StaffRole }) {
  return role === "admin" ? (
    <Badge variant="dark">Super Admin</Badge>
  ) : (
    <Badge variant="orangeSoft">Karyawan</Badge>
  );
}

function parseStaffRole(value: FormDataEntryValue | null): StaffRole {
  return value === "admin" ? "admin" : "seller";
}

export default async function StaffPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireSuperAdmin();

  const sp = await searchParams;
  const status = typeof sp.status === "string" ? sp.status : "";
  const team = await adminListTeamMembers();

  async function createStaffAction(formData: FormData) {
    "use server";

    await requireSuperAdmin();

    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const password = String(formData.get("password") ?? "");
    const role = parseStaffRole(formData.get("role"));
    const full_name_raw = String(formData.get("full_name") ?? "").trim();
    const phone_raw = String(formData.get("phone") ?? "").trim();

    if (!email) throw new Error("Email wajib diisi");
    if (password.length < 8) throw new Error("Password minimal 8 karakter");

    await adminCreateStaffAccount({
      email,
      password,
      role,
      full_name: full_name_raw.length ? full_name_raw : null,
      phone: phone_raw.length ? phone_raw : null,
    });

    redirect("/seller/staff?status=created");
  }

  async function updateStaffAction(formData: FormData) {
    "use server";

    const current = await requireSuperAdmin();

    const userId = String(formData.get("user_id") ?? "").trim();
    const role = parseStaffRole(formData.get("role"));
    const full_name_raw = String(formData.get("full_name") ?? "").trim();
    const phone_raw = String(formData.get("phone") ?? "").trim();

    if (!userId) throw new Error("User tidak valid");
    if (userId === current.userId && role !== "admin") {
      throw new Error("Super Admin tidak bisa menurunkan role akun sendiri");
    }

    await adminUpdateStaffProfile(userId, {
      role,
      full_name: full_name_raw.length ? full_name_raw : null,
      phone: phone_raw.length ? phone_raw : null,
    });

    redirect("/seller/staff?status=updated");
  }

  return (
    <PageShell>
      <PageHeader
        title="Kelola Tim & Staff"
        description={`Akses terbatas Super Admin untuk mengelola akun ${ROLE_LABELS.admin} dan ${ROLE_LABELS.seller}.`}
        badge={<Badge variant="orangeSoft">Super Admin Only</Badge>}
        breadcrumb={
          <Breadcrumb
            items={[
              { label: "admin", href: "/seller" },
              { label: "kelola tim" },
            ]}
          />
        }
        right={<AddUserModal action={createStaffAction} />}
      />

      {status === "created" ? (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-800">
          Akun staff berhasil dibuat.
        </div>
      ) : status === "updated" ? (
        <div className="mt-6 rounded-2xl border border-(--st-accent-border) bg-(--st-accent-soft) px-4 py-3 text-xs font-medium text-[#CC4400]">
          Role/profil staff berhasil diperbarui.
        </div>
      ) : null}

      <section className="mt-6 overflow-hidden rounded-3xl border border-(--st-border) bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-(--st-border) px-6 py-4">
          <div className="flex items-center gap-2 font-display text-base font-medium tracking-tight text-[#0D0D0D]">
            <ShieldCheck className="h-4 w-4 text-[#FF5500]" />
            Daftar Akun Operasional ({team.length})
          </div>
          <span className="font-mono-label text-[10px] font-semibold uppercase tracking-[0.12em] text-(--st-text-muted)">
            [Team Access Control]
          </span>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Akun</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Kontak</TableHead>
              <TableHead>Aktivitas</TableHead>
              <TableHead className="w-24 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {team.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-10 text-center text-xs text-(--st-text-muted)"
                >
                  Belum ada user internal.
                </TableCell>
              </TableRow>
            ) : (
              team.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="font-medium text-[#0D0D0D]">
                      {member.full_name || "—"}
                    </div>
                    <div className="mt-0.5 text-xs text-(--st-text-muted)">
                      {member.email ?? "—"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <RoleBadge role={member.role} />
                  </TableCell>
                  <TableCell className="text-xs text-(--st-text-muted)">
                    {member.phone || "—"}
                  </TableCell>
                  <TableCell className="text-xs text-(--st-text-muted)">
                    <div>Dibuat: {formatDateTime(member.created_at)}</div>
                    <div className="mt-0.5">
                      Login terakhir:{" "}
                      {member.last_sign_in_at
                        ? formatDateTime(member.last_sign_in_at)
                        : "—"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <StaffActionsMenu member={member} action={updateStaffAction} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </section>
    </PageShell>
  );
}
