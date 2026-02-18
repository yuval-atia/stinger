import { writeFileSync } from 'fs';
import { routeMeta, SITE_URL } from '../src/seo/routeMeta.js';

const today = new Date().toISOString().split('T')[0];

const urls = routeMeta
  .map(
    (r) => `  <url>
    <loc>${SITE_URL}${r.path === '/' ? '/' : r.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority.toFixed(1)}</priority>
  </url>`
  )
  .join('\n');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

writeFileSync('dist/sitemap.xml', sitemap);
console.log(`Sitemap generated with ${routeMeta.length} routes.`);
