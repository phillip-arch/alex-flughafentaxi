import { MetadataRoute } from 'next';
import { locationRoutes } from '@/lib/location-pages';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://flughafentaxi-wien.at';
  
  // Static routes
  const routes = [
    '',
    '/preise',
    '/faq',
    '/service',
    '/book',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  const routePages = locationRoutes.map((route) => ({
    url: `${baseUrl}/routes/${route.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.75,
  }));

  return [...routes, ...routePages];
}
