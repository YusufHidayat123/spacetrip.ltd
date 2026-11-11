"use client";

import * as React from "react";
import { Plus, X } from "lucide-react";

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
      <Button
        type="button"
        onClick={() => setOpen(true)}
        className="h-10 rounded-full bg-[#0D0D0D] px-5 font-mono-label text-[11px] font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#FF5500]"
      >
        <Plus className="h-3.5 w-3.5" />
        Tambah User
      </Button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 py-8 backdrop-blur-xs">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-user-title"
            className="flex max-h-[calc(100vh-4rem)] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-(--st-border) bg-white shadow-[0_24px_64px_rgba(13,13,13,0.28)]"
          >
            <div className="flex items-start justify-between gap-4 border-b border-(--st-border) px-6 py-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#FF5500]" aria-hidden>
                    &#10035;
                  </span>
                  <span className="font-mono-label text-[10px] font-semibold uppercase tracking-[0.12em] text-(--st-text-muted)">
                    [Staff Provisioning]
                  </span>
                </div>
                <h2
                  id="add-user-title"
                  className="mt-1 font-display text-lg font-medium tracking-tight text-[#0D0D0D]"
                >
                  Tambah User Internal
                </h2>
                <p className="mt-1 text-xs text-(--st-text-muted)">
                  Daftarkan email karyawan sebagai role seller, atau buat Super Admin lain jika diperlukan.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-(--st-border) text-(--st-text-muted) transition hover:border-[#0D0D0D] hover:bg-(--st-bg) hover:text-[#0D0D0D]"
                aria-label="Tutup modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form action={action} className="flex min-h-0 flex-1 flex-col">
              <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
                <div className="grid gap-4">
                  <div className="grid gap-1.5">
                    <label className="font-mono-label text-[10px] font-semibold uppercase tracking-[0.12em] text-(--st-text)">
                      Nama
                    </label>
                    <Input
                      name="full_name"
                      placeholder="Nama lengkap"
                      className="rounded-xl bg-(--st-bg)"
                    />
                  </div>

                  <div className="grid gap-1.5">
                    <label className="font-mono-label text-[10px] font-semibold uppercase tracking-[0.12em] text-(--st-text)">
                      Email user
                    </label>
                    <Input
                      name="email"
                      type="email"
                      required
                      placeholder="karyawan@spacetrip.test"
                      className="rounded-xl bg-(--st-bg)"
                    />
                  </div>

                  <div className="grid gap-1.5">
                    <label className="font-mono-label text-[10px] font-semibold uppercase tracking-[0.12em] text-(--st-text)">
                      No. HP
                    </label>
                    <Input
                      name="phone"
                      placeholder="Opsional"
                      className="rounded-xl bg-(--st-bg)"
                    />
                  </div>

                  <div className="grid gap-1.5">
                    <label className="font-mono-label text-[10px] font-semibold uppercase tracking-[0.12em] text-(--st-text)">
                      Role
                    </label>
                    <select
                      name="role"
                      defaultValue="seller"
                      className="h-10 rounded-xl border border-(--st-border) bg-(--st-bg) px-3.5 text-sm text-[#0D0D0D] focus:border-[#0D0D0D] focus:outline-none focus:ring-2 focus:ring-[#FF5500]/25"
                    >
                      <option value="seller">Karyawan</option>
                      <option value="admin">Super Admin</option>
                    </select>
                  </div>

                  <div className="grid gap-1.5">
                    <label className="font-mono-label text-[10px] font-semibold uppercase tracking-[0.12em] text-(--st-text)">
                      Password awal
                    </label>
                    <Input
                      name="password"
                      type="password"
                      required
                      minLength={8}
                      placeholder="Minimal 8 karakter"
                      className="rounded-xl bg-(--st-bg)"
                    />
                    <div className="text-[11px] text-(--st-text-muted)">
                      Bagikan password ini secara aman. Karyawan bisa login lewat halaman seller login.
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap items-center justify-end gap-2.5 border-t border-(--st-border) bg-white px-6 py-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="h-10 rounded-full px-5 font-mono-label text-[11px] font-semibold uppercase tracking-[0.12em]"
                >
                  Batal
                </Button>
                <SubmitButton
                  pendingText="Membuat akun..."
                  className="h-10 rounded-full bg-[#0D0D0D] px-6 font-mono-label text-[11px] font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#FF5500]"
                >
                  Buat akun
                </SubmitButton>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
