"use client";

import * as React from "react";
import { X } from "lucide-react";

import { SubmitButton } from "@/components/form/submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AddUserModalProps = {
  action: (formData: FormData) => void | Promise<void>;
};

export function AddUserModal({ action }: AddUserModalProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button type="button" onClick={() => setOpen(true)}>
        Tambah User
      </Button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-user-title"
            className="w-full max-w-lg rounded-xl border border-(--st-border) bg-white shadow-[0_24px_64px_rgba(17,24,39,0.25)]"
          >
            <div className="flex items-start justify-between gap-4 border-b border-(--st-border) px-6 py-4">
              <div>
                <h2 id="add-user-title" className="text-base font-semibold text-(--st-text)">
                  Tambah User Internal
                </h2>
                <p className="mt-1 text-xs text-(--st-text-muted)">
                  Daftarkan email karyawan sebagai role seller, atau buat Super Admin lain jika diperlukan.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-(--st-text-muted) transition-colors hover:bg-[#F7F8FA] hover:text-(--st-text)"
                aria-label="Tutup modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form action={action} className="grid gap-4 px-6 py-5">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-(--st-text)">Nama</label>
                <Input name="full_name" placeholder="Nama lengkap" />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium text-(--st-text)">Email user</label>
                <Input name="email" type="email" required placeholder="karyawan@spacetrip.test" />
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
                  Bagikan password ini secara aman. Karyawan bisa login lewat halaman seller login.
                </div>
              </div>

              <div className="mt-2 flex items-center justify-end gap-2 border-t border-(--st-border) pt-4">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Batal
                </Button>
                <SubmitButton pendingText="Membuat akun...">Buat akun</SubmitButton>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
