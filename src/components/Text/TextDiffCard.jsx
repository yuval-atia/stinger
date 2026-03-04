import { useState, useMemo } from 'react';
import ToolCard from '../common/ToolCard';
import { computeDiff } from '../../utils/textDiff';

const DiffIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
    <path d="M2 3.5A1.5 1.5 0 0 1 3.5 2h9A1.5 1.5 0 0 1 14 3.5v.71a1 1 0 0 1-.293.707L10 8.621v1.129a1 1 0 0 1-.293.707l-2.5 2.5A1 1 0 0 1 6 12.25V8.621L2.293 4.917A1 1 0 0 1 2 4.21V3.5Z" />
  </svg>
);

function TextDiffCard({ toolSlug }) {
  const [textA, setTextA] = useState('');
  const [textB, setTextB] = useState('');

  const { diff, stats } = useMemo(() => {
    if (!textA && !textB) return { diff: [], stats: { added: 0, removed: 0, unchanged: 0 } };
    return computeDiff(textA, textB);
  }, [textA, textB]);

  return (
    <ToolCard title="Text Diff" toolSlug={toolSlug} icon={DiffIcon} info={{
      what: 'Compares two blocks of text line-by-line and highlights additions, removals, and unchanged lines with color-coded output.',
      how: 'Uses the Longest Common Subsequence (LCS) algorithm to compute an optimal line diff, then backtracks to classify each line as added, removed, or equal.',
      usedFor: 'Reviewing text changes before committing, comparing configuration files, proofreading document revisions, and debugging template output.',
    }}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label htmlFor="diff-original" className="text-xs text-[var(--text-secondary)] mb-1 block">Original</label>
          <textarea
            id="diff-original"
            value={textA}
            onChange={(e) => setTextA(e.target.value)}
            placeholder="Paste original text..."
            className="w-full h-40 px-3 py-2 text-xs font-mono rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)] resize-none"
          />
        </div>
        <div>
          <label htmlFor="diff-modified" className="text-xs text-[var(--text-secondary)] mb-1 block">Modified</label>
          <textarea
            id="diff-modified"
            value={textB}
            onChange={(e) => setTextB(e.target.value)}
            placeholder="Paste modified text..."
            className="w-full h-40 px-3 py-2 text-xs font-mono rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)] resize-none"
          />
        </div>
      </div>

      {(textA || textB) && (
        <div className="flex items-center gap-4 text-xs">
          <span className="text-[var(--success-color)]">+{stats.added} added</span>
          <span className="text-[var(--error-color)]">-{stats.removed} removed</span>
          <span className="text-[var(--text-secondary)]">{stats.unchanged} unchanged</span>
        </div>
      )}

      {diff.length > 0 && (
        <div className="rounded border border-[var(--border-color)] overflow-auto max-h-[500px]">
          {diff.map((entry, i) => {
            let bgClass = '';
            let prefix = ' ';
            if (entry.type === 'add') {
              bgClass = 'bg-[var(--diff-add)]';
              prefix = '+';
            } else if (entry.type === 'remove') {
              bgClass = 'bg-[var(--diff-remove)]';
              prefix = '-';
            }
            return (
              <div key={i} className={`flex text-xs font-mono ${bgClass}`}>
                <span className="w-10 flex-shrink-0 text-right pr-2 text-[var(--text-secondary)] select-none border-r border-[var(--border-color)] py-0.5">
                  {entry.lineA || ''}
                </span>
                <span className="w-10 flex-shrink-0 text-right pr-2 text-[var(--text-secondary)] select-none border-r border-[var(--border-color)] py-0.5">
                  {entry.lineB || ''}
                </span>
                <span className="w-5 flex-shrink-0 text-center text-[var(--text-secondary)] select-none py-0.5">
                  {prefix}
                </span>
                <span className="flex-1 py-0.5 whitespace-pre-wrap break-all">
                  {entry.value}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </ToolCard>
  );
}

export default TextDiffCard;
