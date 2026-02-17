import { useState, useMemo } from 'react';
import ToolCard from '../common/ToolCard';
import FormatButton from '../common/FormatButton';
import CopyButton from '../common/CopyButton';
import { jsonEscape, jsonUnescape } from '../../utils/jsonEscape';

function JsonEscapeCard() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState('escape');
  const [copied, setCopied] = useState(false);

  const { output, error } = useMemo(() => {
    if (!input) return { output: '', error: '' };
    if (mode === 'escape') {
      return { output: jsonEscape(input), error: '' };
    }
    const { result, error: err } = jsonUnescape(input);
    return { output: result, error: err };
  }, [input, mode]);

  const handleCopy = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <ToolCard title="JSON Escape" icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M1 8.74c0 .983.713 1.825 1.69 1.943.764.092 1.534.164 2.31.216v2.351a.75.75 0 0 0 1.28.53l2.51-2.51c.182-.181.427-.283.684-.291A44.4 44.4 0 0 0 14 10.66c.707-.118 1.22-.96 1.22-1.92V4.26c0-.96-.513-1.802-1.22-1.92A44.7 44.7 0 0 0 8 2c-2.12 0-4.19.147-6.22.436C1.032 2.558.32 3.4.32 4.36v4.38H1Z" clipRule="evenodd" /></svg>} info={{
      what: 'Escapes special characters for safe embedding in JSON strings, or unescapes JSON-encoded strings back to plain text.',
      how: 'Escape mode uses JSON.stringify to handle quotes, backslashes, newlines, tabs, and Unicode. Unescape mode parses the escaped string back.',
      usedFor: 'Preparing text for JSON payloads, debugging escaped API responses, and cleaning up copy-pasted JSON strings.',
    }}>
      <div className="flex gap-2">
        <FormatButton label="Escape" variant={mode === 'escape' ? 'primary' : 'default'} onClick={() => setMode('escape')} />
        <FormatButton label="Unescape" variant={mode === 'unescape' ? 'primary' : 'default'} onClick={() => setMode('unescape')} />
      </div>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={mode === 'escape' ? 'Text to escape for JSON...' : 'Escaped string to unescape...'}
        className="w-full h-28 px-3 py-2 text-xs font-mono rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)] resize-none"
      />
      <div className="relative">
        <div className="w-full min-h-[60px] px-3 py-2 text-xs font-mono rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] break-all whitespace-pre-wrap pr-8">
          {error ? (
            <span className="text-[var(--error-color)]">{error}</span>
          ) : output ? (
            <span className="animate-fade-in">{output}</span>
          ) : (
            <span className="text-[var(--text-secondary)]">Output will appear here</span>
          )}
        </div>
        {output && !error && (
          <div className="absolute top-2 right-2">
            <CopyButton onClick={handleCopy} tooltip={copied ? 'Copied!' : 'Copy'}>
              {copied ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-[var(--success-color)]">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0117 6.622V12.5a1.5 1.5 0 01-1.5 1.5h-1v-3.379a3 3 0 00-.879-2.121L10.5 5.379A3 3 0 008.379 4.5H7v-1z" />
                  <path d="M4.5 6A1.5 1.5 0 003 7.5v9A1.5 1.5 0 004.5 18h7a1.5 1.5 0 001.5-1.5v-5.879a1.5 1.5 0 00-.44-1.06L9.44 6.439A1.5 1.5 0 008.378 6H4.5z" />
                </svg>
              )}
            </CopyButton>
          </div>
        )}
      </div>
    </ToolCard>
  );
}

export default JsonEscapeCard;
