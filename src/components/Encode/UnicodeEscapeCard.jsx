import { useState, useCallback } from 'react';
import ToolCard from '../common/ToolCard';
import FormatButton from '../common/FormatButton';
import CopyButton from '../common/CopyButton';

function UnicodeEscapeCard() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState('encode');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const encode = useCallback((text) => {
    try {
      const escaped = Array.from(text)
        .map((ch) => '\\u' + ch.codePointAt(0).toString(16).padStart(4, '0'))
        .join('');
      setOutput(escaped);
      setError('');
    } catch {
      setOutput('');
      setError('Encoding failed');
    }
  }, []);

  const decode = useCallback((text) => {
    try {
      const decoded = text.replace(/\\u([0-9a-fA-F]{4,6})/g, (_, hex) =>
        String.fromCodePoint(parseInt(hex, 16))
      );
      setOutput(decoded);
      setError('');
    } catch {
      setOutput('');
      setError('Invalid unicode escape sequence');
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
    <ToolCard title="Unicode Escape" icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M1 8a7 7 0 1 1 14 0A7 7 0 0 1 1 8Zm7.75-4.25a.75.75 0 0 0-1.5 0V8c0 .414.336.75.75.75h3.25a.75.75 0 0 0 0-1.5h-2.5v-3.5Z" clipRule="evenodd" /></svg>} info={{
      what: 'Converts text to Unicode escape sequences (\\u0048\\u0065\\u006C) and back. Each character is represented by its code point.',
      how: 'Encoding uses codePointAt() to get each character\'s Unicode value, then formats it as \\uXXXX. Decoding parses \\u sequences with parseInt.',
      usedFor: 'Embedding non-ASCII characters in source code, JSON strings, config files, and debugging internationalization issues.',
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
        placeholder={mode === 'encode' ? 'Text to encode...' : 'Unicode escapes to decode...'}
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

export default UnicodeEscapeCard;
