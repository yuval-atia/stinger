import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import CopyButton from '../components/common/CopyButton';
import { TreeView, TreeProvider } from '@stingr/json-viewer';
import { useToast } from '../components/common/Toast';

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];
const METHOD_COLORS = {
  GET: '#22c55e',
  POST: '#f59e0b',
  PUT: '#3b82f6',
  PATCH: '#a855f7',
  DELETE: '#ef4444',
  HEAD: '#06b6d4',
  OPTIONS: '#6b7280',
};

const BODY_TYPES = ['none', 'json', 'form-data', 'form-urlencoded', 'raw', 'binary'];

const STATUS_TEXT = {
  200: 'OK', 201: 'Created', 204: 'No Content', 301: 'Moved Permanently',
  302: 'Found', 304: 'Not Modified', 400: 'Bad Request', 401: 'Unauthorized',
  403: 'Forbidden', 404: 'Not Found', 405: 'Method Not Allowed', 408: 'Request Timeout',
  409: 'Conflict', 422: 'Unprocessable Entity', 429: 'Too Many Requests',
  500: 'Internal Server Error', 502: 'Bad Gateway', 503: 'Service Unavailable',
};

function emptyRow() {
  return { key: '', value: '', enabled: true, id: crypto.randomUUID() };
}

function MethodSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="relative flex-shrink-0" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg px-4 py-2 text-base font-mono font-bold focus:outline-none focus:border-[var(--accent-color)] cursor-pointer flex items-center justify-between h-full min-w-[120px]"
        style={{ color: METHOD_COLORS[value] }}
      >
        {value}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 opacity-70 ml-1">
          <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
        </svg>
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg shadow-lg overflow-hidden min-w-[140px]">
          {METHODS.map(m => (
            <button
              key={m}
              onClick={() => { onChange(m); setOpen(false); }}
              className={`w-full text-left px-4 py-2 text-base font-mono font-bold hover:bg-[var(--bg-secondary)] transition-colors ${m === value ? 'bg-[var(--bg-secondary)]' : ''}`}
              style={{ color: METHOD_COLORS[m] }}
            >
              {m}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function KeyValueEditor({ rows, onChange, placeholder = 'Key', valuePlaceholder = 'Value', description }) {
  const addRow = () => onChange([...rows, emptyRow()]);
  const updateRow = (id, field, val) =>
    onChange(rows.map(r => (r.id === id ? { ...r, [field]: val } : r)));
  const removeRow = (id) => {
    const next = rows.filter(r => r.id !== id);
    onChange(next.length === 0 ? [emptyRow()] : next);
  };
  const toggleRow = (id) =>
    onChange(rows.map(r => (r.id === id ? { ...r, enabled: !r.enabled } : r)));

  return (
    <div className="space-y-1.5">
      {description && <p className="text-xs text-[var(--text-secondary)] mb-2">{description}</p>}
      {/* Column headers */}
      <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">
        <span className="w-4 flex-shrink-0" />
        <span className="flex-1">{placeholder}</span>
        <span className="flex-1">{valuePlaceholder}</span>
        <span className="w-6 flex-shrink-0" />
      </div>
      {rows.map((row) => (
        <div key={row.id} className="flex items-center gap-1.5">
          <input
            type="checkbox"
            checked={row.enabled}
            onChange={() => toggleRow(row.id)}
            className="accent-[var(--accent-color)] flex-shrink-0"
          />
          <input
            type="text"
            value={row.key}
            onChange={(e) => updateRow(row.id, 'key', e.target.value)}
            placeholder={placeholder}
            className={`flex-1 min-w-0 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded px-2 py-1.5 text-xs font-mono focus:outline-none focus:border-[var(--accent-color)] ${!row.enabled ? 'opacity-40' : ''}`}
          />
          <input
            type="text"
            value={row.value}
            onChange={(e) => updateRow(row.id, 'value', e.target.value)}
            placeholder={valuePlaceholder}
            className={`flex-1 min-w-0 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded px-2 py-1.5 text-xs font-mono focus:outline-none focus:border-[var(--accent-color)] ${!row.enabled ? 'opacity-40' : ''}`}
          />
          <button
            onClick={() => removeRow(row.id)}
            className="text-[var(--text-secondary)] hover:text-[var(--error-color)] transition-colors flex-shrink-0 p-1"
            title="Remove"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
              <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
            </svg>
          </button>
        </div>
      ))}
      <button
        onClick={addRow}
        className="text-xs text-[var(--accent-color)] hover:underline flex items-center gap-1 mt-1"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
          <path d="M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z" />
        </svg>
        Add row
      </button>
    </div>
  );
}

function StatusBadge({ status, statusText }) {
  if (!status) return null;
  const color =
    status < 300 ? 'var(--success-color)' :
    status < 400 ? '#f59e0b' :
    'var(--error-color)';
  const text = statusText || STATUS_TEXT[status] || '';
  return (
    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded" style={{ color, background: `${color}15` }}>
      {status} {text}
    </span>
  );
}

function ResponseHeaders({ headers }) {
  if (!headers || headers.length === 0) return (
    <p className="text-xs text-[var(--text-secondary)]">No headers</p>
  );
  return (
    <table className="w-full text-xs font-mono">
      <thead>
        <tr className="text-left text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">
          <th className="pb-2 pr-4 font-medium">Header</th>
          <th className="pb-2 font-medium">Value</th>
        </tr>
      </thead>
      <tbody>
        {headers.map(([k, v], i) => (
          <tr key={i} className="border-t border-[var(--border-color)]">
            <td className="py-1.5 pr-4 text-[var(--accent-color)] whitespace-nowrap">{k}</td>
            <td className="py-1.5 text-[var(--text-primary)] break-all">{v}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatBody(body, contentType) {
  if (!body) return '';
  if (contentType && (contentType.includes('json') || contentType.includes('javascript'))) {
    try {
      return JSON.stringify(JSON.parse(body), null, 2);
    } catch { /* not valid json */ }
  }
  return body;
}

function syntaxHighlight(json) {
  // Escape HTML first
  const escaped = json
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  return escaped.replace(
    /("(\\u[\da-fA-F]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    (match) => {
      let cls = 'json-number';
      if (/^"/.test(match)) {
        cls = /:$/.test(match) ? 'json-key' : 'json-string';
      } else if (/true|false/.test(match)) {
        cls = 'json-boolean';
      } else if (/null/.test(match)) {
        cls = 'json-null';
      }
      return `<span class="${cls}">${match}</span>`;
    }
  );
}

function ApiClientPage() {
  const showToast = useToast();
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('');
  const [activeTab, setActiveTab] = useState('params');
  const [params, setParams] = useState([emptyRow()]);
  const [headers, setHeaders] = useState([emptyRow()]);
  const [bodyType, setBodyType] = useState('none');
  const [bodyContent, setBodyContent] = useState('');
  const [formDataRows, setFormDataRows] = useState([emptyRow()]);
  const [binaryFile, setBinaryFile] = useState(null);
  const [authType, setAuthType] = useState('none');
  const [authToken, setAuthToken] = useState('');
  const [authUser, setAuthUser] = useState('');
  const [authPass, setAuthPass] = useState('');

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [responseTab, setResponseTab] = useState('body');
  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem('api-client-history') || '[]');
    } catch { return []; }
  });
  const [showHistory, setShowHistory] = useState(false);
  const [responseSearch, setResponseSearch] = useState('');
  const [showResponseSearch, setShowResponseSearch] = useState(false);
  const [responseViewMode, setResponseViewMode] = useState('pretty'); // 'pretty' | 'raw' | 'tree'

  const abortRef = useRef(null);
  const fileInputRef = useRef(null);
  const treeContainerRef = useRef(null);

  // Persist history to sessionStorage
  useEffect(() => {
    sessionStorage.setItem('api-client-history', JSON.stringify(history));
  }, [history]);

  const buildUrl = useCallback(() => {
    let finalUrl = url.trim();
    if (!finalUrl) return '';
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = 'https://' + finalUrl;
    }
    const enabledParams = params.filter(p => p.enabled && p.key.trim());
    if (enabledParams.length > 0) {
      try {
        const u = new URL(finalUrl);
        enabledParams.forEach(p => u.searchParams.append(p.key.trim(), p.value));
        return u.toString();
      } catch {
        const qs = enabledParams.map(p => `${encodeURIComponent(p.key.trim())}=${encodeURIComponent(p.value)}`).join('&');
        return finalUrl + (finalUrl.includes('?') ? '&' : '?') + qs;
      }
    }
    return finalUrl;
  }, [url, params]);

  // URL preview
  const urlPreview = useMemo(() => {
    const enabledParams = params.filter(p => p.enabled && p.key.trim());
    if (enabledParams.length === 0) return null;
    return buildUrl();
  }, [params, buildUrl]);

  const sendRequest = useCallback(async () => {
    const finalUrl = buildUrl();
    if (!finalUrl) return;

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);
    setResponse(null);
    setResponseTab('body');
    setResponseSearch('');
    setShowResponseSearch(false);

    const startTime = performance.now();

    try {
      const reqHeaders = {};

      // Add user headers
      headers.filter(h => h.enabled && h.key.trim()).forEach(h => {
        reqHeaders[h.key.trim()] = h.value;
      });

      // Add auth
      if (authType === 'bearer' && authToken.trim()) {
        reqHeaders['Authorization'] = `Bearer ${authToken.trim()}`;
      } else if (authType === 'basic' && authUser.trim()) {
        reqHeaders['Authorization'] = `Basic ${btoa(`${authUser}:${authPass}`)}`;
      }

      // Build body
      let body = undefined;
      if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
        if (bodyType === 'json') {
          body = bodyContent;
          if (!reqHeaders['Content-Type']) {
            reqHeaders['Content-Type'] = 'application/json';
          }
        } else if (bodyType === 'form-urlencoded') {
          body = bodyContent;
          if (!reqHeaders['Content-Type']) {
            reqHeaders['Content-Type'] = 'application/x-www-form-urlencoded';
          }
        } else if (bodyType === 'form-data') {
          const fd = new FormData();
          formDataRows.filter(r => r.enabled && r.key.trim()).forEach(r => {
            fd.append(r.key.trim(), r.value);
          });
          body = fd;
          // Don't set Content-Type — browser sets it with boundary
        } else if (bodyType === 'raw') {
          body = bodyContent;
          if (!reqHeaders['Content-Type']) {
            reqHeaders['Content-Type'] = 'text/plain';
          }
        } else if (bodyType === 'binary' && binaryFile) {
          body = binaryFile;
          if (!reqHeaders['Content-Type']) {
            reqHeaders['Content-Type'] = binaryFile.type || 'application/octet-stream';
          }
        }
      }

      const res = await fetch(finalUrl, {
        method,
        headers: reqHeaders,
        body,
        signal: controller.signal,
      });

      const elapsed = Math.round(performance.now() - startTime);
      const responseText = await res.text();
      const respHeaders = [...res.headers.entries()];
      const contentType = res.headers.get('content-type') || '';

      const result = {
        status: res.status,
        statusText: res.statusText,
        headers: respHeaders,
        body: responseText,
        contentType,
        time: elapsed,
        size: new Blob([responseText]).size,
        method,
        url: finalUrl,
      };

      setResponse(result);

      setHistory(prev => [{
        method,
        url: finalUrl,
        status: res.status,
        statusText: res.statusText,
        time: elapsed,
        timestamp: Date.now(),
      }, ...prev].slice(0, 50));

    } catch (err) {
      if (err.name === 'AbortError') return;
      const elapsed = Math.round(performance.now() - startTime);
      setError({
        message: err.message,
        time: elapsed,
        isCors: err.message.includes('Failed to fetch') || err.message.includes('NetworkError') || err.message.includes('CORS'),
      });
    } finally {
      setLoading(false);
    }
  }, [buildUrl, method, headers, bodyType, bodyContent, formDataRows, binaryFile, authType, authToken, authUser, authPass]);

  // Ctrl/Cmd+Enter to send
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        sendRequest();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [sendRequest]);

  const loadFromHistory = (item) => {
    setMethod(item.method);
    setUrl(item.url);
    setShowHistory(false);
  };

  const clearHistory = () => {
    setHistory([]);
    sessionStorage.removeItem('api-client-history');
  };

  const [copied, setCopied] = useState(false);
  const copyResponse = () => {
    if (response?.body) {
      navigator.clipboard.writeText(response.body);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const beautifyBody = () => {
    if (bodyType === 'json' && bodyContent.trim()) {
      try {
        setBodyContent(JSON.stringify(JSON.parse(bodyContent), null, 2));
      } catch { /* invalid json */ }
    }
  };

  const requestTabs = [
    { id: 'params', label: 'Params', count: params.filter(p => p.enabled && p.key.trim()).length },
    { id: 'headers', label: 'Headers', count: headers.filter(h => h.enabled && h.key.trim()).length },
    { id: 'body', label: 'Body', dot: bodyType !== 'none' },
    { id: 'auth', label: 'Auth', dot: authType !== 'none' },
  ];

  const formattedBody = response ? formatBody(response.body, response.contentType) : '';
  const isJson = response?.contentType?.includes('json') || response?.contentType?.includes('javascript');

  // Parse JSON for tree view
  const parsedJson = useMemo(() => {
    if (!response?.body || !isJson) return null;
    try {
      return JSON.parse(response.body);
    } catch { return null; }
  }, [response, isJson]);

  // Response search highlighting
  const highlightedBody = useMemo(() => {
    if (!formattedBody) return '';
    if (isJson) {
      let html = syntaxHighlight(formattedBody);
      if (responseSearch.trim()) {
        const escaped = responseSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        html = html.replace(new RegExp(`(${escaped})`, 'gi'), '<mark class="bg-yellow-300 dark:bg-yellow-600 text-black dark:text-white rounded px-0.5">$1</mark>');
      }
      return html;
    }
    if (responseSearch.trim()) {
      const escaped = responseSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const escapedBody = formattedBody.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return escapedBody.replace(new RegExp(`(${escaped})`, 'gi'), '<mark class="bg-yellow-300 dark:bg-yellow-600 text-black dark:text-white rounded px-0.5">$1</mark>');
    }
    return '';
  }, [formattedBody, isJson, responseSearch]);

  const searchMatchCount = useMemo(() => {
    if (!responseSearch.trim() || !formattedBody) return 0;
    const escaped = responseSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return (formattedBody.match(new RegExp(escaped, 'gi')) || []).length;
  }, [responseSearch, formattedBody]);

  return (
    <div className="h-full overflow-y-auto">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] mb-3">
        <Link to="/" className="hover:text-[var(--accent-color)] transition-colors">Home</Link>
        <span>/</span>
        <span className="text-[var(--text-primary)]">API Client</span>
      </nav>

      <div className="flex items-start justify-between mb-4 gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-[var(--accent-color)]">
              <path d="M2.87 2.298a.75.75 0 0 0-.812 1.021L3.39 6.624a1 1 0 0 0 .928.626H8.25a.75.75 0 0 1 0 1.5H4.318a1 1 0 0 0-.927.626l-1.333 3.305a.75.75 0 0 0 .812 1.021l11.07-3.548a.75.75 0 0 0 0-1.408L2.87 2.298Z" />
            </svg>
            API Client
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">
            Send HTTP requests and inspect responses. All requests are sent directly from your browser.
          </p>
        </div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className={`text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors flex-shrink-0 ${
            showHistory
              ? 'border-[var(--accent-color)] text-[var(--accent-color)] bg-[var(--accent-color)]/10'
              : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-secondary)]'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
            <path fillRule="evenodd" d="M1 8a7 7 0 1 1 14 0A7 7 0 0 1 1 8Zm7.75-4.25a.75.75 0 0 0-1.5 0V8c0 .414.336.75.75.75h3.25a.75.75 0 0 0 0-1.5h-2.5v-3.5Z" clipRule="evenodd" />
          </svg>
          History{history.length > 0 && ` (${history.length})`}
        </button>
      </div>

      {/* History panel */}
      {showHistory && (
        <div className="mb-4 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg overflow-hidden">
          {history.length === 0 ? (
            <div className="px-4 py-6 text-center text-xs text-[var(--text-secondary)]">
              No request history yet. Send a request to get started.
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
                <span className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] font-medium">Recent Requests</span>
                <button onClick={clearHistory} className="text-[10px] text-[var(--text-secondary)] hover:text-[var(--error-color)] transition-colors">
                  Clear all
                </button>
              </div>
              <div className="max-h-48 overflow-y-auto">
                {history.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => loadFromHistory(item)}
                    className="w-full flex items-center gap-3 px-3 py-2 text-xs hover:bg-[var(--bg-secondary)] transition-colors border-b border-[var(--border-color)] last:border-b-0"
                  >
                    <span className="font-mono font-bold flex-shrink-0" style={{ color: METHOD_COLORS[item.method], minWidth: '56px', textAlign: 'left' }}>
                      {item.method}
                    </span>
                    <span className="font-mono truncate flex-1 text-left text-[var(--text-primary)]">{item.url}</span>
                    <StatusBadge status={item.status} statusText={item.statusText} />
                    <span className="text-[var(--text-secondary)] flex-shrink-0">{item.time}ms</span>
                    <span className="text-[var(--text-secondary)] flex-shrink-0 hidden sm:inline">
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* URL bar */}
      <div className="flex gap-2 mb-2">
        <MethodSelect value={method} onChange={setMethod} />
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.ctrlKey && !e.metaKey) sendRequest(); }}
          placeholder="https://api.example.com/endpoint"
          className="flex-1 min-w-0 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-[var(--accent-color)]"
          data-testid="url-input"
        />
        <button
          onClick={sendRequest}
          disabled={loading || !url.trim()}
          className="bg-[var(--accent-color)] text-white px-6 py-2 rounded-lg text-base font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center gap-2 flex-shrink-0 shadow-sm"
          data-testid="send-button"
        >
          {loading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Cancel
            </>
          ) : (
            <>
              Send
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                <path d="M2.87 2.298a.75.75 0 0 0-.812 1.021L3.39 6.624a1 1 0 0 0 .928.626H8.25a.75.75 0 0 1 0 1.5H4.318a1 1 0 0 0-.927.626l-1.333 3.305a.75.75 0 0 0 .812 1.021l11.07-3.548a.75.75 0 0 0 0-1.408L2.87 2.298Z" />
              </svg>
            </>
          )}
        </button>
      </div>

      {/* URL Preview */}
      {urlPreview && (
        <div className="mb-4 text-[10px] font-mono text-[var(--text-secondary)] truncate px-1">
          {urlPreview}
        </div>
      )}
      {!urlPreview && <div className="mb-2" />}

      {/* Request + Response panels */}
      <div className="flex flex-col gap-4 pb-4">
        {/* Request panel */}
        <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg flex flex-col">
          {/* Request tabs */}
          <div className="flex border-b border-[var(--border-color)] overflow-x-auto">
            {requestTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 text-xs font-medium transition-colors relative whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? 'text-[var(--accent-color)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
                data-testid={`tab-${tab.id}`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="bg-[var(--accent-color)] text-white text-[10px] rounded-full w-4 h-4 inline-flex items-center justify-center">
                    {tab.count}
                  </span>
                )}
                {tab.dot && !tab.count && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-color)]" />
                )}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent-color)]" />
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-4">
            {activeTab === 'params' && (
              <KeyValueEditor
                rows={params}
                onChange={setParams}
                placeholder="Parameter"
                valuePlaceholder="Value"
                description="Query parameters will be appended to the URL"
              />
            )}

            {activeTab === 'headers' && (
              <KeyValueEditor
                rows={headers}
                onChange={setHeaders}
                placeholder="Header name"
                valuePlaceholder="Header value"
                description="Custom HTTP headers sent with the request"
              />
            )}

            {activeTab === 'body' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {BODY_TYPES.map(bt => (
                    <button
                      key={bt}
                      onClick={() => setBodyType(bt)}
                      className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                        bodyType === bt
                          ? 'border-[var(--accent-color)] text-[var(--accent-color)] bg-[var(--accent-color)]/10'
                          : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      }`}
                      data-testid={`body-type-${bt}`}
                    >
                      {bt === 'none' ? 'None' : bt === 'json' ? 'JSON' : bt === 'form-data' ? 'Form Data' : bt === 'form-urlencoded' ? 'x-www-form-urlencoded' : bt === 'binary' ? 'Binary' : 'Raw'}
                    </button>
                  ))}
                  {bodyType === 'json' && bodyContent.trim() && (
                    <button
                      onClick={beautifyBody}
                      className="ml-auto text-xs text-[var(--accent-color)] hover:underline flex items-center gap-1"
                      title="Format JSON"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
                        <path fillRule="evenodd" d="M2 3.75A.75.75 0 0 1 2.75 3h10.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 3.75ZM2 8a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 8Zm0 4.25a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
                      </svg>
                      Beautify
                    </button>
                  )}
                </div>
                {bodyType === 'json' && (
                  <textarea
                    value={bodyContent}
                    onChange={(e) => setBodyContent(e.target.value)}
                    placeholder={'{\n  "key": "value"\n}'}
                    className="w-full h-32 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-xs font-mono resize-y focus:outline-none focus:border-[var(--accent-color)] leading-relaxed"
                    spellCheck={false}
                    data-testid="body-editor"
                  />
                )}
                {bodyType === 'form-data' && (
                  <KeyValueEditor
                    rows={formDataRows}
                    onChange={setFormDataRows}
                    placeholder="Field name"
                    valuePlaceholder="Field value"
                    description="Form data fields (multipart/form-data)"
                  />
                )}
                {bodyType === 'form-urlencoded' && (
                  <textarea
                    value={bodyContent}
                    onChange={(e) => setBodyContent(e.target.value)}
                    placeholder="key1=value1&key2=value2"
                    className="w-full h-32 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-xs font-mono resize-y focus:outline-none focus:border-[var(--accent-color)]"
                    spellCheck={false}
                    data-testid="body-editor"
                  />
                )}
                {bodyType === 'raw' && (
                  <textarea
                    value={bodyContent}
                    onChange={(e) => setBodyContent(e.target.value)}
                    placeholder="Raw request body..."
                    className="w-full h-32 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-xs font-mono resize-y focus:outline-none focus:border-[var(--accent-color)]"
                    spellCheck={false}
                    data-testid="body-editor"
                  />
                )}
                {bodyType === 'binary' && (
                  <div className="space-y-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={(e) => setBinaryFile(e.target.files?.[0] || null)}
                      className="text-xs text-[var(--text-secondary)] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-[var(--border-color)] file:bg-[var(--bg-secondary)] file:text-xs file:text-[var(--text-primary)] file:cursor-pointer"
                    />
                    {binaryFile && (
                      <p className="text-xs text-[var(--text-secondary)]">
                        {binaryFile.name} ({formatBytes(binaryFile.size)})
                      </p>
                    )}
                  </div>
                )}
                {bodyType === 'none' && (
                  <p className="text-xs text-[var(--text-secondary)]">
                    This request does not have a body.
                    {['GET', 'HEAD', 'OPTIONS'].includes(method) && ' GET, HEAD, and OPTIONS requests typically don\'t include a body.'}
                  </p>
                )}
              </div>
            )}

            {activeTab === 'auth' && (
              <div className="space-y-3">
                <div className="flex gap-2 flex-wrap">
                  {['none', 'bearer', 'basic'].map(at => (
                    <button
                      key={at}
                      onClick={() => setAuthType(at)}
                      className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                        authType === at
                          ? 'border-[var(--accent-color)] text-[var(--accent-color)] bg-[var(--accent-color)]/10'
                          : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      }`}
                      data-testid={`auth-type-${at}`}
                    >
                      {at === 'none' ? 'No Auth' : at === 'bearer' ? 'Bearer Token' : 'Basic Auth'}
                    </button>
                  ))}
                </div>
                {authType === 'bearer' && (
                  <div>
                    <label className="text-xs text-[var(--text-secondary)] block mb-1.5">Token</label>
                    <input
                      type="text"
                      value={authToken}
                      onChange={(e) => setAuthToken(e.target.value)}
                      placeholder="Enter bearer token"
                      className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-[var(--accent-color)]"
                      data-testid="auth-token"
                    />
                    <p className="text-[10px] text-[var(--text-secondary)] mt-1.5">
                      The token will be sent as: <code className="bg-[var(--bg-secondary)] px-1 py-0.5 rounded">Authorization: Bearer &lt;token&gt;</code>
                    </p>
                  </div>
                )}
                {authType === 'basic' && (
                  <div className="space-y-2">
                    <div>
                      <label className="text-xs text-[var(--text-secondary)] block mb-1.5">Username</label>
                      <input
                        type="text"
                        value={authUser}
                        onChange={(e) => setAuthUser(e.target.value)}
                        placeholder="Username"
                        className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-[var(--accent-color)]"
                        data-testid="auth-username"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[var(--text-secondary)] block mb-1.5">Password</label>
                      <input
                        type="password"
                        value={authPass}
                        onChange={(e) => setAuthPass(e.target.value)}
                        placeholder="Password"
                        className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-[var(--accent-color)]"
                        data-testid="auth-password"
                      />
                    </div>
                    <p className="text-[10px] text-[var(--text-secondary)]">
                      Credentials will be Base64 encoded and sent as: <code className="bg-[var(--bg-secondary)] px-1 py-0.5 rounded">Authorization: Basic &lt;base64&gt;</code>
                    </p>
                  </div>
                )}
                {authType === 'none' && (
                  <p className="text-xs text-[var(--text-secondary)]">No authentication will be sent with this request.</p>
                )}
              </div>
            )}
          </div>

          {/* Keyboard shortcut hint */}
          <div className="px-4 py-2 border-t border-[var(--border-color)] text-[10px] text-[var(--text-secondary)] flex items-center justify-between">
            <span>
              <kbd className="px-1 py-0.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded text-[10px]">Enter</kbd> or <kbd className="px-1 py-0.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded text-[10px]">{navigator.platform?.includes('Mac') ? '⌘' : 'Ctrl'}+Enter</kbd> to send
            </span>
            <span className="text-[var(--text-secondary)]">
              Requests are sent directly from your browser (CORS policies apply)
            </span>
          </div>
        </div>

        {/* Response panel */}
        <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg flex flex-col" data-testid="response-panel">
          {/* Response header bar */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--border-color)]">
            <span className="text-xs font-medium text-[var(--text-primary)] flex items-center gap-2">
              Response
              {response && <StatusBadge status={response.status} statusText={response.statusText} />}
            </span>
            {response && (
              <div className="flex items-center gap-3 text-xs">
                <span className="text-[var(--text-secondary)] font-mono">{response.time}ms</span>
                <span className="text-[var(--text-secondary)] font-mono">{formatBytes(response.size)}</span>
                <button
                  onClick={() => setShowResponseSearch(!showResponseSearch)}
                  className={`p-1 rounded transition-colors ${showResponseSearch ? 'text-[var(--accent-color)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                  title="Search response (Ctrl+F)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                    <path fillRule="evenodd" d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z" clipRule="evenodd" />
                  </svg>
                </button>
                <CopyButton onClick={copyResponse} tooltip={copied ? 'Copied!' : 'Copy response'}>
                  {copied ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-[var(--success-color)]">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                      <path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0117 6.622V12.5a1.5 1.5 0 01-1.5 1.5h-1v-3.379a3 3 0 00-.879-2.121L10.5 5.379A3 3 0 008.379 4.5H7v-1z" />
                      <path d="M4.5 6A1.5 1.5 0 003 7.5v9A1.5 1.5 0 004.5 18h7a1.5 1.5 0 001.5-1.5v-5.879a1.5 1.5 0 00-.44-1.06L9.44 6.439A1.5 1.5 0 008.378 6H4.5z" />
                    </svg>
                  )}
                </CopyButton>
              </div>
            )}
          </div>

          {/* Response search bar */}
          {showResponseSearch && response && (
            <div className="flex items-center gap-2 px-4 py-2 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 text-[var(--text-secondary)] flex-shrink-0">
                <path fillRule="evenodd" d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z" clipRule="evenodd" />
              </svg>
              <input
                type="text"
                value={responseSearch}
                onChange={(e) => setResponseSearch(e.target.value)}
                placeholder="Search response body..."
                className="flex-1 bg-transparent text-xs font-mono focus:outline-none"
                autoFocus
              />
              {responseSearch && (
                <span className="text-[10px] text-[var(--text-secondary)]">
                  {searchMatchCount} match{searchMatchCount !== 1 ? 'es' : ''}
                </span>
              )}
              <button
                onClick={() => { setShowResponseSearch(false); setResponseSearch(''); }}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                  <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
                </svg>
              </button>
            </div>
          )}

          {/* Response tabs */}
          {response && (
            <div className="flex items-center border-b border-[var(--border-color)]">
              <div className="flex flex-1">
                {['body', 'headers'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setResponseTab(tab)}
                    className={`px-4 py-2 text-xs font-medium transition-colors relative ${
                      responseTab === tab
                        ? 'text-[var(--accent-color)]'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                    data-testid={`response-tab-${tab}`}
                  >
                    {tab === 'body' ? 'Body' : `Headers (${response.headers.length})`}
                    {responseTab === tab && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent-color)]" />
                    )}
                  </button>
                ))}
              </div>
              {/* View mode toggle for body tab */}
              {responseTab === 'body' && isJson && (
                <div className="flex items-center gap-0.5 pr-3">
                  {['pretty', 'tree', 'raw'].map(mode => (
                    <button
                      key={mode}
                      onClick={() => setResponseViewMode(mode)}
                      className={`px-2 py-1 text-[10px] rounded transition-colors ${
                        responseViewMode === mode
                          ? 'bg-[var(--accent-color)]/15 text-[var(--accent-color)] font-medium'
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {mode === 'pretty' ? 'Pretty' : mode === 'tree' ? 'Tree' : 'Raw'}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Response body */}
          <div className="flex-1 min-h-0 overflow-auto p-4" style={{ maxHeight: '600px' }}>
            {loading && (
              <div className="flex items-center justify-center py-12 gap-2 text-sm text-[var(--text-secondary)]">
                <div className="w-4 h-4 border-2 border-[var(--accent-color)] border-t-transparent rounded-full animate-spin" />
                Sending request...
              </div>
            )}
            {error && (
              <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="var(--error-color)" className="w-8 h-8">
                  <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
                </svg>
                <p className="text-sm font-medium" style={{ color: 'var(--error-color)' }}>Request Failed</p>
                <p className="text-xs text-[var(--text-secondary)] max-w-md">{error.message}</p>
                {error.isCors && (
                  <div className="text-xs text-[var(--text-secondary)] max-w-md bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-3 mt-1">
                    <p className="font-medium text-[var(--text-primary)] mb-1">Possible CORS issue</p>
                    <p>The target server may not allow requests from this origin. This is a browser security restriction.
                    Try APIs that support CORS, or test against your own local dev server.</p>
                  </div>
                )}
                <p className="text-[10px] text-[var(--text-secondary)]">{error.time}ms</p>
              </div>
            )}
            {!loading && !error && !response && (
              <div className="flex flex-col items-center justify-center py-8 gap-3 text-center text-[var(--text-secondary)]">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-8 h-8 opacity-20">
                  <path d="M2.87 2.298a.75.75 0 0 0-.812 1.021L3.39 6.624a1 1 0 0 0 .928.626H8.25a.75.75 0 0 1 0 1.5H4.318a1 1 0 0 0-.927.626l-1.333 3.305a.75.75 0 0 0 .812 1.021l11.07-3.548a.75.75 0 0 0 0-1.408L2.87 2.298Z" />
                </svg>
                <p className="text-sm">Enter a URL and click Send</p>
                <p className="text-xs">Supports GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS</p>
              </div>
            )}
            {response && responseTab === 'body' && responseViewMode === 'tree' && parsedJson !== null && (
              <div className="sjt" ref={treeContainerRef}>
                <TreeProvider onNotify={showToast}>
                  <TreeView
                    data={parsedJson}
                    searchQuery={responseSearch}
                    containerRef={treeContainerRef}
                  />
                </TreeProvider>
              </div>
            )}
            {response && responseTab === 'body' && (responseViewMode !== 'tree' || !parsedJson) && (
              <pre className="text-xs font-mono whitespace-pre-wrap break-all leading-relaxed" data-testid="response-body">
                {responseViewMode === 'raw' ? (
                  response.body || <span className="text-[var(--text-secondary)]">(empty response body)</span>
                ) : (isJson || responseSearch.trim()) ? (
                  <code dangerouslySetInnerHTML={{ __html: highlightedBody }} />
                ) : (
                  formattedBody || <span className="text-[var(--text-secondary)]">(empty response body)</span>
                )}
              </pre>
            )}
            {response && responseTab === 'headers' && (
              <ResponseHeaders headers={response.headers} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ApiClientPage;
