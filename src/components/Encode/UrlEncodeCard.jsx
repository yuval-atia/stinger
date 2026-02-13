import { useState, useCallback } from 'react';
import ToolCard from '../common/ToolCard';
import FormatButton from '../common/FormatButton';
import CopyButton from '../common/CopyButton';

function UrlEncodeCard() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState('encode');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const encode = useCallback((text) => {
    try {
      setOutput(encodeURIComponent(text));
      setError('');
    } catch (e) {
      setOutput('');
      setError('Encoding failed');
    }
  }, []);

  const decode = useCallback((text) => {
    try {
      setOutput(decodeURIComponent(text));
      setError('');
    } catch (e) {
      setOutput('');
      setError('Invalid URL-encoded input');
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
    <ToolCard title="URL Encode" icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4"><path d="M8.914 6.025a.75.75 0 0 1 1.06 0 3.5 3.5 0 0 1 0 4.95l-2 2a3.5 3.5 0 0 1-5.05-4.84.75.75 0 0 1 1.152.96A2 2 0 0 0 4.99 12.1l2-2a2 2 0 0 0 0-2.83.75.75 0 0 1 0-1.06l-.076.075.076-.075ZM7.086 9.975a.75.75 0 0 1-1.06 0 3.5 3.5 0 0 1 0-4.95l2-2a3.5 3.5 0 0 1 5.05 4.84.75.75 0 0 1-1.152-.96A2 2 0 0 0 11.01 3.9l-2 2a2 2 0 0 0 0 2.83.75.75 0 0 1 0 1.06l.076-.075-.076.075Z" /></svg>} info={{
      what: 'Percent-encodes text for safe use in URLs and decodes percent-encoded strings back to readable text.',
      how: 'Uses encodeURIComponent() which replaces unsafe characters with %XX hex sequences. Decoding uses decodeURIComponent() to reverse the process.',
      usedFor: 'Building query strings, encoding form data, constructing API URLs with special characters, and debugging malformed URLs.',
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
        placeholder={mode === 'encode' ? 'Text to encode...' : 'URL-encoded text to decode...'}
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

export default UrlEncodeCard;
