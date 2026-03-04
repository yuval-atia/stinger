import { useState, useMemo } from 'react';
import ToolCard from '../common/ToolCard';
import CopyButton from '../common/CopyButton';
import { addLineNumbers, removeLineNumbers } from '../../utils/textTools';

const LineNumberIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M2 3.75A.75.75 0 0 1 2.75 3h10.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 3.75Zm0 4A.75.75 0 0 1 2.75 7h10.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 7.75Zm0 4a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
  </svg>
);

function LineNumberCard({ toolSlug }) {
  const [text, setText] = useState('');
  const [mode, setMode] = useState('add');
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    if (!text) return '';
    return mode === 'add' ? addLineNumbers(text) : removeLineNumbers(text);
  }, [text, mode]);

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <ToolCard title="Line Numbers" toolSlug={toolSlug} icon={LineNumberIcon} info={{
      what: 'Adds or removes line numbers from text. Add mode prepends padded numbers; Remove mode strips leading number prefixes.',
      how: 'Add splits by newline and prepends zero-padded indices. Remove uses a regex to strip leading digits followed by common separators.',
      usedFor: 'Preparing code snippets for documentation, cleaning up numbered lists, and formatting log output.',
    }}>
      <div className="flex items-center gap-3">
        {['add', 'remove'].map(m => (
          <label key={m} className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] cursor-pointer">
            <input type="radio" name="lineNumMode" checked={mode === m} onChange={() => setMode(m)} className="accent-[var(--accent-color)]" />
            {m === 'add' ? 'Add' : 'Remove'}
          </label>
        ))}
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={mode === 'add' ? 'Paste text to number...' : 'Paste numbered text...'}
        className="w-full h-28 px-3 py-2 text-xs font-mono rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)] resize-none"
      />
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

export default LineNumberCard;
