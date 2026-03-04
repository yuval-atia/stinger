import { useState, useCallback } from 'react';
import ToolCard from '../common/ToolCard';
import CopyButton from '../common/CopyButton';

function CopyIcon({ copied }) {
  if (copied) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-[var(--success-color)]">
        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
      </svg>
    );
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
      <path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0117 6.622V12.5a1.5 1.5 0 01-1.5 1.5h-1v-3.379a3 3 0 00-.879-2.121L10.5 5.379A3 3 0 008.379 4.5H7v-1z" />
      <path d="M4.5 6A1.5 1.5 0 003 7.5v9A1.5 1.5 0 004.5 18h7a1.5 1.5 0 001.5-1.5v-5.879a1.5 1.5 0 00-.44-1.06L9.44 6.439A1.5 1.5 0 008.378 6H4.5z" />
    </svg>
  );
}

function CopyableValue({ label, value }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (!value) return null;

  return (
    <div className="flex items-center justify-between gap-2 px-3 py-1.5 rounded border border-[var(--border-color)] bg-[var(--bg-secondary)]">
      <span className="text-[10px] uppercase tracking-wide text-[var(--text-secondary)] font-semibold shrink-0 w-20">{label}</span>
      <span className="text-xs font-mono text-[var(--text-primary)] truncate flex-1 min-w-0">{value}</span>
      <CopyButton onClick={handleCopy} tooltip={copied ? 'Copied!' : 'Copy'} size="sm">
        <CopyIcon copied={copied} />
      </CopyButton>
    </div>
  );
}

function UrlParserCard({ toolSlug }) {
  const [input, setInput] = useState('');
  const [parsed, setParsed] = useState(null);
  const [error, setError] = useState('');

  const parseUrl = useCallback((text) => {
    if (!text.trim()) {
      setParsed(null);
      setError('');
      return;
    }

    try {
      const url = new URL(text.trim());
      const params = [];
      url.searchParams.forEach((value, key) => {
        params.push({ key, value });
      });

      setParsed({
        protocol: url.protocol.replace(':', ''),
        host: url.hostname,
        port: url.port || (url.protocol === 'https:' ? '443' : url.protocol === 'http:' ? '80' : ''),
        path: url.pathname,
        search: url.search,
        hash: url.hash.replace('#', ''),
        origin: url.origin,
        params,
      });
      setError('');
    } catch {
      setParsed(null);
      setError('Invalid URL. Make sure it starts with http:// or https://');
    }
  }, []);

  const handleInput = (value) => {
    setInput(value);
    parseUrl(value);
  };

  return (
    <ToolCard
      toolSlug={toolSlug}
      title="URL Parser"
      icon={
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
          <path fillRule="evenodd" d="M8.914 6.025a.75.75 0 0 1 1.06 0 3.5 3.5 0 0 1 0 4.95l-2 2a3.5 3.5 0 0 1-5.05-4.84.75.75 0 0 1 1.152.96A2 2 0 0 0 4.99 12.1l2-2a2 2 0 0 0 0-2.83.75.75 0 0 1 0-1.06l-.076.075.076-.075ZM7.086 9.975a.75.75 0 0 1-1.06 0 3.5 3.5 0 0 1 0-4.95l2-2a3.5 3.5 0 0 1 5.05 4.84.75.75 0 0 1-1.152-.96A2 2 0 0 0 11.01 3.9l-2 2a2 2 0 0 0 0 2.83.75.75 0 0 1 0 1.06l.076-.075-.076.075Z" />
        </svg>
      }
      info={{
        what: 'Breaks a URL into its component parts: protocol, host, port, path, query parameters, and hash fragment.',
        how: 'Uses the browser\'s built-in URL constructor to reliably parse any valid URL. Query parameters are extracted individually as key-value pairs.',
        usedFor: 'Debugging API requests, inspecting deep links, extracting query parameters, and understanding URL structure for web development.',
      }}
    >
      <textarea
        value={input}
        onChange={(e) => handleInput(e.target.value)}
        placeholder="Paste a URL to parse, e.g. https://example.com/path?key=value#section"
        className="w-full h-16 px-3 py-2 text-xs font-mono rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)] resize-none"
      />
      <button
        onClick={() => handleInput(window.location.href)}
        className="text-xs text-[var(--accent-color)] hover:underline cursor-pointer self-start"
      >
        Use current page URL
      </button>

      {error && (
        <div className="text-xs text-[var(--error-color)] px-1">{error}</div>
      )}

      {parsed && (
        <div className="flex flex-col gap-1.5">
          <CopyableValue label="Protocol" value={parsed.protocol} />
          <CopyableValue label="Host" value={parsed.host} />
          <CopyableValue label="Port" value={parsed.port} />
          <CopyableValue label="Path" value={parsed.path} />
          {parsed.hash && <CopyableValue label="Hash" value={parsed.hash} />}
          {parsed.origin && <CopyableValue label="Origin" value={parsed.origin} />}

          {parsed.params.length > 0 && (
            <>
              <div className="text-[10px] uppercase tracking-wide text-[var(--text-secondary)] font-semibold mt-2 px-1">
                Query Parameters ({parsed.params.length})
              </div>
              {parsed.params.map((p, i) => (
                <CopyableValue key={i} label={p.key} value={p.value} />
              ))}
            </>
          )}
        </div>
      )}

      {!parsed && !error && (
        <div className="w-full min-h-[60px] px-3 py-2 text-xs font-mono rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] flex items-center justify-center">
          <span className="text-[var(--text-secondary)]">Parsed URL parts will appear here</span>
        </div>
      )}
    </ToolCard>
  );
}

export default UrlParserCard;
