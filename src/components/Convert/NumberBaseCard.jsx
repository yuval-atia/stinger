import { useState, useMemo } from 'react';
import ToolCard, { CopyField } from '../common/ToolCard';

const BASES = [
  { value: 10, label: 'Decimal' },
  { value: 16, label: 'Hexadecimal' },
  { value: 8, label: 'Octal' },
  { value: 2, label: 'Binary' },
];

function NumberBaseCard() {
  const [input, setInput] = useState('');
  const [base, setBase] = useState(10);

  const parsed = useMemo(() => {
    const trimmed = input.trim();
    if (!trimmed) return null;
    try {
      let value;
      if (base === 16) {
        value = BigInt('0x' + trimmed.replace(/^0x/i, ''));
      } else if (base === 8) {
        value = BigInt('0o' + trimmed.replace(/^0o/i, ''));
      } else if (base === 2) {
        value = BigInt('0b' + trimmed.replace(/^0b/i, ''));
      } else {
        value = BigInt(trimmed);
      }
      return { value };
    } catch {
      return { error: 'Invalid number for base ' + base };
    }
  }, [input, base]);

  const results = useMemo(() => {
    if (!parsed || parsed.error) return [];
    const v = parsed.value;
    const negative = v < 0n;
    const abs = negative ? -v : v;
    const prefix = negative ? '-' : '';
    return [
      { label: 'Decimal', value: prefix + abs.toString(10) },
      { label: 'Hex', value: prefix + '0x' + abs.toString(16).toUpperCase() },
      { label: 'Octal', value: prefix + '0o' + abs.toString(8) },
      { label: 'Binary', value: prefix + '0b' + abs.toString(2) },
    ];
  }, [parsed]);

  return (
    <ToolCard title="Number Base" icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4"><path d="M4.5 2A2.5 2.5 0 0 0 2 4.5v2.879a2.5 2.5 0 0 0 .732 1.767l4.5 4.5a2.5 2.5 0 0 0 3.536 0l2.878-2.878a2.5 2.5 0 0 0 0-3.536l-4.5-4.5A2.5 2.5 0 0 0 7.379 2H4.5ZM5 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" /></svg>} info={{
      what: 'Converts numbers between decimal (base 10), hexadecimal (base 16), octal (base 8), and binary (base 2) representations.',
      how: 'Uses JavaScript BigInt for arbitrary-precision parsing and conversion, supporting very large numbers without overflow.',
      usedFor: 'Low-level programming, reading memory addresses, understanding file permissions (octal), bitwise operations, and color codes (hex).',
    }}>
      <div className="flex items-center gap-2">
        <span className="text-xs text-[var(--text-secondary)]">Input base</span>
        <select
          value={base}
          onChange={(e) => setBase(Number(e.target.value))}
          className="px-2 py-1 text-xs rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]"
        >
          {BASES.map((b) => (
            <option key={b.value} value={b.value}>{b.label}</option>
          ))}
        </select>
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={base === 16 ? 'e.g. FF' : base === 8 ? 'e.g. 377' : base === 2 ? 'e.g. 11111111' : 'e.g. 255'}
        className="w-full px-3 py-2 text-xs font-mono rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]"
      />
      {parsed && parsed.error && (
        <div className="text-xs text-[var(--error-color)]">{parsed.error}</div>
      )}
      {results.length > 0 && (
        <div className="space-y-1.5">
          {results.map(({ label, value }) => (
            <CopyField key={label} label={label} value={value} />
          ))}
        </div>
      )}
    </ToolCard>
  );
}

export default NumberBaseCard;
