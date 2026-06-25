export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { ShieldCheck, UserPlus } from "lucide-react";

import { SubmitButton } from "@/components/form/submit-button";
import { Breadcrumb } from "@/components/seller/breadcrumb";
import { PageHeader } from "@/components/seller/page-header";
import { PageShell } from "@/components/seller/page-shell";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
        title="Staff & Role Access"
        badge={<Badge variant="purple">Super Admin only</Badge>}
        breadcrumb={
          <Breadcrumb
            items={[
              { label: "admin", href: "/seller" },
              { label: "staff" },
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

      <div className="mt-6 grid gap-6 xl:grid-cols-[420px_1fr]">
        <section className="rounded-xl border border-(--st-border) bg-white p-6 shadow-[0_4px_16px_rgba(17,24,39,0.04)]">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-(--st-accent-soft) text-(--st-text)">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-(--st-text)">
                Daftarkan akun admin/karyawan
              </div>
              <div className="mt-1 text-xs text-(--st-text-muted)">
                Akun dibuat langsung di Supabase Auth dan otomatis diberi role di tabel profiles.
              </div>
            </div>
          </div>

          <form action={createStaffAction} className="mt-5 grid gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-(--st-text)">Nama</label>
              <Input name="full_name" placeholder="Nama lengkap" />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-(--st-text)">Email</label>
              <Input name="email" type="email" required placeholder="staff@spacetrip.test" />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-(--st-text)">No. HP</label>
              <Input name="phone" placeholder="Opsional" />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-(--st-text)">Role</label>
              <select
                name="role"
                defaultValue="seller"
                className="h-10 rounded-md border border-(--st-border) bg-white px-3 text-sm text-(--st-text) focus:outline-none focus:ring-2 focus:ring-(--st-accent) focus:ring-offset-2 focus:ring-offset-white"
              >
                <option value="seller">Karyawan</option>
                <option value="admin">Super Admin</option>
              </select>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-(--st-text)">Password awal</label>
              <Input name="password" type="password" required minLength={8} placeholder="Minimal 8 karakter" />
              <div className="text-[11px] text-(--st-text-muted)">
                Bagikan password ini secara aman. Staff bisa login lewat halaman seller login.
              </div>
            </div>

            <SubmitButton pendingText="Membuat akun...">Buat akun</SubmitButton>
          </form>
        </section>

        <section className="rounded-xl border border-(--st-border) bg-white p-6 shadow-[0_4px_16px_rgba(17,24,39,0.04)]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-(--st-text)">
                <ShieldCheck className="h-4 w-4" />
                Daftar akun internal
              </div>
              <div className="mt-1 text-xs text-(--st-text-muted)">
                Hanya akun dengan role {ROLE_LABELS.admin} atau {ROLE_LABELS.seller} yang ditampilkan.
              </div>
            </div>
            <Badge variant="neutral">{team.length} akun</Badge>
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
                      Belum ada akun internal.
                    </TableCell>
                  </TableRow>
                ) : (
                  team.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <form id={`staff-${member.id}`} action={updateStaffAction} className="grid gap-2">
                          <input type="hidden" name="user_id" value={member.id} />
                          <Input name="full_name" defaultValue={member.full_name ?? ""} placeholder="Nama" className="h-9" />
                          <div className="text-xs text-(--st-text-muted)">{member.email ?? "—"}</div>
                        </form>
                      </TableCell>
                      <TableCell>
                        <div className="grid gap-2">
                          <RoleBadge role={member.role} />
                          <select
                            form={`staff-${member.id}`}
                            name="role"
                            defaultValue={member.role}
                            className="h-9 rounded-md border border-(--st-border) bg-white px-2 text-xs text-(--st-text)"
                          >
                            <option value="seller">Karyawan</option>
                            <option value="admin">Super Admin</option>
                          </select>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input
                          form={`staff-${member.id}`}
                          name="phone"
                          defaultValue={member.phone ?? ""}
                          placeholder="No. HP"
                          className="h-9"
                        />
                      </TableCell>
                      <TableCell className="text-xs text-(--st-text-muted)">
                        <div>Dibuat: {formatDateTime(member.created_at)}</div>
                        <div className="mt-1">
                          Login terakhir: {member.last_sign_in_at ? formatDateTime(member.last_sign_in_at) : "—"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <SubmitButton form={`staff-${member.id}`} size="sm" variant="outline" pendingText="...">
                          Simpan
                        </SubmitButton>
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
