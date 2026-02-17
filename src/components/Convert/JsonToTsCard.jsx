import { useState, useMemo } from 'react';
import ToolCard from '../common/ToolCard';
import CopyButton from '../common/CopyButton';
import { jsonToTypeScript } from '../../utils/jsonToTs';

function JsonToTsCard() {
  const [input, setInput] = useState('');
  const [rootName, setRootName] = useState('Root');
  const [copied, setCopied] = useState(false);

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: '', error: '' };
    try {
      return { output: jsonToTypeScript(input, rootName || 'Root'), error: '' };
    } catch {
      return { output: '', error: 'Invalid JSON' };
    }
  }, [input, rootName]);

  const handleCopy = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <ToolCard title="JSON → TypeScript" icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M4.22 11.78a.75.75 0 0 1 0-1.06L5.94 9 4.22 7.28a.75.75 0 0 1 1.06-1.06l2.25 2.25a.75.75 0 0 1 0 1.06l-2.25 2.25a.75.75 0 0 1-1.06 0ZM8.5 11.75a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 0 1.5h-2.5a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" /></svg>} info={{
      what: 'Generates TypeScript interfaces from JSON data. Infers types for strings, numbers, booleans, arrays, and nested objects.',
      how: 'Parses JSON and recursively walks the structure, creating named interfaces for each object shape. Arrays infer the element type from the first item.',
      usedFor: 'Quickly typing API responses, creating DTOs from sample data, bootstrapping TypeScript projects, and documenting data shapes.',
    }}>
      <div className="flex items-center gap-2">
        <label className="text-xs text-[var(--text-secondary)]">Root name</label>
        <input
          type="text"
          value={rootName}
          onChange={(e) => setRootName(e.target.value)}
          className="w-28 px-2 py-1 text-xs rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]"
        />
      </div>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder='{"name": "Alice", "age": 30, "roles": ["admin"]}'
        className="w-full h-28 px-3 py-2 text-xs font-mono rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)] resize-none"
      />
      <div className="relative">
        <div className="w-full min-h-[60px] max-h-48 px-3 py-2 text-xs font-mono rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] whitespace-pre-wrap break-all overflow-auto pr-8">
          {error ? (
            <span className="text-[var(--error-color)]">{error}</span>
          ) : output ? (
            <span className="animate-fade-in">{output}</span>
          ) : (
            <span className="text-[var(--text-secondary)]">TypeScript types will appear here</span>
          )}
        </div>
        {output && !error && (
          <div className="absolute top-2 right-2">
            <CopyButton onClick={handleCopy} tooltip={copied ? 'Copied!' : 'Copy'}>
              {copied ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-[var(--success-color)]"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0117 6.622V12.5a1.5 1.5 0 01-1.5 1.5h-1v-3.379a3 3 0 00-.879-2.121L10.5 5.379A3 3 0 008.379 4.5H7v-1z" /><path d="M4.5 6A1.5 1.5 0 003 7.5v9A1.5 1.5 0 004.5 18h7a1.5 1.5 0 001.5-1.5v-5.879a1.5 1.5 0 00-.44-1.06L9.44 6.439A1.5 1.5 0 008.378 6H4.5z" /></svg>
              )}
            </CopyButton>
          </div>
        )}
      </div>
    </ToolCard>
  );
}

export default JsonToTsCard;
