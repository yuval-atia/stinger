import { useState, useCallback } from 'react';
import GeneratorCard from './GeneratorCard';
import { ConfigInput, ConfigSelect, ConfigCheckbox } from './generatorHelpers';
import { generateUUIDv4, generateUUIDv1 } from '../../utils/generators';

const IconUUID = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M1 8a7 7 0 1 1 14 0A7 7 0 0 1 1 8Zm7.75-4.25a.75.75 0 0 0-1.5 0V8c0 .414.336.75.75.75h3.25a.75.75 0 0 0 0-1.5h-2.5v-3.5Z" clipRule="evenodd" />
  </svg>
);

function UUIDGenerator({ toolSlug }) {
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
      toolSlug={toolSlug}
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

export default UUIDGenerator;
