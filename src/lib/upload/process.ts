import sharp from "sharp";
import { VARIANT_SIZES, WEBP_QUALITY } from "./constants";

export interface ProcessedVariants {
  original: Buffer;
  thumbnail: Buffer;
  card: Buffer;
  full: Buffer;
}

export async function processImageVariants(
  input: Buffer,
): Promise<ProcessedVariants> {
  const webpOpts = { quality: WEBP_QUALITY };

  const [original, thumbnail, card, full] = await Promise.all([
    sharp(input).webp(webpOpts).toBuffer(),
    sharp(input)
      .resize(VARIANT_SIZES.thumbnail.width, VARIANT_SIZES.thumbnail.height, {
        fit: "cover",
      })
      .webp(webpOpts)
      .toBuffer(),
    sharp(input)
      .resize(VARIANT_SIZES.card.width, VARIANT_SIZES.card.height, {
        fit: "cover",
      })
      .webp(webpOpts)
      .toBuffer(),
    sharp(input)
      .resize(VARIANT_SIZES.full.width, VARIANT_SIZES.full.height, {
        fit: "cover",
      })
      .webp(webpOpts)
      .toBuffer(),
  ]);

  return { original, thumbnail, card, full };
}
