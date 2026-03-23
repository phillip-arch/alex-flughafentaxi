import { fileURLToPath } from 'url';
import { dirname } from 'path';
import withPWAInit from 'next-pwa';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV !== 'production',
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
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

export default withPWA(nextConfig);
