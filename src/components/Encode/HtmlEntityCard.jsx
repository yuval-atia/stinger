import { useState, useCallback } from 'react';
import ToolCard from '../common/ToolCard';
import FormatButton from '../common/FormatButton';
import CopyButton from '../common/CopyButton';

const ENCODE_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
};

const ENCODE_RE = /[&<>"'`=/]/g;

function HtmlEntityCard() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState('encode');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const encode = useCallback((text) => {
    try {
      setOutput(text.replace(ENCODE_RE, (ch) => ENCODE_MAP[ch]));
      setError('');
    } catch (e) {
      setOutput('');
      setError('Encoding failed');
    }
  }, []);

  const decode = useCallback((text) => {
    try {
      const doc = new DOMParser().parseFromString(text, 'text/html');
      setOutput(doc.documentElement.textContent);
      setError('');
    } catch (e) {
      setOutput('');
      setError('Decoding failed');
    }
  }, []);

  const handleInput = (value) => {
    setInput(value);
    if (!value) { setOutput(''); setError(''); return; }
    mode === 'encode' ? encode(value) : decode(value);
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    if (!input) return;
    newMode === 'encode' ? encode(input) : decode(input);
  };

  const handleCopy = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <ToolCard title="HTML Entities" icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M2 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4Zm2-.5h8a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-.5.5H4a.5.5 0 0 1-.5-.5V4a.5.5 0 0 1 .5-.5ZM6.06 5.47a.75.75 0 0 1 0 1.06L5.12 7.47l.94.94a.75.75 0 1 1-1.06 1.06l-1.47-1.47a.75.75 0 0 1 0-1.06l1.47-1.47a.75.75 0 0 1 1.06 0Zm3.88 0a.75.75 0 0 1 1.06 0l1.47 1.47a.75.75 0 0 1 0 1.06l-1.47 1.47a.75.75 0 1 1-1.06-1.06l.94-.94-.94-.94a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" /></svg>} info={{
      what: 'Converts special characters to HTML entities (&amp;, &lt;, &gt;, etc.) and decodes HTML entities back to plain text.',
      how: 'Encoding replaces reserved HTML characters with their named or numeric entity references. Decoding uses the browser\'s built-in HTML parser via a temporary element.',
      usedFor: 'Safely embedding user content in HTML, preventing XSS attacks, displaying code snippets in web pages, and fixing double-encoded content.',
    }}>
      <div className="flex gap-2">
        <FormatButton
          label="Encode"
          variant={mode === 'encode' ? 'primary' : 'default'}
          onClick={() => handleModeChange('encode')}
        />
        <FormatButton
          label="Decode"
          variant={mode === 'decode' ? 'primary' : 'default'}
          onClick={() => handleModeChange('decode')}
        />
      </div>
      <textarea
        value={input}
        onChange={(e) => handleInput(e.target.value)}
        placeholder={mode === 'encode' ? 'HTML to encode...' : 'Entities to decode...'}
        className="w-full h-24 px-3 py-2 text-xs font-mono rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)] resize-none"
      />
      <div className="relative">
        <div className="w-full min-h-[60px] px-3 py-2 text-xs font-mono rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] break-all whitespace-pre-wrap pr-8">
          {error ? (
            <span className="text-[var(--error-color)]">{error}</span>
          ) : (
            output || <span className="text-[var(--text-secondary)]">Output will appear here</span>
          )}
        </div>
        {output && (
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

export default HtmlEntityCard;
