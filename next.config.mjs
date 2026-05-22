import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Vercel Blob storage (used by /api/upload — see PUZ-13)
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      // Unsplash (used by seed data — see PUZ-38)
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default withNextIntl(nextConfig);
