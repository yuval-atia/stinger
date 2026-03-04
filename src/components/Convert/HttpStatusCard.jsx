import { useState, useMemo } from 'react';
import ToolCard from '../common/ToolCard';
import { filterStatusCodes, CATEGORIES, CATEGORY_LABELS, CATEGORY_COLORS } from '../../utils/httpStatus';

function HttpStatusCard({ toolSlug }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const codes = useMemo(() => filterStatusCodes(search, category), [search, category]);

  return (
    <ToolCard toolSlug={toolSlug} title="HTTP Status Codes" icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M6.333 4.478A4 4 0 0 0 1 8a4 4 0 0 0 5.333 3.778.75.75 0 0 1 .662 1.346A5.5 5.5 0 1 1 6.4 3.17a.75.75 0 0 1-.067 1.308ZM9.667 4.478A4 4 0 0 1 15 8a4 4 0 0 1-5.333 3.778.75.75 0 0 0-.662 1.346 5.5 5.5 0 1 0 .595-10.154.75.75 0 0 0 .067 1.308Z" clipRule="evenodd" /></svg>} info={{
      what: 'Quick-reference for all HTTP status codes with descriptions, searchable by code number, name, or description.',
      how: 'Filters a comprehensive list of standard HTTP/1.1 status codes by category (1xx–5xx) and free-text search.',
      usedFor: 'API development, debugging HTTP responses, understanding server behavior, and writing error-handling logic.',
    }}>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by code, name, or description..."
        className="w-full px-3 py-2 text-xs font-mono rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]"
      />

      <div className="flex gap-1 flex-wrap">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-2 py-0.5 text-xs rounded font-medium transition-colors ${
              category === cat
                ? 'bg-[var(--accent-color)] text-white'
                : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      <div className="max-h-64 overflow-y-auto rounded border border-[var(--border-color)] bg-[var(--bg-secondary)]">
        {codes.length === 0 ? (
          <div className="px-3 py-2 text-xs text-[var(--text-secondary)]">No matching status codes</div>
        ) : (
          codes.map((s) => (
            <div key={s.code} className="px-3 py-2 border-b border-[var(--border-color)] last:border-b-0">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold font-mono ${CATEGORY_COLORS[s.category] || ''}`}>{s.code}</span>
                <span className="text-xs font-medium text-[var(--text-primary)]">{s.text}</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-relaxed">{s.description}</p>
            </div>
          ))
        )}
      </div>

      <div className="text-xs text-[var(--text-secondary)]">
        Showing {codes.length} status code{codes.length !== 1 ? 's' : ''}
      </div>
    </ToolCard>
  );
}

export default HttpStatusCard;
