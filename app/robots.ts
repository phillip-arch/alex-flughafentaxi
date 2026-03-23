import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dispatch/',
        '/login',
        '/forgot-password',
        '/update-password',
        '/book/confirm',
        '/book/success',
        '/driver/confirm',
        '/account/',
      ],
    },
    sitemap: 'https://flughafentaxi-wien.at/sitemap.xml',
  };
}
