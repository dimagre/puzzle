import { redirect } from "next/navigation";
import type { Session } from "next-auth";
import { auth } from "@/auth";

export async function getSession(): Promise<Session | null> {
  return auth();
}

export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  if (user.role !== "ADMIN") {
    redirect("/");
  }
  return user;
}

export function isAdmin(
  user: { role?: string | null } | null | undefined,
): boolean {
  return user?.role === "ADMIN";
}
