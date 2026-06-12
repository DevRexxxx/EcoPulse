import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/dashboard/', '/profile/', '/actions/'],
    },
    sitemap: 'https://ecopulse.app/sitemap.xml',
  };
}
