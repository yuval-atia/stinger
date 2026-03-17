import { Link } from 'react-router-dom';
import { toolRegistry, categories } from '../seo/toolRegistry';

const categoryOrder = ['api', 'generate', 'encode', 'hash', 'convert', 'text', 'format'];

function ToolsIndexPage() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto pb-8">
        <h1 className="text-xl font-bold mb-2">All Developer Tools</h1>
        <p className="text-sm text-[var(--text-secondary)] mb-6">
          50+ free, private developer tools that run entirely in your browser. No data ever leaves your machine.
        </p>

        {categoryOrder.map((catKey) => {
          const cat = categories[catKey];
          const tools = toolRegistry.filter((t) => t.category === catKey);
          if (tools.length === 0) return null;

          return (
            <div key={catKey} className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-sm font-semibold">{cat.label}</h2>
                <Link
                  to={cat.path}
                  className="text-[10px] text-[var(--text-secondary)] hover:text-[var(--accent-color)] transition-colors"
                >
                  View all
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {tools.map((tool) => (
                  <Link
                    key={tool.slug}
                    to={`/tools/${tool.slug}`}
                    className="px-3 py-2.5 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] hover:border-[var(--accent-color)] transition-colors card-hover"
                  >
                    <span className="font-medium">{tool.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ToolsIndexPage;
