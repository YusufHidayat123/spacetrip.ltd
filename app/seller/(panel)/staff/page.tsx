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
import { ROLE_LABELS, requireSuperAdmin, type StaffRole } from "@/lib/auth/roles";
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
    <Badge variant="purple">Super Admin</Badge>
  ) : (
    <Badge variant="blue">Karyawan</Badge>
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
        title="Kelola User"
        badge={<Badge variant="purple">Super Admin only</Badge>}
        breadcrumb={
          <Breadcrumb
            items={[
              { label: "admin", href: "/seller" },
              { label: "kelola user" },
            ]}
          />
        }
      />

      {status === "created" ? (
        <div className="mt-6 rounded-lg border border-[#D1FAE5] bg-[#ECFDF5] px-4 py-3 text-sm text-[#047857]">
          Akun staff berhasil dibuat.
        </div>
      ) : status === "updated" ? (
        <div className="mt-6 rounded-lg border border-[#DBEAFE] bg-[#EFF6FF] px-4 py-3 text-sm text-[#1D4ED8]">
          Role/profil staff berhasil diperbarui.
        </div>
      ) : null}

      <div className="mt-6 grid gap-6">
        <section className="rounded-xl border border-(--st-border) bg-white p-6 shadow-[0_4px_16px_rgba(17,24,39,0.04)]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-(--st-text)">
                <ShieldCheck className="h-4 w-4" />
                Daftar user internal
              </div>
              <div className="mt-1 text-xs text-(--st-text-muted)">
                Hanya akun dengan role {ROLE_LABELS.admin} atau {ROLE_LABELS.seller} yang ditampilkan.
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="neutral">{team.length} akun</Badge>
              <AddUserModal action={createStaffAction} />
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-lg border border-(--st-border)">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Akun</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Kontak</TableHead>
                  <TableHead>Aktivitas</TableHead>
                  <TableHead className="w-32">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {team.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-sm text-(--st-text-muted)">
                      Belum ada user internal.
                    </TableCell>
                  </TableRow>
                ) : (
                  team.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="font-medium text-(--st-text)">
                          {member.full_name || "—"}
                        </div>
                        <div className="mt-1 text-xs text-(--st-text-muted)">
                          {member.email ?? "—"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <RoleBadge role={member.role} />
                      </TableCell>
                      <TableCell className="text-sm text-(--st-text-muted)">
                        {member.phone || "—"}
                      </TableCell>
                      <TableCell className="text-xs text-(--st-text-muted)">
                        <div>Dibuat: {formatDateTime(member.created_at)}</div>
                        <div className="mt-1">
                          Login terakhir: {member.last_sign_in_at ? formatDateTime(member.last_sign_in_at) : "—"}
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
          </div>
        </section>
      </div>
    </PageShell>
  );
}
