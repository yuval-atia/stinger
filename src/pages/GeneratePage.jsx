import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import GeneratorCard from '../components/Generate/GeneratorCard';
import {
  generateUUIDv4,
  generateUUIDv1,
  generateULID,
  decodeULIDTimestamp,
  generateNanoID,
  generateAPIKey,
  calcKeyEntropy,
  generateLoremIpsum,
  generateQRSvg,
} from '../utils/generators';

// ── Shared config controls ───────────────────────────────────────────────────

function ConfigInput({ label, type = 'number', value, onChange, ...props }) {
  return (
    <label className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
      {label}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
        className="w-20 px-2 py-1 text-xs rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]"
        {...props}
      />
    </label>
  );
}

function ConfigSelect({ label, value, onChange, options }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
      {label}
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 px-2 py-1 text-xs rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] outline-none hover:border-[var(--accent-color)] transition-colors"
        >
          {selected?.label}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className={`w-3 h-3 text-[var(--text-secondary)] transition-transform ${open ? 'rotate-180' : ''}`}>
            <path fillRule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
          </svg>
        </button>
        {open && (
          <div className="absolute z-50 mt-1 left-0 min-w-full rounded border border-[var(--border-color)] bg-[var(--bg-primary)] shadow-lg overflow-hidden">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${
                  opt.value === value
                    ? 'bg-[var(--accent-color)] text-white'
                    : 'text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ConfigCheckbox({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] cursor-pointer select-none">
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
          checked
            ? 'bg-[var(--accent-color)] border-[var(--accent-color)]'
            : 'bg-[var(--bg-secondary)] border-[var(--border-color)] hover:border-[var(--accent-color)]'
        }`}
      >
        {checked && (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="white" className="w-3 h-3">
            <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
          </svg>
        )}
      </button>
      {label}
    </label>
  );
}

// ── Card icons (SVG) ─────────────────────────────────────────────────────────

const IconUUID = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M1 8a7 7 0 1 1 14 0A7 7 0 0 1 1 8Zm7.75-4.25a.75.75 0 0 0-1.5 0V8c0 .414.336.75.75.75h3.25a.75.75 0 0 0 0-1.5h-2.5v-3.5Z" clipRule="evenodd" />
  </svg>
);

const IconULID = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M1 8a7 7 0 1 1 14 0A7 7 0 0 1 1 8Zm10.25 1.5a.75.75 0 0 0 0-1.5H5.56l2.22-2.22a.75.75 0 0 0-1.06-1.06l-3.5 3.5a.75.75 0 0 0 0 1.06l3.5 3.5a.75.75 0 0 0 1.06-1.06L5.56 9.5h5.69Z" clipRule="evenodd" />
  </svg>
);

const IconNanoID = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M8 1a3.5 3.5 0 0 0-3.5 3.5V7A1.5 1.5 0 0 0 3 8.5v5A1.5 1.5 0 0 0 4.5 15h7a1.5 1.5 0 0 0 1.5-1.5v-5A1.5 1.5 0 0 0 11.5 7V4.5A3.5 3.5 0 0 0 8 1Zm2 6V4.5a2 2 0 1 0-4 0V7h4Z" clipRule="evenodd" />
  </svg>
);

const IconAPIKey = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M8 1a3.5 3.5 0 0 0-3.5 3.5V7A1.5 1.5 0 0 0 3 8.5v5A1.5 1.5 0 0 0 4.5 15h7a1.5 1.5 0 0 0 1.5-1.5v-5A1.5 1.5 0 0 0 11.5 7V4.5A3.5 3.5 0 0 0 8 1Zm2 6V4.5a2 2 0 1 0-4 0V7h4Zm-2 2.5a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 8 9.5Z" clipRule="evenodd" />
  </svg>
);

const IconQR = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M2 2h5v5H2V2Zm1.5 1.5v2h2v-2h-2ZM9 2h5v5H9V2Zm1.5 1.5v2h2v-2h-2ZM2 9h5v5H2V9Zm1.5 1.5v2h2v-2h-2ZM12 9h2v2h-2V9ZM9 12h2v2H9v-2Zm3 0h2v2h-2v-2ZM9 9h2v2H9V9Z" clipRule="evenodd" />
  </svg>
);

const IconLorem = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
    <path d="M2 4.5A2.5 2.5 0 0 1 4.5 2h7A2.5 2.5 0 0 1 14 4.5v7a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 2 11.5v-7Zm3.25.5a.75.75 0 0 0 0 1.5h5.5a.75.75 0 0 0 0-1.5h-5.5Zm0 3a.75.75 0 0 0 0 1.5h5.5a.75.75 0 0 0 0-1.5h-5.5Zm0 3a.75.75 0 0 0 0 1.5h3.5a.75.75 0 0 0 0-1.5h-3.5Z" />
  </svg>
);

// ── UUID Generator ───────────────────────────────────────────────────────────
function UUIDGenerator() {
  const [version, setVersion] = useState('v4');
  const [count, setCount] = useState(1);
  const [uppercase, setUppercase] = useState(false);

  const handleGenerate = useCallback(() => {
    const gen = version === 'v4' ? generateUUIDv4 : generateUUIDv1;
    const results = Array.from({ length: Math.min(Math.max(count, 1), 50) }, gen);
    return uppercase ? results.join('\n').toUpperCase() : results.join('\n');
  }, [version, count, uppercase]);

  return (
    <GeneratorCard
      title="UUID"
      icon={IconUUID}
      info={{
        what: 'Universally Unique Identifier — a 128-bit label for identifying resources without a central authority.',
        how: 'v4 uses the native crypto.randomUUID() API (purely random). v1 embeds a millisecond timestamp with random node bytes.',
        usedFor: 'Database primary keys, session tokens, distributed system identifiers, and cross-service correlation IDs.',
      }}
      onGenerate={handleGenerate}
    >
      <ConfigSelect
        label="Version"
        value={version}
        onChange={setVersion}
        options={[
          { value: 'v4', label: 'v4 (random)' },
          { value: 'v1', label: 'v1 (timestamp)' },
        ]}
      />
      <ConfigInput label="Count" value={count} onChange={setCount} min={1} max={50} />
      <ConfigCheckbox label="Uppercase" checked={uppercase} onChange={setUppercase} />
    </GeneratorCard>
  );
}

// ── ULID Generator ───────────────────────────────────────────────────────────
function ULIDGenerator() {
  const [count, setCount] = useState(1);
  const [output, setOutput] = useState('');

  const handleGenerate = useCallback(() => {
    const result = Array.from({ length: Math.min(Math.max(count, 1), 50) }, generateULID).join('\n');
    setOutput(result);
    return result;
  }, [count]);

  const decodedTime = useMemo(() => {
    if (!output) return null;
    const firstUlid = output.split('\n')[0];
    if (!firstUlid || firstUlid.length < 10) return null;
    try {
      const date = decodeULIDTimestamp(firstUlid);
      return date.toISOString().replace('T', ' ').replace('Z', ' UTC');
    } catch {
      return null;
    }
  }, [output]);

  const timestampFooter = decodedTime ? (
    <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-secondary)]">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 flex-shrink-0">
        <path fillRule="evenodd" d="M1 8a7 7 0 1 1 14 0A7 7 0 0 1 1 8Zm7.75-4.25a.75.75 0 0 0-1.5 0V8c0 .414.336.75.75.75h3.25a.75.75 0 0 0 0-1.5h-2.5v-3.5Z" clipRule="evenodd" />
      </svg>
      Timestamp: {decodedTime}
    </div>
  ) : null;

  return (
    <GeneratorCard
      title="ULID"
      icon={IconULID}
      info={{
        what: 'Universally Unique Lexicographically Sortable Identifier — a 128-bit ID that sorts chronologically.',
        how: 'Encodes a 48-bit millisecond timestamp plus 80-bit cryptographic randomness, encoded in Crockford Base32 (26 chars).',
        usedFor: 'Event logs, time-series databases, and anywhere you need IDs that naturally sort by creation time.',
      }}
      onGenerate={handleGenerate}
      footer={timestampFooter}
    >
      <ConfigInput label="Count" value={count} onChange={setCount} min={1} max={50} />
    </GeneratorCard>
  );
}

// ── NanoID Generator ─────────────────────────────────────────────────────────
function NanoIDGenerator() {
  const [length, setLength] = useState(21);
  const [alphabet, setAlphabet] = useState('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-');
  const [count, setCount] = useState(1);

  const handleGenerate = useCallback(() => {
    const len = Math.min(Math.max(length, 1), 128);
    const alpha = alphabet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';
    return Array.from({ length: Math.min(Math.max(count, 1), 50) }, () => generateNanoID(len, alpha)).join('\n');
  }, [length, alphabet, count]);

  return (
    <GeneratorCard
      title="NanoID"
      icon={IconNanoID}
      info={{
        what: 'A tiny, URL-friendly unique string ID. Default 21 chars gives ~149 bits of entropy — comparable to UUID but shorter.',
        how: 'Uses crypto.getRandomValues() with rejection sampling over a customizable alphabet for uniform distribution.',
        usedFor: 'Short URL slugs, client-side IDs, file names, and anywhere a compact, URL-safe identifier is needed.',
      }}
      onGenerate={handleGenerate}
    >
      <ConfigInput label="Length" value={length} onChange={setLength} min={1} max={128} />
      <ConfigInput
        label="Alphabet"
        type="text"
        value={alphabet}
        onChange={setAlphabet}
        className="w-48 px-2 py-1 text-xs rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]"
      />
      <ConfigInput label="Count" value={count} onChange={setCount} min={1} max={50} />
    </GeneratorCard>
  );
}

// ── API Key Generator ────────────────────────────────────────────────────────
function APIKeyGenerator() {
  const [length, setLength] = useState(32);
  const [prefix, setPrefix] = useState('');
  const [charset, setCharset] = useState({
    uppercase: true,
    lowercase: true,
    digits: true,
    special: false,
  });

  const toggleCharset = useCallback((key) => {
    setCharset((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleGenerate = useCallback(() => {
    const len = Math.min(Math.max(length, 8), 128);
    return generateAPIKey(len, prefix, charset);
  }, [length, prefix, charset]);

  const entropy = useMemo(() => {
    return calcKeyEntropy(Math.min(Math.max(length, 8), 128), charset);
  }, [length, charset]);

  const strengthColor = entropy.label === 'Very strong'
    ? 'var(--success-color)'
    : entropy.label === 'Strong'
      ? 'var(--accent-color)'
      : entropy.label === 'Moderate'
        ? 'var(--diff-change)'
        : 'var(--error-color)';

  const strengthPercent = Math.min((entropy.bits / 128) * 100, 100);

  const strengthFooter = (
    <div className="flex items-center gap-2 text-[10px] text-[var(--text-secondary)]">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 flex-shrink-0">
        <path fillRule="evenodd" d="M8 1a3.5 3.5 0 0 0-3.5 3.5V7A1.5 1.5 0 0 0 3 8.5v5A1.5 1.5 0 0 0 4.5 15h7a1.5 1.5 0 0 0 1.5-1.5v-5A1.5 1.5 0 0 0 11.5 7V4.5A3.5 3.5 0 0 0 8 1Zm2 6V4.5a2 2 0 1 0-4 0V7h4Z" clipRule="evenodd" />
      </svg>
      <span>{entropy.bits}-bit entropy</span>
      <div className="flex-1 h-1.5 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${strengthPercent}%`, backgroundColor: strengthColor }}
        />
      </div>
      <span style={{ color: strengthColor }} className="font-medium">{entropy.label}</span>
    </div>
  );

  return (
    <GeneratorCard
      title="API Key"
      icon={IconAPIKey}
      info={{
        what: 'A random secret string used to authenticate API requests, typically prefixed to indicate scope (sk_ for secret, pk_ for public).',
        how: 'Generated with crypto.getRandomValues() over a configurable character set for cryptographic-grade randomness.',
        usedFor: 'SaaS platform authentication, payment gateway credentials, service-to-service tokens, and webhook signing secrets.',
      }}
      onGenerate={handleGenerate}
      footer={strengthFooter}
    >
      <ConfigInput label="Length" value={length} onChange={setLength} min={8} max={128} />
      <ConfigInput label="Prefix" type="text" value={prefix} onChange={setPrefix} placeholder="sk_" />
      <ConfigCheckbox label="A-Z" checked={charset.uppercase} onChange={() => toggleCharset('uppercase')} />
      <ConfigCheckbox label="a-z" checked={charset.lowercase} onChange={() => toggleCharset('lowercase')} />
      <ConfigCheckbox label="0-9" checked={charset.digits} onChange={() => toggleCharset('digits')} />
      <ConfigCheckbox label="Special" checked={charset.special} onChange={() => toggleCharset('special')} />
    </GeneratorCard>
  );
}

