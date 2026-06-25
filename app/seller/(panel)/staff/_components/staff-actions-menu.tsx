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
        className="h-8 w-8"
        aria-label="Buka aksi user"
        onClick={() => setMenuOpen((open) => !open)}
      >
        <MoreHorizontal className="h-4 w-4" />
      </Button>

      {menuOpen ? (
        <div className="absolute right-0 top-9 z-20 w-36 overflow-hidden rounded-md border border-(--st-border) bg-white py-1 shadow-[0_8px_24px_rgba(17,24,39,0.08)]">
          <button
            type="button"
            className="block w-full px-3 py-2 text-left text-sm text-(--st-text) hover:bg-[#F7F8FA]"
            onClick={() => {
              setMenuOpen(false);
              setEditOpen(true);
            }}
          >
            Edit
          </button>
        </div>
      ) : null}

      {editOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 py-8">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`edit-user-title-${member.id}`}
            className="flex max-h-[calc(100vh-4rem)] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-(--st-border) bg-white shadow-[0_24px_64px_rgba(17,24,39,0.25)]"
          >
            <div className="flex items-start justify-between gap-4 border-b border-(--st-border) px-6 py-4">
              <div>
                <h2 id={`edit-user-title-${member.id}`} className="text-base font-semibold text-(--st-text)">
                  Edit User
                </h2>
                <p className="mt-1 text-xs text-(--st-text-muted)">
                  Ubah profil dan role untuk {member.email ?? "user ini"}.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-(--st-text-muted) transition-colors hover:bg-[#F7F8FA] hover:text-(--st-text)"
                aria-label="Tutup modal edit"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form action={action} className="flex min-h-0 flex-1 flex-col">
              <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
                <div className="grid gap-4">
                  <input type="hidden" name="user_id" value={member.id} />

                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-(--st-text)">Email</label>
                    <Input value={member.email ?? ""} disabled className="bg-[#F7F8FA]" />
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-(--st-text)">Nama</label>
                    <Input name="full_name" defaultValue={member.full_name ?? ""} placeholder="Nama" />
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-(--st-text)">No. HP</label>
                    <Input name="phone" defaultValue={member.phone ?? ""} placeholder="No. HP" />
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-(--st-text)">Role</label>
                    <select
                      name="role"
                      defaultValue={member.role}
                      className="h-10 rounded-md border border-(--st-border) bg-white px-3 text-sm text-(--st-text) focus:outline-none focus:ring-2 focus:ring-(--st-accent) focus:ring-offset-2 focus:ring-offset-white"
                    >
                      <option value="seller">Karyawan</option>
                      <option value="admin">Super Admin</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 items-center justify-end gap-2 border-t border-(--st-border) bg-white px-6 py-4">
                <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                  Batal
                </Button>
                <SubmitButton pendingText="Menyimpan...">Simpan</SubmitButton>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
