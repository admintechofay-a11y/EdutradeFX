import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://edutradefx.com';

  const routes = [
    '',
    '/brokers',
    '/brokers/compare',
    '/compare',
    '/courses',
    '/account-managers',
    '/signal-providers',
    '/complaint-box',
    '/advertise',
    '/blog',
    '/about',
    '/contact',
    '/terms',
    '/privacy',
    '/risk-disclaimer',
    '/login',
    '/register',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : (route === '/brokers' || route === '/complaint-box' ? 0.9 : 0.8),
  }));

  return routes;
}
