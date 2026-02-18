import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { routeMeta, getRouteMeta, SITE_URL } from '../src/seo/routeMeta.js';

const distDir = 'dist';
const template = readFileSync(join(distDir, 'index.html'), 'utf-8');

function replaceMetaTag(html, selector, attr, value) {
  // Handle both <meta name="..."> and <meta property="...">
  const nameMatch = selector.match(/(?:name|property)="([^"]+)"/);
  if (nameMatch) {
    const attrType = selector.includes('property=') ? 'property' : 'name';
    const regex = new RegExp(
      `(<meta\\s+${attrType}="${nameMatch[1]}"\\s+${attr}=")[^"]*"`,
      'i'
    );
    if (regex.test(html)) {
      return html.replace(regex, `$1${value}"`);
    }
    // Try reversed attribute order (content before name/property)
    const regexAlt = new RegExp(
      `(<meta\\s+${attr}=")[^"]*("\\s+${attrType}="${nameMatch[1]}")`,
      'i'
    );
    return html.replace(regexAlt, `$1${value}$2`);
  }
  return html;
}

function replaceCanonical(html, url) {
  return html.replace(
    /(<link\s+rel="canonical"\s+href=")[^"]*"/i,
    `$1${url}"`
  );
}

function replaceTitle(html, title) {
  return html.replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`);
}

for (const route of routeMeta) {
  if (route.path === '/') continue; // Homepage is already dist/index.html

  const meta = getRouteMeta(route.path);
  if (!meta) continue;

  let html = template;
  html = replaceTitle(html, meta.title);
  html = replaceMetaTag(html, 'name="title"', 'content', meta.title);
  html = replaceMetaTag(html, 'name="description"', 'content', meta.description);
  html = replaceCanonical(html, meta.url);
  // OG tags
  html = replaceMetaTag(html, 'property="og:title"', 'content', meta.title);
  html = replaceMetaTag(html, 'property="og:description"', 'content', meta.description);
  html = replaceMetaTag(html, 'property="og:url"', 'content', meta.url);
  // Twitter tags
  html = replaceMetaTag(html, 'property="twitter:title"', 'content', meta.title);
  html = replaceMetaTag(html, 'property="twitter:description"', 'content', meta.description);
  html = replaceMetaTag(html, 'property="twitter:url"', 'content', meta.url);

  const dir = join(distDir, route.path.slice(1));
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), html);
}

console.log(`Pre-rendered meta tags for ${routeMeta.length - 1} routes.`);
