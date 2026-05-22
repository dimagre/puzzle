import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/api/auth-guard";
import {
  badRequest,
  fromZodError,
  internalError,
} from "@/lib/api/errors";
import { deleteUploadSchema } from "@/lib/api/upload-schemas";
import { deleteBlobs, uploadWebP } from "@/lib/upload/blob-store";
import {
  ALL_VARIANTS,
  UPLOAD_ALLOWED_MIME_PREFIX,
  UPLOAD_MAX_FILE_SIZE,
  UPLOAD_MAX_FILES,
  type Variant,
} from "@/lib/upload/constants";
import { processImageVariants } from "@/lib/upload/process";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface UploadedImageUrls {
  filename: string;
  original: string;
  thumbnail: string;
  card: string;
  full: string;
}

interface FileFailure {
  filename: string;
  error: string;
}

interface UploadResponse {
  uploaded: UploadedImageUrls[];
  failed: FileFailure[];
}

function pathnameFor(
  puzzleId: string,
  variant: Variant,
  filename: string,
): string {
  return `puzzles/${puzzleId}/${variant}/${filename}.webp`;
}

function sanitizePuzzleId(raw: string | null): string {
  if (!raw) return "unassigned";
  const trimmed = raw.trim().slice(0, 64);
  // Allow only alphanumerics, dashes, underscores; collapse the rest to "_".
  const safe = trimmed.replace(/[^a-zA-Z0-9_-]/g, "_");
  return safe.length > 0 ? safe : "unassigned";
}

async function processOne(
  file: File,
  puzzleId: string,
): Promise<UploadedImageUrls> {
  const filename = randomUUID();
  const arrayBuffer = await file.arrayBuffer();
  const variants = await processImageVariants(Buffer.from(arrayBuffer));

  const results = await Promise.all(
    ALL_VARIANTS.map((variant) =>
      uploadWebP(pathnameFor(puzzleId, variant, filename), variants[variant]),
    ),
  );

  const [original, thumbnail, card, full] = results;
  return {
    filename,
    original: original.url,
    thumbnail: thumbnail.url,
    card: card.url,
    full: full.url,
  };
}

export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().startsWith("multipart/form-data")) {
    return badRequest("Content-Type must be multipart/form-data");
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return badRequest("Could not parse multipart body");
  }

  const entries = form.getAll("files").filter((v): v is File => v instanceof File);
  if (entries.length === 0) {
    return badRequest("No files provided in field 'files'");
  }
  if (entries.length > UPLOAD_MAX_FILES) {
    return badRequest(`At most ${UPLOAD_MAX_FILES} files per request`);
  }

  for (const file of entries) {
    if (!file.type || !file.type.toLowerCase().startsWith(UPLOAD_ALLOWED_MIME_PREFIX)) {
      return badRequest(
        `File '${file.name}' has unsupported MIME type '${file.type || "unknown"}'; only image/* is allowed`,
      );
    }
    if (file.size > UPLOAD_MAX_FILE_SIZE) {
      return badRequest(
        `File '${file.name}' exceeds the ${UPLOAD_MAX_FILE_SIZE} byte limit`,
      );
    }
    if (file.size === 0) {
      return badRequest(`File '${file.name}' is empty`);
    }
  }

  const puzzleIdRaw = form.get("puzzleId");
  const puzzleId = sanitizePuzzleId(typeof puzzleIdRaw === "string" ? puzzleIdRaw : null);

  const uploaded: UploadedImageUrls[] = [];
  const failed: FileFailure[] = [];

  const settled = await Promise.allSettled(
    entries.map((file) => processOne(file, puzzleId)),
  );

  settled.forEach((result, idx) => {
    const file = entries[idx];
    if (result.status === "fulfilled") {
      uploaded.push(result.value);
    } else {
      const message =
        result.reason instanceof Error
          ? result.reason.message
          : "Unknown processing error";
      console.error(
        `POST /api/upload failed for '${file.name}'`,
        result.reason,
      );
      failed.push({ filename: file.name, error: message });
    }
  });

  const status = failed.length === 0 ? 201 : 207;
  const body: UploadResponse = { uploaded, failed };
  return NextResponse.json(body, { status });
}

export async function DELETE(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest("Body must be valid JSON");
  }

  const parsed = deleteUploadSchema.safeParse(body);
  if (!parsed.success) return fromZodError(parsed.error);

  try {
    await deleteBlobs(parsed.data.urls);
  } catch (err) {
    console.error("DELETE /api/upload failed", err);
    return internalError();
  }

  return new NextResponse(null, { status: 204 });
}
