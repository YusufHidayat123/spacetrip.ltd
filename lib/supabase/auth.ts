import "server-only";

import { cookies } from "next/headers";

const COOKIE = "st_customer";

export async function requireCustomerLogin(redirectTo: string) {
  const c = await cookies();
  const v = c.get(COOKIE)?.value;
  if (v !== "1") {
    // Use a throw to stop server action / server component flow.
    // Caller should catch/redirect or just redirect directly.
    throw Object.assign(new Error("CUSTOMER_NOT_LOGGED_IN"), {
      code: "CUSTOMER_NOT_LOGGED_IN",
      redirectTo,
    });
  }
}

export async function isCustomerLoggedIn() {
  const c = await cookies();
  return c.get(COOKIE)?.value === "1";
}

export async function setCustomerLoggedIn() {
  const c = await cookies();
  c.set(COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearCustomerLoggedIn() {
  const c = await cookies();
  c.set(COOKIE, "0", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