// ── Lorem Ipsum Generator ────────────────────────────────────────────────────
function LoremIpsumGenerator() {
  const [count, setCount] = useState(3);
  const [unit, setUnit] = useState('paragraphs');

  const handleGenerate = useCallback(() => {
    return generateLoremIpsum(Math.min(Math.max(count, 1), 100), unit);
  }, [count, unit]);

  return (
    <GeneratorCard
      title="Lorem Ipsum"
      icon={IconLorem}
      info={{
        what: 'Classic placeholder text derived from a 1st-century BC Latin work by Cicero, used in typesetting since the 1500s.',
        how: 'Randomly assembled from the standard Lorem Ipsum vocabulary bank into words, sentences, or paragraphs.',
        usedFor: 'Mocking up UI layouts, testing typography and text rendering, and filling content areas during development.',
      }}
      onGenerate={handleGenerate}
    >
      <ConfigInput label="Count" value={count} onChange={setCount} min={1} max={100} />
      <ConfigSelect
        label="Unit"
        value={unit}
        onChange={setUnit}
        options={[
          { value: 'paragraphs', label: 'Paragraphs' },
          { value: 'sentences', label: 'Sentences' },
          { value: 'words', label: 'Words' },
        ]}
      />
    </GeneratorCard>
  );
}

