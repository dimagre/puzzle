import type { NextResponse } from "next/server";
import { auth } from "@/auth";
import { unauthorized } from "@/lib/api/errors";

export type SessionUserGuardResult =
  | { ok: true; user: { id: string; email: string } }
  | { ok: false; response: NextResponse };

export async function requireSessionUser(): Promise<SessionUserGuardResult> {
  const session = await auth();
  const user = session?.user as
    | { id?: string; email?: string }
    | undefined;

  if (!user || !user.id) {
    return { ok: false, response: unauthorized() };
  }

  return { ok: true, user: { id: user.id, email: user.email ?? "" } };
}
