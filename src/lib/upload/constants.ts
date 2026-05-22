export const UPLOAD_MAX_FILES = 5;
export const UPLOAD_MAX_FILE_SIZE = 5 * 1024 * 1024;
export const UPLOAD_ALLOWED_MIME_PREFIX = "image/";
export const WEBP_QUALITY = 80;

export type ResizedVariant = "thumbnail" | "card" | "full";
export type Variant = "original" | ResizedVariant;

export const VARIANT_SIZES: Record<ResizedVariant, { width: number; height: number }> = {
  thumbnail: { width: 200, height: 200 },
  card: { width: 600, height: 400 },
  full: { width: 1200, height: 800 },
};

export const ALL_VARIANTS: readonly Variant[] = [
  "original",
  "thumbnail",
  "card",
  "full",
] as const;
