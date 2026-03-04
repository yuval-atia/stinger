import { useState, useMemo } from 'react';
import ToolCard from '../common/ToolCard';
import CopyButton from '../common/CopyButton';
import { transformCase } from '../../utils/textTools';

const CaseIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
    <path d="M3.38 3.012a.75.75 0 0 1 .408.98L1.216 10.5h1.534a.75.75 0 0 1 0 1.5H.75a.75.75 0 0 1-.698-1.024l3-7.5a.75.75 0 0 1 .98-.408l-.053-.056ZM7.4 3.012a.75.75 0 0 1 .408.98L5.236 10.5H6.77a.75.75 0 0 1 0 1.5H4.77a.75.75 0 0 1-.698-1.024l3-7.5a.75.75 0 0 1 .98-.408l-.053-.056Z" />
    <path fillRule="evenodd" d="M12 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm-2.5 4a2.5 2.5 0 1 1 5 0 2.5 2.5 0 0 1-5 0Z" clipRule="evenodd" />
  </svg>
);

const CASE_MODES = [
  { value: 'upper', label: 'UPPER' },
  { value: 'lower', label: 'lower' },
  { value: 'title', label: 'Title Case' },
  { value: 'sentence', label: 'Sentence case' },
  { value: 'camel', label: 'camelCase' },
  { value: 'pascal', label: 'PascalCase' },
  { value: 'snake', label: 'snake_case' },
  { value: 'kebab', label: 'kebab-case' },
];

function CaseTransformCard({ toolSlug }) {
  const [text, setText] = useState('');
  const [mode, setMode] = useState('upper');
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => transformCase(text, mode), [text, mode]);

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <ToolCard title="Case Transform" toolSlug={toolSlug} icon={CaseIcon} info={{
      what: 'Transforms text between 8 case styles: UPPER, lower, Title, Sentence, camelCase, PascalCase, snake_case, and kebab-case.',
      how: 'Splits input into words by detecting camelCase boundaries, underscores, hyphens, and spaces, then reassembles in the target format.',
      usedFor: 'Converting variable names between coding conventions, formatting headings, and normalizing text for processing.',
    }}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste text to transform..."
        className="w-full h-28 px-3 py-2 text-xs font-mono rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)] resize-none"
      />
      <div className="flex flex-wrap gap-1.5">
        {CASE_MODES.map(m => (
          <button
            key={m.value}
            type="button"
            onClick={() => setMode(m.value)}
            className={`px-2 py-1 text-xs rounded border transition-colors ${
              mode === m.value
                ? 'bg-[var(--accent-color)] border-[var(--accent-color)] text-white'
                : 'bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--accent-color)]'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
      {text && (
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0 bg-[var(--bg-secondary)] rounded border border-[var(--border-color)] px-3 py-1.5 text-xs font-mono whitespace-pre-wrap break-all max-h-32 overflow-auto animate-fade-in">
            {result}
          </div>
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
    </ToolCard>
  );
}

export default CaseTransformCard;
