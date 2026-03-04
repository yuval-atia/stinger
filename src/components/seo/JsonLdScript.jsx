import { useEffect } from 'react';
import { SITE_URL } from '../../seo/routeMeta';
import { categories } from '../../seo/toolRegistry';

function JsonLdScript({ tool }) {
  useEffect(() => {
    const scripts = [];

    // BreadcrumbList schema
    const category = categories[tool.category];
    const breadcrumb = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: SITE_URL,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: category?.label || tool.category,
          item: `${SITE_URL}${category?.path || '/'}`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: tool.title,
          item: `${SITE_URL}/tools/${tool.slug}`,
        },
      ],
    };

    const breadcrumbScript = document.createElement('script');
    breadcrumbScript.type = 'application/ld+json';
    breadcrumbScript.textContent = JSON.stringify(breadcrumb);
    document.head.appendChild(breadcrumbScript);
    scripts.push(breadcrumbScript);

    // FAQPage schema
    if (tool.faq && tool.faq.length > 0) {
      const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: tool.faq.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      };

      const faqScript = document.createElement('script');
      faqScript.type = 'application/ld+json';
      faqScript.textContent = JSON.stringify(faqSchema);
      document.head.appendChild(faqScript);
      scripts.push(faqScript);
    }

    return () => {
      scripts.forEach((s) => {
        if (s.parentNode) s.parentNode.removeChild(s);
      });
    };
  }, [tool]);

  return null;
}

export default JsonLdScript;
