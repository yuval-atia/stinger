import { useState, useCallback } from 'react';
import GeneratorCard from './GeneratorCard';
import { ConfigInput, ConfigSelect } from './generatorHelpers';
import { generateLoremIpsum } from '../../utils/generators';

const IconLorem = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
    <path d="M2 4.5A2.5 2.5 0 0 1 4.5 2h7A2.5 2.5 0 0 1 14 4.5v7a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 2 11.5v-7Zm3.25.5a.75.75 0 0 0 0 1.5h5.5a.75.75 0 0 0 0-1.5h-5.5Zm0 3a.75.75 0 0 0 0 1.5h5.5a.75.75 0 0 0 0-1.5h-5.5Zm0 3a.75.75 0 0 0 0 1.5h3.5a.75.75 0 0 0 0-1.5h-3.5Z" />
  </svg>
);

function LoremIpsumGenerator({ toolSlug }) {
  const [count, setCount] = useState(3);
  const [unit, setUnit] = useState('paragraphs');

  const handleGenerate = useCallback(() => {
    return generateLoremIpsum(Math.min(Math.max(count, 1), 100), unit);
  }, [count, unit]);

  return (
    <GeneratorCard
      title="Lorem Ipsum"
      icon={IconLorem}
      toolSlug={toolSlug}
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

export default LoremIpsumGenerator;
