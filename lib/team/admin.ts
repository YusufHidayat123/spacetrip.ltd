import "server-only";

import type { User } from "@supabase/supabase-js";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { StaffRole } from "@/lib/auth/roles";
import { normalizeRole } from "@/lib/auth/roles";

export type TeamMember = {
  id: string;
  email: string | null;
  role: StaffRole;
  full_name: string | null;
  phone: string | null;
  created_at: string;
  last_sign_in_at: string | null;
};

function userCreatedAt(user: User) {
  return user.created_at ?? new Date(0).toISOString();
}

export async function adminListTeamMembers(): Promise<TeamMember[]> {
  const supabase = createSupabaseAdminClient();

  const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (usersError) throw usersError;

  const users = usersData.users ?? [];
  const ids = users.map((user) => user.id);

  if (ids.length === 0) return [];

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, role, full_name, phone")
    .in("id", ids);
  if (profilesError) throw profilesError;

  const profileById = new Map(
    (profiles ?? []).map((profile) => [
      String(profile.id),
      {
        role: normalizeRole(profile.role),
        full_name: typeof profile.full_name === "string" ? profile.full_name : null,
        phone: typeof profile.phone === "string" ? profile.phone : null,
      },
    ])
  );

  return users
    .map((user) => {
      const profile = profileById.get(user.id);
      const role = normalizeRole(profile?.role);
      if (role !== "admin" && role !== "seller") return null;

      return {
        id: user.id,
        email: user.email ?? null,
        role,
        full_name: profile?.full_name ?? null,
        phone: profile?.phone ?? null,
        created_at: userCreatedAt(user),
        last_sign_in_at: user.last_sign_in_at ?? null,
      } satisfies TeamMember;
    })
    .filter((member): member is TeamMember => member !== null)
    .sort((a, b) => {
      if (a.role !== b.role) return a.role === "admin" ? -1 : 1;
      return a.email?.localeCompare(b.email ?? "") ?? 0;
    });
}

export async function adminCreateStaffAccount(input: {
  email: string;
  password: string;
  role: StaffRole;
  full_name?: string | null;
  phone?: string | null;
}) {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
    user_metadata: {
      full_name: input.full_name ?? null,
    },
  });
  if (error) throw error;
  if (!data.user) throw new Error("Akun berhasil dibuat tapi user tidak ditemukan");

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: data.user.id,
    role: input.role,
    full_name: input.full_name ?? null,
    phone: input.phone ?? null,
  });
  if (profileError) throw profileError;

  return data.user;
}

export async function adminUpdateStaffProfile(
  userId: string,
  input: {
    role: StaffRole;
    full_name?: string | null;
    phone?: string | null;
  }
) {
  const supabase = createSupabaseAdminClient();

  const { error } = await supabase
    .from("profiles")
    .update({
      role: input.role,
      full_name: input.full_name ?? null,
      phone: input.phone ?? null,
    })
    .eq("id", userId);
  if (error) throw error;
}
