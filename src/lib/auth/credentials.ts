import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { loginSchema } from "@/lib/validation/auth";
import type { UserRole } from "@prisma/client";

export type AuthorizedUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
};

export async function authorizeWithCredentials(
  credentials: unknown,
): Promise<AuthorizedUser | null> {
  const parsed = loginSchema.safeParse(credentials);
  if (!parsed.success) {
    return null;
  }

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      passwordHash: true,
    },
  });

  if (!user) {
    return null;
  }

  const passwordMatches = await verifyPassword(password, user.passwordHash);
  if (!passwordMatches) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}
