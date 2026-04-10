import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  experimental: {
    inlineCss: true,
  },
  images: {
    qualities: [70, 72, 75, 76],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'web-site.website',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
      {
        protocol: 'https',
        hostname: 'dmyr5rcjsjpgfdx8.public.blob.vercel-storage.com',
      },
    ],
  },
};

export default nextConfig;
