type APIRoute = () => Promise<Response>;

const STATIC_ROUTES = [
  { url: '/', changefreq: 'daily', priority: '1.0' },
  { url: '/engines/true-cost', changefreq: 'daily', priority: '0.9' },
  { url: '/engines/ghost-auditor', changefreq: 'daily', priority: '0.9' },
  { url: '/engines/landed-cost', changefreq: 'daily', priority: '0.9' },
  { url: '/engines/anomaly-radar', changefreq: 'daily', priority: '0.9' },
  { url: '/solutions/consumers', changefreq: 'weekly', priority: '0.8' },
  { url: '/solutions/merchants', changefreq: 'weekly', priority: '0.8' },
  { url: '/pricing', changefreq: 'weekly', priority: '0.8' },
  { url: '/network/coverage', changefreq: 'daily', priority: '0.8' },
  { url: '/changelog', changefreq: 'weekly', priority: '0.8' },
  { url: '/blog', changefreq: 'weekly', priority: '0.8' },
  { url: '/blog/white-friday-fake-discounts', changefreq: 'monthly', priority: '0.8' },
  { url: '/docs', changefreq: 'weekly', priority: '0.8' },
  { url: '/tracker', changefreq: 'daily', priority: '0.9' },
  { url: '/login', changefreq: 'monthly', priority: '0.5' },
  { url: '/register', changefreq: 'monthly', priority: '0.5' },
];

export const GET: APIRoute = async () => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${STATIC_ROUTES.map(
  (r) => `  <url>
    <loc>https://cawlix.com${r.url}</loc>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`
).join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};
