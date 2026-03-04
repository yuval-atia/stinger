import { useState, useCallback, useMemo } from 'react';
import GeneratorCard from './GeneratorCard';
import { ConfigInput } from './generatorHelpers';
import { generateULID, decodeULIDTimestamp } from '../../utils/generators';

const IconULID = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M1 8a7 7 0 1 1 14 0A7 7 0 0 1 1 8Zm10.25 1.5a.75.75 0 0 0 0-1.5H5.56l2.22-2.22a.75.75 0 0 0-1.06-1.06l-3.5 3.5a.75.75 0 0 0 0 1.06l3.5 3.5a.75.75 0 0 0 1.06-1.06L5.56 9.5h5.69Z" clipRule="evenodd" />
  </svg>
);

function ULIDGenerator({ toolSlug }) {
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
      toolSlug={toolSlug}
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

export default ULIDGenerator;
