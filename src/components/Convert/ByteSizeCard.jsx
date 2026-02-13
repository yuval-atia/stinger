import { useState, useMemo } from 'react';
import ToolCard, { CopyField } from '../common/ToolCard';

const UNITS = [
  { label: 'Bytes', value: 'B', factor: 1 },
  { label: 'KB', value: 'KB', factor: 1024 },
  { label: 'MB', value: 'MB', factor: 1024 ** 2 },
  { label: 'GB', value: 'GB', factor: 1024 ** 3 },
  { label: 'TB', value: 'TB', factor: 1024 ** 4 },
  { label: 'PB', value: 'PB', factor: 1024 ** 5 },
];

function formatValue(bytes, factor) {
  const val = bytes / factor;
  if (val === Math.floor(val)) return val.toLocaleString();
  return val.toLocaleString(undefined, { maximumFractionDigits: 6 });
}

function ByteSizeCard() {
  const [input, setInput] = useState('');
  const [unit, setUnit] = useState('MB');

  const bytes = useMemo(() => {
    const num = parseFloat(input);
    if (isNaN(num) || num < 0) return null;
    const unitDef = UNITS.find((u) => u.value === unit);
    return num * unitDef.factor;
  }, [input, unit]);

  return (
    <ToolCard title="Byte Size" icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4"><path d="M3.5 2A1.5 1.5 0 0 0 2 3.5v9A1.5 1.5 0 0 0 3.5 14h9a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 12.5 2h-9ZM5 5.75A.75.75 0 0 1 5.75 5h4.5a.75.75 0 0 1 0 1.5h-4.5A.75.75 0 0 1 5 5.75ZM5.75 8a.75.75 0 0 0 0 1.5h4.5a.75.75 0 0 0 0-1.5h-4.5Zm0 3a.75.75 0 0 0 0 1.5h2.5a.75.75 0 0 0 0-1.5h-2.5Z" /></svg>} info={{
      what: 'Converts data sizes between bytes, KB, MB, GB, TB, and PB using binary (1024-based) units.',
      how: 'Multiplies/divides by powers of 1024 to convert between units. Uses binary prefixes (KiB convention) where 1 KB = 1024 bytes.',
      usedFor: 'Estimating storage requirements, interpreting file sizes, configuring memory limits, and planning bandwidth allocation.',
    }}>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter value..."
          min="0"
          className="flex-1 px-3 py-2 text-xs font-mono rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]"
        />
        <select
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          className="px-2 py-2 text-xs rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]"
        >
          {UNITS.map((u) => (
            <option key={u.value} value={u.value}>{u.label}</option>
          ))}
        </select>
      </div>
      {bytes !== null && (
        <div className="space-y-1.5">
          {UNITS.map((u) => (
            <CopyField key={u.value} label={u.label} value={formatValue(bytes, u.factor)} />
          ))}
        </div>
      )}
    </ToolCard>
  );
}

export default ByteSizeCard;
