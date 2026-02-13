import { useState, useCallback } from 'react';
import ToolCard from '../common/ToolCard';
import FormatButton from '../common/FormatButton';
import CopyButton from '../common/CopyButton';

function HexEncodeCard() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState('encode');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const encode = useCallback((text) => {
    try {
      const bytes = new TextEncoder().encode(text);
      const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
      setOutput(hex);
      setError('');
    } catch {
      setOutput('');
      setError('Encoding failed');
    }
  }, []);

  const decode = useCallback((text) => {
    try {
      const clean = text.replace(/\s+/g, '');
      if (!/^[0-9a-fA-F]*$/.test(clean) || clean.length % 2 !== 0) {
        setOutput('');
        setError('Invalid hex string');
        return;
      }
      const bytes = new Uint8Array(clean.length / 2);
      for (let i = 0; i < clean.length; i += 2) {
        bytes[i / 2] = parseInt(clean.slice(i, i + 2), 16);
      }
      setOutput(new TextDecoder().decode(bytes));
      setError('');
    } catch {
      setOutput('');
      setError('Invalid hex input');
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
    <ToolCard title="Hex Encode" icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4"><path d="M1 8.849c0 1.092.67 2.066 1.683 2.457l2.478.957c.29.112.512.374.584.677l.413 1.737A1.75 1.75 0 0 0 7.863 16h.274a1.75 1.75 0 0 0 1.705-1.323l.413-1.737a.85.85 0 0 1 .584-.677l2.478-.957A2.591 2.591 0 0 0 15 8.849V7.5a.5.5 0 0 0-.5-.5h-13a.5.5 0 0 0-.5.5v1.349ZM2 4.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-1ZM4.75 1a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Z" /></svg>} info={{
      what: 'Converts text to its hexadecimal byte representation and back. Each character becomes two hex digits (e.g. "Hi" → "4869").',
      how: 'Encoding uses TextEncoder to get UTF-8 bytes, then maps each byte to a two-digit hex string. Decoding reverses the process with TextDecoder.',
      usedFor: 'Inspecting raw binary data, encoding payloads for network protocols, debugging character encoding issues, and embedding data in URLs or configs.',
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
        placeholder={mode === 'encode' ? 'Text to encode...' : 'Hex string to decode...'}
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

export default HexEncodeCard;
