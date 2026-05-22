import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/api/profile-guard";
import {
  badRequest,
  fromZodError,
  internalError,
  notFound,
  unauthorized,
} from "@/lib/api/errors";
import { changePasswordSchema } from "@/lib/validation/profile";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const guard = await requireSessionUser();
  if (!guard.ok) return guard.response;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest("Body must be valid JSON");
  }

  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) return fromZodError(parsed.error);

  try {
    const user = await prisma.user.findUnique({
      where: { id: guard.user.id },
      select: { id: true, passwordHash: true },
    });
    if (!user) return notFound("User not found");

    const matches = await verifyPassword(
      parsed.data.currentPassword,
      user.passwordHash,
    );
    if (!matches) {
      return unauthorized("Current password is incorrect");
    }

    const newHash = await hashPassword(parsed.data.newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("POST /api/profile/password failed", err);
    return internalError();
  }
}
