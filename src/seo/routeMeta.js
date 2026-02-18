const SITE_NAME = 'Stingr';
const SITE_URL = 'https://stingr.dev';

export const defaultMeta = {
  title: 'Stingr - Free Private Developer Tools | JSON Viewer, Hash Generator, Encoder & More',
  description: '100% client-side developer toolkit — your data never leaves the browser. Fast JSON tree viewer for large files, privacy-focused hash generator, Base64/URL encoder, UUID/ULID/NanoID generator, text diff, QR codes, and 40+ more tools. Free, open-source, no sign-up.',
};

export const routeMeta = [
  {
    path: '/',
    title: 'JSON Viewer & Tree Explorer',
    description: 'Free online JSON viewer and tree explorer. Paste or drag-drop JSON to visualize, search, pin nodes, and navigate large files. 100% client-side.',
    priority: 1.0,
    changefreq: 'weekly',
  },
  {
    path: '/compare',
    title: 'JSON Compare & Diff',
    description: 'Compare two JSON objects side-by-side with differences highlighted inline. Free browser-based JSON diff tool.',
    priority: 0.8,
    changefreq: 'weekly',
  },
  {
    path: '/generate',
    title: 'UUID, API Key & QR Generators',
    description: 'Generate UUIDs, ULIDs, NanoIDs, API keys, passwords, QR codes, Lorem Ipsum, fake data, and color palettes. All local in-browser.',
    priority: 0.8,
    changefreq: 'weekly',
  },
  {
    path: '/encode',
    title: 'Base64, URL & JWT Encoder',
    description: 'Encode and decode Base64, URLs, HTML entities, JWT tokens, hex, Unicode escapes, and Markdown. Free client-side tools.',
    priority: 0.8,
    changefreq: 'weekly',
  },
  {
    path: '/hash',
    title: 'SHA-256, MD5 & Hash Generator',
    description: 'Generate MD5, SHA-1, SHA-256, SHA-512 hashes and HMAC signatures. Privacy-focused — all hashing in-browser.',
    priority: 0.8,
    changefreq: 'weekly',
  },
  {
    path: '/convert',
    title: 'Timestamp, Color & Unit Converters',
    description: 'Convert Unix timestamps, colors, number bases, byte sizes, JSON/YAML, CSV/JSON, and cron expressions.',
    priority: 0.8,
    changefreq: 'weekly',
  },
  {
    path: '/text',
    title: 'Text Diff, Sort & Transform Tools',
    description: 'Compare text diffs, sort/deduplicate lines, find & replace, count words, reverse text, transform case.',
    priority: 0.8,
    changefreq: 'weekly',
  },
  {
    path: '/format',
    title: 'JSON, XML & Code Formatter',
    description: 'Format and beautify JSON, XML, SQL, CSS, and HTML. Minify or pretty-print with one click.',
    priority: 0.8,
    changefreq: 'weekly',
  },
  {
    path: '/privacy',
    title: 'Privacy Policy',
    description: 'Stingr.dev privacy policy. All data processing happens locally in your browser.',
    priority: 0.2,
    changefreq: 'yearly',
  },
  {
    path: '/terms',
    title: 'Terms of Use',
    description: 'Stingr.dev terms of use. Free developer toolkit provided as-is.',
    priority: 0.2,
    changefreq: 'yearly',
  },
  {
    path: '/contact',
    title: 'Contact',
    description: 'Contact the Stingr.dev team. Report bugs, request features, or contribute on GitHub.',
    priority: 0.3,
    changefreq: 'yearly',
  },
];

export function getRouteMeta(pathname) {
  const route = routeMeta.find((r) => r.path === pathname);
  if (!route) return null;
  const fullTitle = route.path === '/'
    ? defaultMeta.title
    : `${route.title} | ${SITE_NAME}`;
  return {
    title: fullTitle,
    description: route.description,
    url: `${SITE_URL}${route.path === '/' ? '/' : route.path}`,
  };
}

export { SITE_NAME, SITE_URL };
