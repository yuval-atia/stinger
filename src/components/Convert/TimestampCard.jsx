import { useState, useMemo, useCallback } from 'react';
import ToolCard, { CopyField } from '../common/ToolCard';
import FormatButton from '../common/FormatButton';

function formatRelative(date) {
  const now = Date.now();
  const diff = now - date.getTime();
  const abs = Math.abs(diff);
  const future = diff < 0;
  const prefix = future ? 'in ' : '';
  const suffix = future ? '' : ' ago';

  if (abs < 1000) return 'just now';
  if (abs < 60000) return `${prefix}${Math.floor(abs / 1000)}s${suffix}`;
  if (abs < 3600000) return `${prefix}${Math.floor(abs / 60000)}m${suffix}`;
  if (abs < 86400000) return `${prefix}${Math.floor(abs / 3600000)}h${suffix}`;
  if (abs < 2592000000) return `${prefix}${Math.floor(abs / 86400000)}d${suffix}`;
  return `${prefix}${Math.floor(abs / 2592000000)}mo${suffix}`;
}

function TimestampCard() {
  const [tsInput, setTsInput] = useState('');
  const [dtInput, setDtInput] = useState('');

  const handleNow = useCallback(() => {
    const now = Math.floor(Date.now() / 1000);
    setTsInput(String(now));
    setDtInput('');
  }, []);

  // Detect seconds vs milliseconds: > 10^12 = ms
  const fromTimestamp = useMemo(() => {
    if (!tsInput.trim()) return null;
    const num = Number(tsInput.trim());
    if (isNaN(num)) return { error: 'Invalid number' };
    const ms = num > 1e12 ? num : num * 1000;
    const date = new Date(ms);
    if (isNaN(date.getTime())) return { error: 'Invalid timestamp' };
    return {
      local: date.toLocaleString(),
      utc: date.toUTCString(),
      iso: date.toISOString(),
      relative: formatRelative(date),
      isMs: num > 1e12,
    };
  }, [tsInput]);

  const fromDatetime = useMemo(() => {
    if (!dtInput) return null;
    const date = new Date(dtInput);
    if (isNaN(date.getTime())) return { error: 'Invalid date' };
    return {
      seconds: Math.floor(date.getTime() / 1000),
      milliseconds: date.getTime(),
    };
  }, [dtInput]);

  return (
    <ToolCard title="Timestamp" icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M1 8a7 7 0 1 1 14 0A7 7 0 0 1 1 8Zm7.75-4.25a.75.75 0 0 0-1.5 0V8c0 .414.336.75.75.75h3.25a.75.75 0 0 0 0-1.5h-2.5v-3.5Z" clipRule="evenodd" /></svg>} info={{
      what: 'Converts between Unix timestamps (seconds/milliseconds since epoch) and human-readable date strings in local and UTC time.',
      how: 'Uses JavaScript\'s Date object to parse and format timestamps. Supports both second and millisecond precision with auto-detection based on magnitude.',
      usedFor: 'Debugging API responses with epoch timestamps, converting log timestamps, scheduling events, and correlating times across time zones.',
    }}>
      <div className="flex items-center gap-2">
        <span className="text-xs text-[var(--text-secondary)]">Unix timestamp</span>
        <FormatButton label="Now" variant="primary" onClick={handleNow} />
      </div>
      <input
        type="text"
        value={tsInput}
        onChange={(e) => { setTsInput(e.target.value); setDtInput(''); }}
        placeholder="e.g. 1700000000"
        className="w-full px-3 py-2 text-xs font-mono rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]"
      />
      {fromTimestamp && fromTimestamp.error && (
        <div className="text-xs text-[var(--error-color)]">{fromTimestamp.error}</div>
      )}
      {fromTimestamp && !fromTimestamp.error && (
        <div className="space-y-1.5">
          {fromTimestamp.isMs && (
            <div className="text-[10px] text-[var(--text-secondary)]">Detected as milliseconds</div>
          )}
          <CopyField label="Local" value={fromTimestamp.local} />
          <CopyField label="UTC" value={fromTimestamp.utc} />
          <CopyField label="ISO 8601" value={fromTimestamp.iso} />
          <CopyField label="Relative" value={fromTimestamp.relative} />
        </div>
      )}

      <div className="border-t border-[var(--border-color)] pt-3 mt-1">
        <span className="text-xs text-[var(--text-secondary)] mb-2 block">Date to timestamp</span>
        <input
          type="datetime-local"
          value={dtInput}
          onChange={(e) => { setDtInput(e.target.value); setTsInput(''); }}
          className="w-full px-3 py-2 text-xs rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]"
        />
        {fromDatetime && fromDatetime.error && (
          <div className="text-xs text-[var(--error-color)] mt-2">{fromDatetime.error}</div>
        )}
        {fromDatetime && !fromDatetime.error && (
          <div className="space-y-1.5 mt-2">
            <CopyField label="Seconds" value={String(fromDatetime.seconds)} />
            <CopyField label="Millis" value={String(fromDatetime.milliseconds)} />
          </div>
        )}
      </div>
    </ToolCard>
  );
}

export default TimestampCard;