// ── QR Code Generator ─────────────────────────────────────────────────────────
function QRCodeGenerator() {
  const [text, setText] = useState('https://stingr.dev');
  const [errorLevel, setErrorLevel] = useState('M');

  const handleGenerate = useCallback(() => {
    return generateQRSvg(text, errorLevel);
  }, [text, errorLevel]);

  const handleDownload = useCallback(() => {
    const svg = generateQRSvg(text, errorLevel);
    if (!svg) return;
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'stingrQR.svg';
    a.click();
    URL.revokeObjectURL(url);
  }, [text, errorLevel]);

  const downloadFooter = (
    <button
      type="button"
      onClick={handleDownload}
      className="flex items-center gap-1.5 text-[10px] text-[var(--text-secondary)] hover:text-[var(--accent-color)] transition-colors"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 flex-shrink-0">
        <path d="M2.75 14A1.75 1.75 0 0 1 1 12.25v-2.5a.75.75 0 0 1 1.5 0v2.5c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25v-2.5a.75.75 0 0 1 1.5 0v2.5A1.75 1.75 0 0 1 13.25 14H2.75Z" />
        <path d="M7.25 7.689V2a.75.75 0 0 1 1.5 0v5.689l1.97-1.969a.749.749 0 1 1 1.06 1.06l-3.25 3.25a.749.749 0 0 1-1.06 0L4.22 6.78a.749.749 0 1 1 1.06-1.06l1.97 1.969Z" />
      </svg>
      Download SVG
    </button>
  );

  return (
    <GeneratorCard
      title="QR Code"
      icon={IconQR}
      info={{
        what: 'A 2D matrix barcode that encodes text, URLs, or data into a pattern of dark and light modules scannable by cameras.',
        how: 'Uses Reed-Solomon error correction to encode data into a grid of modules, with four configurable error recovery levels (L/M/Q/H). Higher levels = more redundant data = bigger QR grid, but more forgiving if part of it gets scratched, covered, or has a logo overlaid.',
        usedFor: 'Sharing URLs, Wi-Fi credentials, contact info, payment links, product tracking, and event tickets.',
      }}
      onGenerate={handleGenerate}
      footer={downloadFooter}
      renderOutput={(svg) => (
        <div
          className="h-full flex items-center justify-center [&>svg]:max-h-full [&>svg]:max-w-full [&>svg]:h-full"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      )}
    >
      <ConfigInput
        label="Text"
        type="text"
        value={text}
        onChange={setText}
        className="w-48 px-2 py-1 text-xs rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]"
      />
      <ConfigSelect
        label="Error Level"
        value={errorLevel}
        onChange={setErrorLevel}
        options={[
          { value: 'L', label: 'L (7%)' },
          { value: 'M', label: 'M (15%)' },
          { value: 'Q', label: 'Q (25%)' },
          { value: 'H', label: 'H (30%)' },
        ]}
      />
    </GeneratorCard>
  );
}

// ── Imported generators ──────────────────────────────────────────────────────
import PasswordGenerator from '../components/Generate/PasswordGenerator';
import FakeDataGenerator from '../components/Generate/FakeDataGenerator';
import ColorPaletteGenerator from '../components/Generate/ColorPaletteGenerator';

// ── Page ─────────────────────────────────────────────────────────────────────
function GeneratePage() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-4">
        <UUIDGenerator />
        <APIKeyGenerator />
        <PasswordGenerator />
        <NanoIDGenerator />
        <ULIDGenerator />
        <LoremIpsumGenerator />
        <QRCodeGenerator />
        <FakeDataGenerator />
        <ColorPaletteGenerator />
      </div>
    </div>
  );
}

export default GeneratePage;
