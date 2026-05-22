import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/api/profile-guard";
import {
  badRequest,
  fromZodError,
  internalError,
  notFound,
} from "@/lib/api/errors";
import { updateProfileSchema } from "@/lib/validation/profile";
import { serializeProfile } from "@/lib/api/profile-serialize";

export const dynamic = "force-dynamic";

const PROFILE_SELECT = {
  id: true,
  email: true,
  name: true,
  phone: true,
  deliveryRegion: true,
  deliveryCity: true,
  deliveryNovaPoshtaWarehouse: true,
} as const;

export async function GET() {
  const guard = await requireSessionUser();
  if (!guard.ok) return guard.response;

  try {
    const user = await prisma.user.findUnique({
      where: { id: guard.user.id },
      select: PROFILE_SELECT,
    });
    if (!user) return notFound("User not found");
    return NextResponse.json(serializeProfile(user));
  } catch (err) {
    console.error("GET /api/profile failed", err);
    return internalError();
  }
}

export async function PATCH(req: NextRequest) {
  const guard = await requireSessionUser();
  if (!guard.ok) return guard.response;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest("Body must be valid JSON");
  }

  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) return fromZodError(parsed.error);

  try {
    const updated = await prisma.user.update({
      where: { id: guard.user.id },
      data: {
        name: parsed.data.name,
        phone: parsed.data.phone,
        deliveryRegion: parsed.data.deliveryRegion,
        deliveryCity: parsed.data.deliveryCity,
        deliveryNovaPoshtaWarehouse: parsed.data.deliveryNovaPoshtaWarehouse,
      },
      select: PROFILE_SELECT,
    });
    return NextResponse.json(serializeProfile(updated));
  } catch (err) {
    console.error("PATCH /api/profile failed", err);
    return internalError();
  }
}
