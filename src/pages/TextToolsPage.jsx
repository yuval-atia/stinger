import { useState, useMemo } from 'react';
import ToolCard, { CopyField } from '../components/common/ToolCard';
import CopyButton from '../components/common/CopyButton';
import { computeDiff } from '../utils/textDiff';
import {
  computeTextStats,
  findAndReplace,
  sortLines,
  deduplicateLines,
  reverseText,
  trimText,
  addLineNumbers,
  removeLineNumbers,
  transformCase,
} from '../utils/textTools';

// ── Icons ────────────────────────────────────────────────────────────────────

const DiffIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
    <path d="M2 3.5A1.5 1.5 0 0 1 3.5 2h9A1.5 1.5 0 0 1 14 3.5v.71a1 1 0 0 1-.293.707L10 8.621v1.129a1 1 0 0 1-.293.707l-2.5 2.5A1 1 0 0 1 6 12.25V8.621L2.293 4.917A1 1 0 0 1 2 4.21V3.5Z" />
  </svg>
);

const StatsIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
    <path d="M4 2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H4Zm.75 5a.75.75 0 0 0-.75.75v3.5a.75.75 0 0 0 1.5 0v-3.5A.75.75 0 0 0 4.75 7ZM8 4.75a.75.75 0 0 0-1.5 0v6.5a.75.75 0 0 0 1.5 0v-6.5ZM11.25 6a.75.75 0 0 0-.75.75v4.5a.75.75 0 0 0 1.5 0v-4.5a.75.75 0 0 0-.75-.75Z" />
  </svg>
);

const FindReplaceIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z" clipRule="evenodd" />
  </svg>
);

const SortIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M5 3.25a.75.75 0 0 1 .75.75v6.44l1.22-1.22a.75.75 0 1 1 1.06 1.06l-2.5 2.5a.75.75 0 0 1-1.06 0l-2.5-2.5a.75.75 0 0 1 1.06-1.06l1.22 1.22V4A.75.75 0 0 1 5 3.25Zm6-1a.75.75 0 0 1 .75.75v6.44l1.22-1.22a.75.75 0 1 1 1.06 1.06l-2.5 2.5a.75.75 0 0 1-1.06 0l-2.5-2.5a.75.75 0 0 1 1.06-1.06l1.22 1.22V3a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
  </svg>
);

const DeduplicateIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
    <path d="M5.5 3.5A1.5 1.5 0 0 1 7 2h2.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 1 .439 1.061V9.5A1.5 1.5 0 0 1 12 11V6.621a3 3 0 0 0-.879-2.121L9 2.379A3 3 0 0 0 6.879 1.5H7A1.5 1.5 0 0 0 5.5 3v.5Z" />
    <path d="M1.5 5.5A1.5 1.5 0 0 1 3 4h2.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 1 .439 1.061V12.5A1.5 1.5 0 0 1 8 14H3a1.5 1.5 0 0 1-1.5-1.5v-7Z" />
  </svg>
);

const ReverseIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M8 1.75a.75.75 0 0 1 .75.75v6.44l1.22-1.22a.75.75 0 1 1 1.06 1.06l-2.5 2.5a.75.75 0 0 1-1.06 0l-2.5-2.5a.75.75 0 1 1 1.06-1.06l1.22 1.22V2.5A.75.75 0 0 1 8 1.75Zm-4.5 9.5a.75.75 0 0 0 0 1.5h9a.75.75 0 0 0 0-1.5h-9Z" clipRule="evenodd" />
  </svg>
);

const TrimIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M3.5 2A1.5 1.5 0 0 0 2 3.5v9A1.5 1.5 0 0 0 3.5 14h9a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 12.5 2h-9ZM5 5.75A.75.75 0 0 1 5.75 5h4.5a.75.75 0 0 1 0 1.5h-4.5A.75.75 0 0 1 5 5.75ZM5.75 8a.75.75 0 0 0 0 1.5h4.5a.75.75 0 0 0 0-1.5h-4.5Z" clipRule="evenodd" />
  </svg>
);

