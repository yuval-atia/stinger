import { Suspense, lazy, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toolRegistry, categories, getToolsByCategory } from '../seo/toolRegistry';
import JsonLdScript from '../components/seo/JsonLdScript';
import ErrorBoundary from '../components/common/ErrorBoundary';

function ToolPage() {
  const { slug } = useParams();
  const tool = useMemo(() => toolRegistry.find((t) => t.slug === slug), [slug]);

  const ToolComponent = useMemo(() => {
    if (!tool) return null;
    return lazy(tool.component);
  }, [tool]);

  const relatedTools = useMemo(() => {
    if (!tool) return [];
    return getToolsByCategory(tool.category)
      .filter((t) => t.slug !== tool.slug)
      .slice(0, 6);
  }, [tool]);

  if (!tool) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Tool Not Found</h1>
          <p className="text-[var(--text-secondary)] mb-4">The tool you're looking for doesn't exist.</p>
          <Link to="/tools" className="text-[var(--accent-color)] hover:underline">Browse all tools</Link>
        </div>
      </div>
    );
  }

  const category = categories[tool.category];

  return (
    <div className="h-full overflow-y-auto">
      <JsonLdScript tool={tool} />

      <div className="max-w-4xl mx-auto pb-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] mb-4">
          <Link to="/" className="hover:text-[var(--accent-color)] transition-colors">Home</Link>
          <span>/</span>
          <Link to={category?.path || '/'} className="hover:text-[var(--accent-color)] transition-colors">
            {category?.label || tool.category}
          </Link>
          <span>/</span>
          <span className="text-[var(--text-primary)]">{tool.title}</span>
        </nav>

        {/* H1 + description */}
        <h1 className="text-xl font-bold mb-2">{tool.title}</h1>
        <p className="text-sm text-[var(--text-secondary)] mb-6">{tool.seo.description}</p>

        {/* Tool component */}
        <div className="mb-8">
          <ErrorBoundary>
            <Suspense fallback={
              <div className="flex items-center justify-center py-12">
                <div className="w-5 h-5 border-2 border-[var(--accent-color)] border-t-transparent rounded-full animate-spin" />
              </div>
            }>
              <ToolComponent />
            </Suspense>
          </ErrorBoundary>
        </div>

        {/* FAQ section */}
        {tool.faq && tool.faq.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold mb-3">Frequently Asked Questions</h2>
            <div className="space-y-2">
              {tool.faq.map((item, i) => (
                <details
                  key={i}
                  className="bg-[var(--bg-primary)] rounded-lg border border-[var(--border-color)] group"
                >
                  <summary className="px-4 py-3 text-sm font-medium cursor-pointer select-none hover:text-[var(--accent-color)] transition-colors list-none flex items-center justify-between">
                    {item.question}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 flex-shrink-0 text-[var(--text-secondary)] transition-transform group-open:rotate-180">
                      <path fillRule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                    </svg>
                  </summary>
                  <div className="px-4 pb-3 text-xs text-[var(--text-secondary)] leading-relaxed">
                    {item.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        )}

        {/* Related tools */}
        {relatedTools.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold mb-3">Related Tools</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {relatedTools.map((t) => (
                <Link
                  key={t.slug}
                  to={`/tools/${t.slug}`}
                  className="px-3 py-2 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] hover:border-[var(--accent-color)] transition-colors truncate"
                >
                  {t.title}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ToolPage;
