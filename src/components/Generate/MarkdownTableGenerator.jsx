import { useState, useMemo, useCallback } from 'react';
import ToolCard from '../common/ToolCard';
import CopyButton from '../common/CopyButton';
import { generateMarkdownTable } from '../../utils/markdownTable';

function MarkdownTableGenerator() {
  const [cols, setCols] = useState(3);
  const [rows, setRows] = useState(3);
  const [headers, setHeaders] = useState(() => Array(3).fill(''));
  const [cells, setCells] = useState(() => Array(3).fill(null).map(() => Array(3).fill('')));
  const [alignments, setAlignments] = useState(() => Array(3).fill('left'));
  const [copied, setCopied] = useState(false);

  const adjustGrid = useCallback((newCols, newRows) => {
    setCols(newCols);
    setRows(newRows);
    setHeaders(prev => {
      const h = [...prev];
      while (h.length < newCols) h.push('');
      return h.slice(0, newCols);
    });
    setCells(prev => {
      const c = prev.map(row => {
        const r = [...row];
        while (r.length < newCols) r.push('');
        return r.slice(0, newCols);
      });
      while (c.length < newRows) c.push(Array(newCols).fill(''));
      return c.slice(0, newRows);
    });
    setAlignments(prev => {
      const a = [...prev];
      while (a.length < newCols) a.push('left');
      return a.slice(0, newCols);
    });
  }, []);

  const updateHeader = (i, val) => {
    setHeaders(prev => { const h = [...prev]; h[i] = val; return h; });
  };

  const updateCell = (r, c, val) => {
    setCells(prev => {
      const next = prev.map(row => [...row]);
      next[r][c] = val;
      return next;
    });
  };

  const cycleAlign = (i) => {
    setAlignments(prev => {
      const a = [...prev];
      a[i] = a[i] === 'left' ? 'center' : a[i] === 'center' ? 'right' : 'left';
      return a;
    });
  };

  const output = useMemo(() => {
    const h = headers.map((h, i) => h || `Col ${i + 1}`);
    return generateMarkdownTable(h, cells, alignments);
  }, [headers, cells, alignments]);

  const handleCopy = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const ALIGN_ICONS = { left: '⫷', center: '⫶', right: '⫸' };

  return (
    <ToolCard title="Markdown Table" icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M2 3.5A1.5 1.5 0 0 1 3.5 2h9A1.5 1.5 0 0 1 14 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 12.5v-9ZM3.5 3a.5.5 0 0 0-.5.5V7h4V3H3.5ZM8.5 3v4H13V3.5a.5.5 0 0 0-.5-.5H8.5ZM13 8.5H8.5V13h3a.5.5 0 0 0 .5-.5V8.5ZM7 13V8.5H3v4a.5.5 0 0 0 .5.5H7Z" clipRule="evenodd" /></svg>} info={{
      what: 'Visual editor for creating Markdown-formatted tables. Set dimensions, fill in cells, and toggle column alignment.',
      how: 'Builds a pipe-delimited table with proper alignment separators (:--- for left, :---: for center, ---: for right).',
      usedFor: 'Writing documentation, README files, GitHub issues/PRs, and any Markdown content requiring tabular data.',
    }}>
      {/* Dimension controls */}
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
          Cols
          <input type="number" value={cols} onChange={(e) => adjustGrid(Math.max(1, Math.min(10, Number(e.target.value))), rows)} min={1} max={10} className="w-14 px-2 py-1 text-xs rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]" />
        </label>
        <label className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
          Rows
          <input type="number" value={rows} onChange={(e) => adjustGrid(cols, Math.max(1, Math.min(20, Number(e.target.value))))} min={1} max={20} className="w-14 px-2 py-1 text-xs rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]" />
        </label>
      </div>

      {/* Editable grid */}
      <div className="overflow-auto max-h-48">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              {headers.slice(0, cols).map((h, i) => (
                <th key={i} className="border border-[var(--border-color)] p-0">
                  <div className="flex">
                    <input
                      type="text"
                      value={h}
                      onChange={(e) => updateHeader(i, e.target.value)}
                      placeholder={`Col ${i + 1}`}
                      className="flex-1 w-full px-2 py-1.5 text-xs font-bold bg-[var(--bg-secondary)] text-[var(--text-primary)] outline-none border-none"
                    />
                    <button
                      type="button"
                      onClick={() => cycleAlign(i)}
                      className="px-1.5 bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--accent-color)] text-xs border-l border-[var(--border-color)]"
                      title={`Align: ${alignments[i]}`}
                    >
                      {ALIGN_ICONS[alignments[i]]}
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cells.slice(0, rows).map((row, r) => (
              <tr key={r}>
                {row.slice(0, cols).map((cell, c) => (
                  <td key={c} className="border border-[var(--border-color)] p-0">
                    <input
                      type="text"
                      value={cell}
                      onChange={(e) => updateCell(r, c, e.target.value)}
                      className="w-full px-2 py-1.5 text-xs bg-transparent text-[var(--text-primary)] outline-none"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Output */}
      <div className="relative">
        <div className="w-full max-h-32 px-3 py-2 text-xs font-mono rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] whitespace-pre overflow-auto pr-8 animate-fade-in">
          {output}
        </div>
        <div className="absolute top-2 right-2">
          <CopyButton onClick={handleCopy} tooltip={copied ? 'Copied!' : 'Copy'}>
            {copied ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-[var(--success-color)]"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0117 6.622V12.5a1.5 1.5 0 01-1.5 1.5h-1v-3.379a3 3 0 00-.879-2.121L10.5 5.379A3 3 0 008.379 4.5H7v-1z" /><path d="M4.5 6A1.5 1.5 0 003 7.5v9A1.5 1.5 0 004.5 18h7a1.5 1.5 0 001.5-1.5v-5.879a1.5 1.5 0 00-.44-1.06L9.44 6.439A1.5 1.5 0 008.378 6H4.5z" /></svg>
            )}
          </CopyButton>
        </div>
      </div>
    </ToolCard>
  );
}

export default MarkdownTableGenerator;