// ── Text Diff Card ───────────────────────────────────────────────────────────

function TextDiffCard() {
  const [textA, setTextA] = useState('');
  const [textB, setTextB] = useState('');

  const { diff, stats } = useMemo(() => {
    if (!textA && !textB) return { diff: [], stats: { added: 0, removed: 0, unchanged: 0 } };
    return computeDiff(textA, textB);
  }, [textA, textB]);

  return (
    <ToolCard title="Text Diff" icon={DiffIcon} info={{
      what: 'Compares two blocks of text line-by-line and highlights additions, removals, and unchanged lines with color-coded output.',
      how: 'Uses the Longest Common Subsequence (LCS) algorithm to compute an optimal line diff, then backtracks to classify each line as added, removed, or equal.',
      usedFor: 'Reviewing text changes before committing, comparing configuration files, proofreading document revisions, and debugging template output.',
    }}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-[var(--text-secondary)] mb-1 block">Original</label>
          <textarea
            value={textA}
            onChange={(e) => setTextA(e.target.value)}
            placeholder="Paste original text..."
            className="w-full h-40 px-3 py-2 text-xs font-mono rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)] resize-none"
          />
        </div>
        <div>
          <label className="text-xs text-[var(--text-secondary)] mb-1 block">Modified</label>
          <textarea
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

// ── Text Statistics Card ─────────────────────────────────────────────────────

function TextStatsCard() {
  const [text, setText] = useState('');

  const stats = useMemo(() => computeTextStats(text), [text]);

  return (
    <ToolCard title="Text Statistics" icon={StatsIcon} info={{
      what: 'Counts words, characters, lines, sentences, paragraphs, and estimates reading time.',
      how: 'Splits text by whitespace for word count, regex for sentences, and double newlines for paragraphs. Reading time is based on 200 words per minute.',
      usedFor: 'Checking document length, meeting word limits, estimating reading time for articles and essays.',
    }}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste or type text..."
        className="w-full h-28 px-3 py-2 text-xs font-mono rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)] resize-none"
      />
      <div className="grid grid-cols-2 gap-1.5">
        <CopyField label="Words" value={String(stats.words)} />
        <CopyField label="Characters" value={String(stats.characters)} />
        <CopyField label="No spaces" value={String(stats.charactersNoSpaces)} />
        <CopyField label="Lines" value={String(stats.lines)} />
        <CopyField label="Sentences" value={String(stats.sentences)} />
        <CopyField label="Paragraphs" value={String(stats.paragraphs)} />
        <CopyField label="Reading time" value={stats.readingTime} />
      </div>
    </ToolCard>
  );
}

// ── Find & Replace Card ──────────────────────────────────────────────────────

function FindReplaceCard() {
  const [text, setText] = useState('');
  const [find, setFind] = useState('');
  const [replace, setReplace] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(true);
  const [copied, setCopied] = useState(false);

  const { result, count } = useMemo(
    () => findAndReplace(text, find, replace, caseSensitive),
    [text, find, replace, caseSensitive]
  );

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <ToolCard title="Find & Replace" icon={FindReplaceIcon} info={{
      what: 'Finds all occurrences of a pattern in text and replaces them with a specified string.',
      how: 'Escapes the search string for safe regex use and applies a global replacement with optional case-insensitive matching.',
      usedFor: 'Bulk text edits, fixing repeated typos, renaming terms across a document, and data cleanup.',
    }}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste text..."
        className="w-full h-24 px-3 py-2 text-xs font-mono rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)] resize-none"
      />
      <div className="flex gap-2">
        <input
          type="text"
          value={find}
          onChange={(e) => setFind(e.target.value)}
          placeholder="Find..."
          className="flex-1 px-3 py-1.5 text-xs font-mono rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]"
        />
        <input
          type="text"
          value={replace}
          onChange={(e) => setReplace(e.target.value)}
          placeholder="Replace with..."
          className="flex-1 px-3 py-1.5 text-xs font-mono rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]"
        />
      </div>
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] cursor-pointer">
          <input
            type="checkbox"
            checked={caseSensitive}
            onChange={(e) => setCaseSensitive(e.target.checked)}
            className="accent-[var(--accent-color)]"
          />
          Case sensitive
        </label>
        {find && <span className="text-xs text-[var(--text-secondary)]">{count} replacement{count !== 1 ? 's' : ''}</span>}
      </div>
      {find && text && (
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0 bg-[var(--bg-secondary)] rounded border border-[var(--border-color)] px-3 py-1.5 text-xs font-mono whitespace-pre-wrap break-all max-h-32 overflow-auto">
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

// ── Sort Lines Card ──────────────────────────────────────────────────────────

function SortLinesCard() {
  const [text, setText] = useState('');
  const [ascending, setAscending] = useState(true);
  const [caseSensitive, setCaseSensitive] = useState(true);
  const [removeDuplicates, setRemoveDuplicates] = useState(false);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => sortLines(text, { ascending, caseSensitive, removeDuplicates }),
    [text, ascending, caseSensitive, removeDuplicates]
  );

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <ToolCard title="Sort Lines" icon={SortIcon} info={{
      what: 'Sorts all lines of text alphabetically in ascending or descending order, with options for case sensitivity and duplicate removal.',
      how: 'Splits text by newline, optionally deduplicates, then sorts using locale-aware string comparison.',
      usedFor: 'Sorting lists, organizing imports, cleaning up log output, and alphabetizing entries.',
    }}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste lines to sort..."
        className="w-full h-28 px-3 py-2 text-xs font-mono rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)] resize-none"
      />
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] cursor-pointer">
          <input type="checkbox" checked={ascending} onChange={(e) => setAscending(e.target.checked)} className="accent-[var(--accent-color)]" />
          Ascending
        </label>
        <label className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] cursor-pointer">
          <input type="checkbox" checked={caseSensitive} onChange={(e) => setCaseSensitive(e.target.checked)} className="accent-[var(--accent-color)]" />
          Case sensitive
        </label>
        <label className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] cursor-pointer">
          <input type="checkbox" checked={removeDuplicates} onChange={(e) => setRemoveDuplicates(e.target.checked)} className="accent-[var(--accent-color)]" />
          Remove duplicates
        </label>
      </div>
      {text && (
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0 bg-[var(--bg-secondary)] rounded border border-[var(--border-color)] px-3 py-1.5 text-xs font-mono whitespace-pre-wrap break-all max-h-32 overflow-auto">
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

// ── Deduplicate Lines Card ───────────────────────────────────────────────────

function DeduplicateLinesCard() {
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);

  const { result, removedCount } = useMemo(() => deduplicateLines(text), [text]);

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <ToolCard title="Deduplicate Lines" icon={DeduplicateIcon} info={{
      what: 'Removes duplicate lines from text, keeping only the first occurrence of each unique line.',
      how: 'Iterates through lines and uses a Set to track seen values, filtering out any line that has already appeared.',
      usedFor: 'Cleaning up lists, removing duplicate log entries, deduplicating CSV rows, and simplifying datasets.',
    }}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste lines with duplicates..."
        className="w-full h-28 px-3 py-2 text-xs font-mono rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)] resize-none"
      />
      {text && (
        <>
          <span className="text-xs text-[var(--text-secondary)]">{removedCount} duplicate{removedCount !== 1 ? 's' : ''} removed</span>
          <div className="flex items-start gap-2">
            <div className="flex-1 min-w-0 bg-[var(--bg-secondary)] rounded border border-[var(--border-color)] px-3 py-1.5 text-xs font-mono whitespace-pre-wrap break-all max-h-32 overflow-auto">
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
        </>
      )}
    </ToolCard>
  );
}

// ── Reverse Text Card ────────────────────────────────────────────────────────

function ReverseTextCard() {
  const [text, setText] = useState('');
  const [mode, setMode] = useState('characters');
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => reverseText(text, mode), [text, mode]);

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <ToolCard title="Reverse Text" icon={ReverseIcon} info={{
      what: 'Reverses text by characters, words, or lines.',
      how: 'Splits the input by the selected unit (character, word boundary, or newline), reverses the array, and joins it back.',
      usedFor: 'Creating mirrored strings, reversing log order, solving coding puzzles, and text manipulation tasks.',
    }}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste text to reverse..."
        className="w-full h-28 px-3 py-2 text-xs font-mono rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)] resize-none"
      />
      <div className="flex items-center gap-3">
        {['characters', 'words', 'lines'].map((m) => (
          <label key={m} className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] cursor-pointer">
            <input
              type="radio"
              name="reverseMode"
              checked={mode === m}
              onChange={() => setMode(m)}
              className="accent-[var(--accent-color)]"
            />
            {m.charAt(0).toUpperCase() + m.slice(1)}
          </label>
        ))}
      </div>
      {text && (
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0 bg-[var(--bg-secondary)] rounded border border-[var(--border-color)] px-3 py-1.5 text-xs font-mono whitespace-pre-wrap break-all max-h-32 overflow-auto">
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

// ── Text Trimmer Card ────────────────────────────────────────────────────────

function TextTrimmerCard() {
  const [text, setText] = useState('');
  const [trimLines, setTrimLines] = useState(true);
  const [collapseSpaces, setCollapseSpaces] = useState(true);
  const [trimEdges, setTrimEdges] = useState(true);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => trimText(text, { trimLines, collapseSpaces, trimEdges }),
    [text, trimLines, collapseSpaces, trimEdges]
  );

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <ToolCard title="Text Trimmer" icon={TrimIcon} info={{
      what: 'Cleans up whitespace by trimming lines, collapsing multiple spaces, and removing leading/trailing whitespace.',
      how: 'Applies selected transformations in sequence: per-line trim, multi-space collapse, and overall edge trim.',
      usedFor: 'Cleaning up pasted text, normalizing whitespace in data files, preparing text for processing.',
    }}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste text to trim..."
        className="w-full h-28 px-3 py-2 text-xs font-mono rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)] resize-none"
      />
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] cursor-pointer">
          <input type="checkbox" checked={trimLines} onChange={(e) => setTrimLines(e.target.checked)} className="accent-[var(--accent-color)]" />
          Trim each line
        </label>
        <label className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] cursor-pointer">
          <input type="checkbox" checked={collapseSpaces} onChange={(e) => setCollapseSpaces(e.target.checked)} className="accent-[var(--accent-color)]" />
          Collapse spaces
        </label>
        <label className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] cursor-pointer">
          <input type="checkbox" checked={trimEdges} onChange={(e) => setTrimEdges(e.target.checked)} className="accent-[var(--accent-color)]" />
          Trim edges
        </label>
      </div>
      {text && (
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0 bg-[var(--bg-secondary)] rounded border border-[var(--border-color)] px-3 py-1.5 text-xs font-mono whitespace-pre-wrap break-all max-h-32 overflow-auto">
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

// ── Line Number Card ──────────────────────────────────────────────────────────

const LineNumberIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M2 3.75A.75.75 0 0 1 2.75 3h10.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 3.75Zm0 4A.75.75 0 0 1 2.75 7h10.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 7.75Zm0 4a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
  </svg>
);

function LineNumberCard() {
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
    <ToolCard title="Line Numbers" icon={LineNumberIcon} info={{
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

// ── Case Transform Card ──────────────────────────────────────────────────────

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

function CaseTransformCard() {
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
    <ToolCard title="Case Transform" icon={CaseIcon} info={{
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

// ── Page ─────────────────────────────────────────────────────────────────────

function TextToolsPage() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-4">
        <div className="lg:col-span-2">
          <TextDiffCard />
        </div>
        <TextStatsCard />
        <CaseTransformCard />
        <FindReplaceCard />
        <SortLinesCard />
        <LineNumberCard />
        <DeduplicateLinesCard />
        <ReverseTextCard />
        <TextTrimmerCard />
      </div>
    </div>
  );
}

export default TextToolsPage;
