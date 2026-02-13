import { useState, useCallback } from 'react';
import ToolCard from '../common/ToolCard';
import FormatButton from '../common/FormatButton';
import CopyButton from '../common/CopyButton';

function Base64Card() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState('encode');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const encode = useCallback((text) => {
    try {
      // Unicode-safe base64 encode
      const encoded = btoa(
        encodeURIComponent(text).replace(/%([0-9A-F]{2})/g, (_, p1) =>
          String.fromCharCode(parseInt(p1, 16))
        )
      );
      setOutput(encoded);
      setError('');
    } catch (e) {
      setOutput('');
      setError('Encoding failed');
    }
  }, []);

  const decode = useCallback((text) => {
    try {
      const decoded = decodeURIComponent(
        Array.from(atob(text), (c) =>
          '%' + c.charCodeAt(0).toString(16).padStart(2, '0')
        ).join('')
      );
      setOutput(decoded);
      setError('');
    } catch (e) {
      setOutput('');
      setError('Invalid Base64 input');
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
    <ToolCard title="Base64" icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M4.22 11.78a.75.75 0 0 1 0-1.06L5.94 9 4.22 7.28a.75.75 0 0 1 1.06-1.06l2.25 2.25a.75.75 0 0 1 0 1.06l-2.25 2.25a.75.75 0 0 1-1.06 0ZM8.5 11.75a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 0 1.5h-2.5a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" /></svg>} info={{
      what: 'Encodes text to Base64 and decodes Base64 back to text. Base64 represents binary data using 64 printable ASCII characters.',
      how: 'Encoding converts UTF-8 bytes via btoa() with a URI-encoding shim for Unicode safety. Decoding reverses the process with atob() and URI-decoding.',
      usedFor: 'Embedding binary data in JSON/XML, data URIs in CSS/HTML, email attachments (MIME), and transmitting data through text-only channels.',
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
        placeholder={mode === 'encode' ? 'Text to encode...' : 'Base64 to decode...'}
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

export default Base64Card;
