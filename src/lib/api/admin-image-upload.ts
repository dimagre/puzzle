import type { PuzzleFormImage } from "@/lib/api/admin-puzzle-form";

export interface UploadedImageVariants {
  original: string;
  thumbnail: string;
  card: string;
  full: string;
}

export interface UploadResult {
  uploaded: UploadedImageVariants[];
  /** True when the real /api/upload endpoint isn't available yet (PUZ-13). */
  mocked: boolean;
}

const MAX_BYTES = 5 * 1024 * 1024;

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("read failed"));
    reader.readAsDataURL(file);
  });
}

// TODO(PUZ-13): drop the data-URL fallback once the /api/upload endpoint
// (image optimization + Vercel Blob) lands. The contract — POST multipart
// "files", returns array of { original, thumbnail, card, full } — will not
// change, only the server side switches from mock-missing to real.
async function uploadFilesViaMock(files: File[]): Promise<UploadResult> {
  const uploaded = await Promise.all(
    files.map(async (file): Promise<UploadedImageVariants> => {
      const dataUrl = await fileToDataUrl(file);
      return {
        original: dataUrl,
        thumbnail: dataUrl,
        card: dataUrl,
        full: dataUrl,
      };
    }),
  );
  return { uploaded, mocked: true };
}

export async function uploadPuzzleImages(
  files: File[],
): Promise<UploadResult> {
  if (files.length === 0) return { uploaded: [], mocked: false };
  for (const file of files) {
    if (!file.type.startsWith("image/")) {
      throw new Error(`File "${file.name}" is not an image`);
    }
    if (file.size > MAX_BYTES) {
      throw new Error(`File "${file.name}" exceeds 5MB`);
    }
  }

  const formData = new FormData();
  for (const file of files) formData.append("files", file);

  let res: Response;
  try {
    res = await fetch("/api/upload", { method: "POST", body: formData });
  } catch {
    return uploadFilesViaMock(files);
  }

  if (res.status === 404 || res.status === 405) {
    return uploadFilesViaMock(files);
  }
  if (!res.ok) {
    throw new Error(`Upload failed (HTTP ${res.status})`);
  }
  const data = (await res.json()) as
    | UploadedImageVariants[]
    | { uploaded: UploadedImageVariants[] };
  const uploaded = Array.isArray(data) ? data : data.uploaded;
  return { uploaded, mocked: false };
}

export function variantsToFormImage(
  variant: UploadedImageVariants,
  alt: string,
  altEn: string,
): PuzzleFormImage {
  // We persist the `card` variant as the canonical URL — it's the size used
  // by the catalog grid. The other variants live alongside in Blob storage
  // and are reachable by URL pattern; we only store one URL per image.
  return {
    url: variant.card || variant.original,
    alt,
    altEn,
  };
}
