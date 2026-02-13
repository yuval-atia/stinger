import { useState, useMemo } from 'react';
import ToolCard from '../common/ToolCard';

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function RegexTesterCard() {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState({ g: true, i: false, m: false, s: false });
  const [testStr, setTestStr] = useState('');

  const toggleFlag = (flag) => setFlags((prev) => ({ ...prev, [flag]: !prev[flag] }));

  const result = useMemo(() => {
    if (!pattern || !testStr) return null;
    try {
      const flagStr = Object.entries(flags).filter(([, v]) => v).map(([k]) => k).join('');
      const regex = new RegExp(pattern, flagStr);
      const matches = [];
      let match;

      if (flags.g) {
        while ((match = regex.exec(testStr)) !== null) {
          matches.push({ index: match.index, value: match[0], groups: match.slice(1) });
          if (match[0].length === 0) regex.lastIndex++;
        }
      } else {
        match = regex.exec(testStr);
        if (match) {
          matches.push({ index: match.index, value: match[0], groups: match.slice(1) });
        }
      }

      // Build highlighted HTML
      let highlighted = '';
      let lastIdx = 0;
      for (const m of matches) {
        const before = testStr.slice(lastIdx, m.index);
        highlighted += escapeHtml(before);
        highlighted += `<span class="regex-match">${escapeHtml(m.value)}</span>`;
        lastIdx = m.index + m.value.length;
      }
      highlighted += escapeHtml(testStr.slice(lastIdx));

      return { matches, highlighted, error: null };
    } catch (e) {
      return { matches: [], highlighted: '', error: e.message };
    }
  }, [pattern, flags, testStr]);

  return (
    <ToolCard title="Regex Tester" icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z" clipRule="evenodd" /></svg>} info={{
      what: 'Tests regular expressions against input text with live match highlighting, match counts, and capture group extraction.',
      how: 'Creates a native JS RegExp with your pattern and flags, then runs exec() in a loop to find all matches. Results are highlighted inline with HTML spans.',
      usedFor: 'Developing and debugging regex patterns, validating input formats, extracting structured data from text, and learning regex syntax.',
    }}>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={pattern}
          onChange={(e) => setPattern(e.target.value)}
          placeholder="Pattern (e.g. \d+)"
          className="flex-1 px-3 py-2 text-xs font-mono rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]"
        />
        <div className="flex gap-1">
          {['g', 'i', 'm', 's'].map((f) => (
            <button
              key={f}
              onClick={() => toggleFlag(f)}
              className={`w-6 h-6 text-xs font-mono rounded transition-colors ${
                flags[f]
                  ? 'bg-[var(--accent-color)] text-white'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-color)]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      <textarea
        value={testStr}
        onChange={(e) => setTestStr(e.target.value)}
        placeholder="Test string..."
        className="w-full h-20 px-3 py-2 text-xs font-mono rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)] resize-none"
      />
      {result && result.error && (
        <div className="text-xs text-[var(--error-color)]">{result.error}</div>
      )}
      {result && !result.error && result.highlighted && (
        <>
          <div className="bg-[var(--bg-secondary)] rounded border border-[var(--border-color)] px-3 py-2">
            <div className="text-xs font-medium text-[var(--text-primary)] mb-1">
              Matches ({result.matches.length})
            </div>
            <div
              className="text-xs font-mono whitespace-pre-wrap break-all"
              dangerouslySetInnerHTML={{ __html: result.highlighted }}
            />
          </div>
          {result.matches.some((m) => m.groups.length > 0) && (
            <div className="bg-[var(--bg-secondary)] rounded border border-[var(--border-color)] px-3 py-2">
              <div className="text-xs font-medium text-[var(--text-primary)] mb-1">Capture Groups</div>
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="text-[var(--text-secondary)]">
                    <th className="text-left pr-3">#</th>
                    <th className="text-left pr-3">Match</th>
                    <th className="text-left">Groups</th>
                  </tr>
                </thead>
                <tbody>
                  {result.matches.filter((m) => m.groups.length > 0).map((m, i) => (
                    <tr key={i}>
                      <td className="pr-3 text-[var(--text-secondary)]">{i + 1}</td>
                      <td className="pr-3">{m.value}</td>
                      <td>{m.groups.join(', ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </ToolCard>
  );
}

export default RegexTesterCard;
