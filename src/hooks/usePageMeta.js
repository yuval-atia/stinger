import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getRouteMeta, defaultMeta, SITE_URL } from '../seo/routeMeta';

function setMetaTag(selector, attribute, value) {
  const el = document.querySelector(selector);
  if (el) el.setAttribute(attribute, value);
}

export function usePageMeta() {
  const { pathname } = useLocation();

  useEffect(() => {
    const meta = getRouteMeta(pathname);

    if (meta) {
      // Known route
      document.title = meta.title;
      setMetaTag('meta[name="title"]', 'content', meta.title);
      setMetaTag('meta[name="description"]', 'content', meta.description);
      setMetaTag('meta[name="robots"]', 'content', 'index, follow');
      setMetaTag('link[rel="canonical"]', 'href', meta.url);
      // OG tags
      setMetaTag('meta[property="og:title"]', 'content', meta.title);
      setMetaTag('meta[property="og:description"]', 'content', meta.description);
      setMetaTag('meta[property="og:url"]', 'content', meta.url);
      // Twitter tags
      setMetaTag('meta[property="twitter:title"]', 'content', meta.title);
      setMetaTag('meta[property="twitter:description"]', 'content', meta.description);
      setMetaTag('meta[property="twitter:url"]', 'content', meta.url);
    } else {
      // 404 / unknown route
      document.title = defaultMeta.title;
      setMetaTag('meta[name="title"]', 'content', defaultMeta.title);
      setMetaTag('meta[name="description"]', 'content', defaultMeta.description);
      setMetaTag('meta[name="robots"]', 'content', 'noindex');
      setMetaTag('link[rel="canonical"]', 'href', `${SITE_URL}/`);
      setMetaTag('meta[property="og:title"]', 'content', defaultMeta.title);
      setMetaTag('meta[property="og:description"]', 'content', defaultMeta.description);
      setMetaTag('meta[property="og:url"]', 'content', `${SITE_URL}/`);
      setMetaTag('meta[property="twitter:title"]', 'content', defaultMeta.title);
      setMetaTag('meta[property="twitter:description"]', 'content', defaultMeta.description);
      setMetaTag('meta[property="twitter:url"]', 'content', `${SITE_URL}/`);
    }
  }, [pathname]);
}
