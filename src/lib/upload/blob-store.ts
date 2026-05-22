import { del, put, type PutBlobResult } from "@vercel/blob";

function token(): string | undefined {
  // Allow the SDK to fall back to its automatic token discovery when running
  // on Vercel; only forward the env var when explicitly set (e.g. in tests
  // or local development).
  return process.env.BLOB_READ_WRITE_TOKEN;
}

export async function uploadWebP(
  pathname: string,
  body: Buffer,
): Promise<PutBlobResult> {
  return put(pathname, body, {
    access: "public",
    contentType: "image/webp",
    addRandomSuffix: false,
    allowOverwrite: true,
    token: token(),
  });
}

export async function deleteBlobs(urls: string[]): Promise<void> {
  await del(urls, { token: token() });
}
