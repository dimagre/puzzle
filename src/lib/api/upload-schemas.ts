import { z } from "zod";

export const deleteUploadSchema = z.object({
  urls: z
    .array(z.string().url().max(2048))
    .min(1, "At least one URL is required")
    .max(50, "At most 50 URLs per request"),
});

export type DeleteUploadInput = z.infer<typeof deleteUploadSchema>;
