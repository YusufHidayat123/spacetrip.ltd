"use client";

import * as React from "react";
import { MoreHorizontal, X } from "lucide-react";

import { SubmitButton } from "@/components/form/submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type StaffRole = "seller" | "admin";

type StaffActionsMenuProps = {
  member: {
    id: string;
    email: string | null;
    role: StaffRole;
    full_name: string | null;
    phone: string | null;
  };
  action: (formData: FormData) => void | Promise<void>;
};

export function StaffActionsMenu({ member, action }: StaffActionsMenuProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);

  return (
    <div className="relative flex justify-end">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-full hover:bg-(--st-bg) hover:text-[#FF5500]"
        aria-label="Buka aksi user"
        onClick={() => setMenuOpen((open) => !open)}
      >
        <MoreHorizontal className="h-4 w-4" />
      </Button>

      {menuOpen ? (
        <div className="absolute right-0 top-9 z-20 w-36 overflow-hidden rounded-2xl border border-(--st-border) bg-white p-1.5 shadow-[0_8px_24px_rgba(13,13,13,0.1)]">
          <button
            type="button"
            className="block w-full rounded-xl px-3 py-2 text-left text-xs font-medium text-[#0D0D0D] transition hover:bg-(--st-bg) hover:text-[#FF5500]"
            onClick={() => {
              setMenuOpen(false);
              setEditOpen(true);
            }}
          >
            Edit User
          </button>
        </div>
      ) : null}

      {editOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 py-8 backdrop-blur-xs">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`edit-user-title-${member.id}`}
            className="flex max-h-[calc(100vh-4rem)] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-(--st-border) bg-white shadow-[0_24px_64px_rgba(13,13,13,0.28)]"
          >
            <div className="flex items-start justify-between gap-4 border-b border-(--st-border) px-6 py-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#FF5500]" aria-hidden>
                    &#10035;
                  </span>
                  <span className="font-mono-label text-[10px] font-semibold uppercase tracking-[0.12em] text-(--st-text-muted)">
                    [Edit Staff Role]
                  </span>
                </div>
                <h2
                  id={`edit-user-title-${member.id}`}
                  className="mt-1 font-display text-lg font-medium tracking-tight text-[#0D0D0D]"
                >
                  Edit User
                </h2>
                <p className="mt-1 text-xs text-(--st-text-muted)">
                  Ubah profil dan role untuk {member.email ?? "user ini"}.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditOpen(false)}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-(--st-border) text-(--st-text-muted) transition hover:border-[#0D0D0D] hover:bg-(--st-bg) hover:text-[#0D0D0D]"
                aria-label="Tutup modal edit"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form action={action} className="flex min-h-0 flex-1 flex-col">
              <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
                <div className="grid gap-4">
                  <input type="hidden" name="user_id" value={member.id} />

                  <div className="grid gap-1.5">
                    <label className="font-mono-label text-[10px] font-semibold uppercase tracking-[0.12em] text-(--st-text)">
                      Email
                    </label>
                    <Input
                      value={member.email ?? ""}
                      disabled
                      className="rounded-xl bg-(--st-bg)"
                    />
                  </div>

                  <div className="grid gap-1.5">
                    <label className="font-mono-label text-[10px] font-semibold uppercase tracking-[0.12em] text-(--st-text)">
                      Nama
                    </label>
                    <Input
                      name="full_name"
                      defaultValue={member.full_name ?? ""}
                      placeholder="Nama"
                      className="rounded-xl bg-(--st-bg)"
                    />
                  </div>

                  <div className="grid gap-1.5">
                    <label className="font-mono-label text-[10px] font-semibold uppercase tracking-[0.12em] text-(--st-text)">
                      No. HP
                    </label>
                    <Input
                      name="phone"
                      defaultValue={member.phone ?? ""}
                      placeholder="No. HP"
                      className="rounded-xl bg-(--st-bg)"
                    />
                  </div>

                  <div className="grid gap-1.5">
                    <label className="font-mono-label text-[10px] font-semibold uppercase tracking-[0.12em] text-(--st-text)">
                      Role
                    </label>
                    <select
                      name="role"
                      defaultValue={member.role}
                      className="h-10 rounded-xl border border-(--st-border) bg-(--st-bg) px-3.5 text-sm text-[#0D0D0D] focus:border-[#0D0D0D] focus:outline-none focus:ring-2 focus:ring-[#FF5500]/25"
                    >
                      <option value="seller">Karyawan</option>
                      <option value="admin">Super Admin</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap items-center justify-end gap-2.5 border-t border-(--st-border) bg-white px-6 py-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditOpen(false)}
                  className="h-10 rounded-full px-5 font-mono-label text-[11px] font-semibold uppercase tracking-[0.12em]"
                >
                  Batal
                </Button>
                <SubmitButton
                  pendingText="Menyimpan..."
                  className="h-10 rounded-full bg-[#0D0D0D] px-6 font-mono-label text-[11px] font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#FF5500]"
                >
                  Simpan
                </SubmitButton>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
