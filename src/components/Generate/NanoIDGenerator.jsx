import { useState, useCallback } from 'react';
import GeneratorCard from './GeneratorCard';
import { ConfigInput } from './generatorHelpers';
import { generateNanoID } from '../../utils/generators';

const IconNanoID = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M8 1a3.5 3.5 0 0 0-3.5 3.5V7A1.5 1.5 0 0 0 3 8.5v5A1.5 1.5 0 0 0 4.5 15h7a1.5 1.5 0 0 0 1.5-1.5v-5A1.5 1.5 0 0 0 11.5 7V4.5A3.5 3.5 0 0 0 8 1Zm2 6V4.5a2 2 0 1 0-4 0V7h4Z" clipRule="evenodd" />
  </svg>
);

function NanoIDGenerator({ toolSlug }) {
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
      toolSlug={toolSlug}
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

export default NanoIDGenerator;
