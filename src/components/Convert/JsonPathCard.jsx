import { useState, useMemo } from 'react';
import ToolCard from '../common/ToolCard';
import CopyButton from '../common/CopyButton';
import { evaluateJsonPath } from '../../utils/jsonpath';

const SAMPLE_JSON = `{
  "store": {
    "books": [
      { "title": "Moby Dick", "price": 8.99 },
      { "title": "1984", "price": 6.49 },
      { "title": "Dune", "price": 12.99 }
    ],
    "name": "My Bookstore"
  }
}`;

function JsonPathCard({ toolSlug }) {
  const [json, setJson] = useState(SAMPLE_JSON);
  const [expression, setExpression] = useState('$.store.books[*].title');

  const parsed = useMemo(() => {
    try {
      return { data: JSON.parse(json), error: null };
    } catch (e) {
      return { data: null, error: e.message };
    }
  }, [json]);

  const result = useMemo(() => {
    if (!parsed.data || !expression.trim()) return null;
    return evaluateJsonPath(parsed.data, expression);
  }, [parsed.data, expression]);

  const matchText = useMemo(() => {
    if (!result || result.error || result.matches.length === 0) return '';
    return result.matches.map((m) => JSON.stringify(m.value, null, 2)).join('\n');
  }, [result]);

  return (
    <ToolCard toolSlug={toolSlug} title="JSONPath Evaluator" icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z" clipRule="evenodd" /></svg>} info={{
      what: 'Evaluates JSONPath expressions against JSON data and shows matching values with their paths.',
      how: 'Parses the JSONPath expression into tokens (dot notation, brackets, wildcards, filters, slices, recursive descent), then traverses the JSON tree to collect matching nodes.',
      usedFor: 'Testing JSONPath queries before using them in jq, API transformations, database queries, or data-processing pipelines.',
    }}>
      <textarea
        value={json}
        onChange={(e) => setJson(e.target.value)}
        placeholder="Paste JSON here..."
        rows={5}
        spellCheck={false}
        className="w-full px-3 py-2 text-xs font-mono rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)] resize-y"
      />

      {parsed.error && (
        <div className="text-xs text-[var(--error-color)]">JSON: {parsed.error}</div>
      )}

      <input
        type="text"
        value={expression}
        onChange={(e) => setExpression(e.target.value)}
        placeholder="$.store.books[*].title"
        className="w-full px-3 py-2 text-xs font-mono rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]"
      />

      {result && result.error && (
        <div className="text-xs text-[var(--error-color)]">{result.error}</div>
      )}

      {result && !result.error && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--text-secondary)]">
              {result.matches.length} match{result.matches.length !== 1 ? 'es' : ''}
            </span>
            {matchText && <CopyButton text={matchText} />}
          </div>
          <div className="max-h-48 overflow-y-auto rounded border border-[var(--border-color)] bg-[var(--bg-secondary)]">
            {result.matches.length === 0 ? (
              <div className="px-3 py-2 text-xs text-[var(--text-secondary)]">No matches</div>
            ) : (
              result.matches.map((m, i) => (
                <div key={i} className="px-3 py-1.5 text-xs font-mono border-b border-[var(--border-color)] last:border-b-0">
                  <span className="text-[var(--text-secondary)]">{m.path || '$'}</span>
                  <span className="mx-1.5 text-[var(--text-secondary)]">=</span>
                  <span className="text-[var(--text-primary)]">{JSON.stringify(m.value)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </ToolCard>
  );
}

export default JsonPathCard;
