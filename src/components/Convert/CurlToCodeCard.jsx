import { useState, useMemo } from 'react';
import ToolCard from '../common/ToolCard';
import CopyButton from '../common/CopyButton';
import { parseCurl, toFetch, toAxios, toPython, toGo } from '../../utils/curlToCode';

const LANGUAGES = [
  { key: 'fetch', label: 'Fetch', fn: toFetch },
  { key: 'axios', label: 'Axios', fn: toAxios },
  { key: 'python', label: 'Python', fn: toPython },
  { key: 'go', label: 'Go', fn: toGo },
];

function CurlToCodeCard({ toolSlug }) {
  const [input, setInput] = useState('');
  const [lang, setLang] = useState('fetch');

  const { request, error } = useMemo(() => parseCurl(input), [input]);

  const output = useMemo(() => {
    if (!request) return '';
    const generator = LANGUAGES.find((l) => l.key === lang);
    return generator ? generator.fn(request) : '';
  }, [request, lang]);

  return (
    <ToolCard toolSlug={toolSlug} title="cURL → Code" icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M2 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4Zm3.379 1.793a.75.75 0 1 0-1.058 1.064l1.585 1.576-1.585 1.576a.75.75 0 1 0 1.058 1.064l2.1-2.09a.75.75 0 0 0 0-1.063l-2.1-2.127ZM8.75 9.5a.75.75 0 0 0 0 1.5h2.5a.75.75 0 0 0 0-1.5h-2.5Z" clipRule="evenodd" /></svg>} info={{
      what: 'Converts a cURL command into equivalent code for Fetch, Axios, Python requests, or Go net/http.',
      how: 'Parses the cURL command to extract method, URL, headers, and body, then generates idiomatic code for the selected language.',
      usedFor: 'Quickly converting API examples from documentation (often given as cURL) into usable code for your project.',
    }}>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={`curl -X POST 'https://api.example.com/data' \\\n  -H 'Content-Type: application/json' \\\n  -d '{"key":"value"}'`}
        rows={4}
        className="w-full px-3 py-2 text-xs font-mono rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)] resize-y"
      />

      <div className="flex gap-1">
        {LANGUAGES.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setLang(key)}
            className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
              lang === key
                ? 'bg-[var(--accent-color)] text-white'
                : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && input.trim() && (
        <div className="text-xs text-[var(--error-color)]">{error}</div>
      )}

      {output && (
        <div className="relative">
          <pre className="w-full px-3 py-2 text-xs font-mono rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] overflow-x-auto whitespace-pre-wrap">{output}</pre>
          <div className="absolute top-1.5 right-1.5">
            <CopyButton text={output} />
          </div>
        </div>
      )}
    </ToolCard>
  );
}

export default CurlToCodeCard;
