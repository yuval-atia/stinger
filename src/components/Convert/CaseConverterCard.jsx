import { useState, useMemo } from 'react';
import ToolCard, { CopyField } from '../common/ToolCard';
import {
  tokenize,
  toCamelCase,
  toPascalCase,
  toSnakeCase,
  toKebabCase,
  toConstantCase,
  toTitleCase,
} from '../../utils/caseConverter';

const CASES = [
  { key: 'camel', label: 'camelCase', fn: toCamelCase },
  { key: 'pascal', label: 'PascalCase', fn: toPascalCase },
  { key: 'snake', label: 'snake_case', fn: toSnakeCase },
  { key: 'kebab', label: 'kebab-case', fn: toKebabCase },
  { key: 'constant', label: 'CONSTANT_CASE', fn: toConstantCase },
  { key: 'title', label: 'Title Case', fn: toTitleCase },
];

function CaseConverterCard() {
  const [input, setInput] = useState('');

  const tokens = useMemo(() => tokenize(input), [input]);

  const results = useMemo(() => {
    if (!tokens.length) return [];
    return CASES.map(({ key, label, fn }) => ({
      key,
      label,
      value: fn(tokens),
    }));
  }, [tokens]);

  return (
    <ToolCard title="Case Converter" icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4"><path d="M3.28 2.22a.75.75 0 0 0-1.06 1.06L5.44 6.5H2.75a.75.75 0 0 0 0 1.5h4.5a.75.75 0 0 0 .75-.75v-4.5a.75.75 0 0 0-1.5 0v2.69L3.28 2.22ZM12.72 13.78a.75.75 0 1 0 1.06-1.06L10.56 9.5h2.69a.75.75 0 0 0 0-1.5h-4.5a.75.75 0 0 0-.75.75v4.5a.75.75 0 0 0 1.5 0v-2.69l3.22 3.22Z" /></svg>} info={{
      what: 'Converts text between common naming conventions: camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE, and more.',
      how: 'Tokenizes the input by detecting word boundaries (uppercase transitions, underscores, hyphens, spaces), then reassembles with the target convention\'s separator and casing.',
      usedFor: 'Renaming variables across languages, converting API field names, database column naming, and maintaining consistent code style.',
    }}>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="e.g. myVariableName, my-kebab-case, MY_CONSTANT"
        className="w-full px-3 py-2 text-xs font-mono rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]"
      />
      {results.length > 0 && (
        <div className="space-y-1.5">
          {results.map(({ key, label, value }) => (
            <CopyField key={key} label={label} value={value} />
          ))}
        </div>
      )}
    </ToolCard>
  );
}

export default CaseConverterCard;
