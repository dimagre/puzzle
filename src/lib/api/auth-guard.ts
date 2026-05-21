import { auth } from "@/auth";
import { forbidden, unauthorized } from "@/lib/api/errors";
import type { NextResponse } from "next/server";

// TODO(PUZ-7): replace with the real session role lookup once the auth
// pipeline (Credentials authorize + JWT/session callbacks) is merged. Until
// then this guard reads `role` from whatever the session callback exposes,
// which is null with the current placeholder authorize() implementation.
export type AdminGuardResult =
  | { ok: true; user: { id: string; email: string; role: "ADMIN" } }
  | { ok: false; response: NextResponse };

export async function requireAdmin(): Promise<AdminGuardResult> {
  const session = await auth();
  const user = session?.user as
    | { id?: string; email?: string; role?: string }
    | undefined;

  if (!user || !user.id) {
    return { ok: false, response: unauthorized() };
  }

  if (user.role !== "ADMIN") {
    return { ok: false, response: forbidden() };
  }

  return {
    ok: true,
    user: { id: user.id, email: user.email ?? "", role: "ADMIN" },
  };
}
