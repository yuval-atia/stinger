import { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { multiCompare, MISSING, formatValue, getTypeLabel, getDiffStats } from '../../utils/jsonMultiCompare';
import { useToast } from '../common/Toast';

function DiffTable({ jsonObjects, labels }) {
  const { showToast } = useToast();
  const [filter, setFilter] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [focusedRow, setFocusedRow] = useState(-1);
  const tableRef = useRef(null);

  const rows = useMemo(() => {
    const parsed = jsonObjects.map((obj) => (obj !== null && obj !== undefined ? obj : null));
    const validCount = parsed.filter((o) => o !== null).length;
    if (validCount < 2) return [];
    return multiCompare(
      parsed.map((o) => (o !== null ? o : undefined)),
      { showAll }
    );
  }, [jsonObjects, showAll]);

  const stats = useMemo(() => getDiffStats(rows), [rows]);

  const filtered = useMemo(() => {
    if (!filter.trim()) return rows;
    const q = filter.toLowerCase();
    return rows.filter((d) => {
      if (d.pathStr.toLowerCase().includes(q)) return true;
      return d.values.some((v) => {
        if (v === MISSING) return false;
        const f = formatValue(v);
        return f && f.toLowerCase().includes(q);
      });
    });
  }, [rows, filter]);

  const toggleExpand = useCallback((pathStr) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      next.has(pathStr) ? next.delete(pathStr) : next.add(pathStr);
      return next;
    });
  }, []);

  const copyValue = useCallback((value) => {
    if (value === MISSING) return;
    const text = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard');
  }, [showToast]);

  const copyAllDiffs = useCallback(() => {
    const diffRows = filtered.filter((r) => !r.same);
    const obj = {};
    for (const row of diffRows) {
      obj[row.pathStr] = {};
      row.values.forEach((v, i) => {
        if (i < jsonObjects.length) {
          obj[row.pathStr][labels[i]] = v === MISSING ? '(missing)' : v;
        }
      });
    }
    navigator.clipboard.writeText(JSON.stringify(obj, null, 2));
    showToast('Copied all differences');
  }, [filtered, jsonObjects, labels, showToast]);

  // Keyboard navigation
  useEffect(() => {
    const el = tableRef.current;
    if (!el) return;
    const handler = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedRow((prev) => Math.min(prev + 1, filtered.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedRow((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && focusedRow >= 0) {
        toggleExpand(filtered[focusedRow]?.pathStr);
      }
    };
    el.addEventListener('keydown', handler);
    return () => el.removeEventListener('keydown', handler);
  }, [filtered, focusedRow, toggleExpand]);

  // Scroll focused row into view
  useEffect(() => {
    if (focusedRow < 0) return;
    const row = tableRef.current?.querySelector(`[data-row="${focusedRow}"]`);
    row?.scrollIntoView({ block: 'nearest' });
  }, [focusedRow]);

  const n = jsonObjects.length;
  const validCount = jsonObjects.filter((o) => o !== null).length;

  if (validCount < 2) {
    return (
      <div className="text-[var(--text-secondary)] text-sm text-center py-8">
        Enter at least 2 valid JSON inputs to compare
      </div>
    );
  }

  if (stats.total === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 mx-auto mb-3 text-[var(--success-color)]">
            <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
          </svg>
          <div className="text-lg font-medium text-[var(--success-color)]">Identical</div>
          <div className="text-sm text-[var(--text-secondary)] mt-1">All JSON inputs are the same</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Stats bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-3">
          {stats.changed > 0 && (
            <span className="flex items-center gap-1.5 text-xs">
              <span className="w-2.5 h-2.5 rounded-sm bg-[var(--diff-change)]" />
              <span className="text-[var(--text-secondary)]">{stats.changed} changed</span>
            </span>
          )}
          {stats.added > 0 && (
            <span className="flex items-center gap-1.5 text-xs">
              <span className="w-2.5 h-2.5 rounded-sm bg-[var(--diff-add)]" />
              <span className="text-[var(--text-secondary)]">{stats.added} added</span>
            </span>
          )}
          {stats.removed > 0 && (
            <span className="flex items-center gap-1.5 text-xs">
              <span className="w-2.5 h-2.5 rounded-sm bg-[var(--diff-remove)]" />
              <span className="text-[var(--text-secondary)]">{stats.removed} removed</span>
            </span>
          )}
          {stats.missing > 0 && (
            <span className="flex items-center gap-1.5 text-xs">
              <span className="w-2.5 h-2.5 rounded-sm bg-[var(--bg-secondary)] border border-[var(--border-color)]" />
              <span className="text-[var(--text-secondary)]">{stats.missing} partial</span>
            </span>
          )}
          {stats.typeChanged > 0 && (
            <span className="flex items-center gap-1.5 text-xs">
              <span className="w-2.5 h-2.5 rounded-sm bg-[var(--diff-move)]" />
              <span className="text-[var(--text-secondary)]">{stats.typeChanged} type changed</span>
            </span>
          )}
        </div>

        <div className="flex-1" />

        {/* Show all toggle */}
        <button
          onClick={() => setShowAll((p) => !p)}
          className={`px-2 py-1 text-xs rounded transition-colors ${
            showAll
              ? 'bg-[var(--accent-color)] text-white'
              : 'bg-[var(--bg-secondary)] hover:bg-[var(--border-color)] text-[var(--text-secondary)]'
          }`}
          title={showAll ? 'Showing all paths (click to show only differences)' : 'Showing only differences (click to show all paths)'}
        >
          {showAll ? 'All paths' : 'Diffs only'}
        </button>

        {/* Filter */}
        <div className="relative">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]">
            <path fillRule="evenodd" d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z" clipRule="evenodd" />
          </svg>
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter..."
            className="w-48 pl-8 pr-3 py-1.5 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-color)] placeholder:text-[var(--text-secondary)]"
          />
          {filter && (
            <button
              onClick={() => setFilter('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
                <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
              </svg>
            </button>
          )}
        </div>

        {/* Copy all diffs */}
        <button
          onClick={copyAllDiffs}
          className="px-2 py-1 text-xs rounded bg-[var(--bg-secondary)] hover:bg-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-1"
          title="Copy all differences as JSON"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
            <path d="M5.5 3.5A1.5 1.5 0 0 1 7 2h2.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 1 .439 1.061V9.5A1.5 1.5 0 0 1 12 11V8.621a3 3 0 0 0-.879-2.121L9 4.379A3 3 0 0 0 6.879 3.5H5.5Z" />
            <path d="M4 5a1.5 1.5 0 0 0-1.5 1.5v6A1.5 1.5 0 0 0 4 14h5a1.5 1.5 0 0 0 1.5-1.5V8.621a1.5 1.5 0 0 0-.44-1.06L7.94 5.439A1.5 1.5 0 0 0 6.878 5H4Z" />
          </svg>
          Copy
        </button>
      </div>

      {/* Result count */}
      <div className="text-xs text-[var(--text-secondary)]">
        {filter ? `${filtered.filter(r => !r.same).length} of ${stats.total} differences` : `${stats.total} difference${stats.total !== 1 ? 's' : ''}`}
        {showAll && ` | ${filtered.filter(r => r.same).length} matching paths`}
      </div>

      {/* Table */}
      <div
        ref={tableRef}
        tabIndex={0}
        className="overflow-x-auto rounded-lg border border-[var(--border-color)] focus:outline-none"
      >
        <table className="w-full text-sm border-collapse">
          <thead className="sticky top-0 z-20">
            <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
              <th className="text-left px-3 py-2.5 font-medium text-[var(--text-secondary)] whitespace-nowrap sticky left-0 bg-[var(--bg-secondary)] z-30 text-xs uppercase tracking-wider">
                Path
              </th>
              {labels.slice(0, n).map((label, i) => (
                <th key={i} className="text-left px-3 py-2.5 font-medium text-[var(--text-secondary)] whitespace-nowrap min-w-[160px] text-xs uppercase tracking-wider">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, rowIdx) => (
              <DiffRow
                key={row.pathStr}
                row={row}
                rowIdx={rowIdx}
                n={n}
                expanded={expandedRows.has(row.pathStr)}
                focused={focusedRow === rowIdx}
                onToggle={() => toggleExpand(row.pathStr)}
                onCopy={copyValue}
                onFocus={() => setFocusedRow(rowIdx)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && filter && (
        <div className="text-[var(--text-secondary)] text-sm text-center py-4">
          No results match your filter
        </div>
      )}
    </div>
  );
}

function DiffRow({ row, rowIdx, n, expanded, focused, onToggle, onCopy, onFocus }) {
  const { pathStr, values, same, diffType } = row;
  const formatted = values.map((v) => formatValue(v));

  // Find majority value for highlighting
  const valueCounts = new Map();
  for (let i = 0; i < n; i++) {
    const f = values[i] === MISSING ? '__MISSING__' : formatted[i];
    valueCounts.set(f, (valueCounts.get(f) || 0) + 1);
  }
  let majorityVal = null;
  let majorityCount = 0;
  for (const [val, count] of valueCounts) {
    if (count > majorityCount) { majorityCount = count; majorityVal = val; }
  }

  const isLong = formatted.some((f) => f && f.length > 80);

  // Path indentation: count depth for visual hierarchy
  const depth = row.path.length - 1;
  const lastKey = row.path[row.path.length - 1] || pathStr;
  const parentPath = row.path.length > 1 ? row.path.slice(0, -1) : null;

  return (
    <tr
      data-row={rowIdx}
      onClick={onFocus}
      className={`border-b border-[var(--border-color)] transition-colors cursor-default ${
        same ? 'opacity-40' : ''
      } ${focused ? 'ring-1 ring-inset ring-[var(--accent-color)]' : 'hover:bg-[var(--bg-secondary)]/40'}`}
      style={!same && diffType === 'added' ? { borderLeft: '3px solid var(--diff-add)' } : !same && diffType === 'removed' ? { borderLeft: '3px solid var(--diff-remove)' } : !same && diffType === 'missing' ? { borderLeft: '3px solid var(--diff-move)' } : {}}
    >
      {/* Path cell */}
      <td className="px-3 py-2 font-mono text-xs whitespace-nowrap sticky left-0 bg-[var(--bg-primary)] z-10 border-r border-[var(--border-color)]">
        <div className="flex items-center gap-1" style={{ paddingLeft: `${Math.min(depth, 4) * 12}px` }}>
          {parentPath && (
            <span className="text-[var(--text-secondary)] opacity-50">
              {/^\d+$/.test(lastKey) ? '' : '.'}
            </span>
          )}
          <span className={same ? 'text-[var(--text-secondary)]' : 'text-[var(--accent-color)] font-medium'}>
            {/^\d+$/.test(lastKey) ? `[${lastKey}]` : lastKey}
          </span>
          {!same && diffType === 'type_changed' && (
            <span className="ml-1 px-1 py-0 text-[10px] rounded bg-[var(--diff-move)] text-[var(--diff-move-text)]">type</span>
          )}
        </div>
        {parentPath && depth > 0 && (
          <div className="text-[10px] text-[var(--text-secondary)] opacity-50 truncate max-w-[200px]" style={{ paddingLeft: `${Math.min(depth, 4) * 12}px` }}>
            {parentPath.join('.')}
          </div>
        )}
      </td>

      {/* Value cells */}
      {values.slice(0, n).map((value, i) => {
        const f = formatted[i];
        const isMissing = value === MISSING;
        const fKey = isMissing ? '__MISSING__' : f;
        // For 3+ inputs: highlight outlier (minority) values
        // For 2 inputs: don't highlight cells (the row itself signals difference)
        const isOutlier = !same && n >= 3 && (fKey !== majorityVal);
        // For "not present" in multi-input: subtle indicator
        const isAdded = !same && isMissing;

        // Cell background style
        let cellStyle = {};
        if (isMissing && !same) {
          cellStyle = { backgroundColor: 'var(--bg-secondary)', opacity: 0.4 };
        } else if (isOutlier && !isMissing) {
          cellStyle = { backgroundColor: 'var(--diff-change)' };
        }

        return (
          <td
            key={i}
            onClick={(e) => { if (!isMissing) { e.stopPropagation(); onCopy(value); } }}
            className={`px-3 py-2 font-mono text-xs ${!isMissing ? 'cursor-pointer hover:brightness-95 dark:hover:brightness-110' : ''}`}
            style={cellStyle}
            title={isMissing ? 'Not present in this input' : 'Click to copy value'}
          >
            {isMissing ? (
              <span className="text-[var(--text-secondary)] italic text-[10px] select-none">not present</span>
            ) : isLong && f.length > 80 && !expanded ? (
              <span
                className="hover:text-[var(--accent-color)] transition-colors"
                onClick={(e) => { e.stopPropagation(); onToggle(); }}
                title="Click to expand full value"
              >
                {f.slice(0, 80)}
                <span className="text-[var(--text-secondary)]">... ({f.length} chars)</span>
              </span>
            ) : (
              <span className={isLong && expanded ? 'break-all whitespace-pre-wrap' : ''}>
                <ValueDisplay value={value} formatted={f} />
                {!same && n === 2 && (
                  <TypeBadge value={value} values={values} i={i} n={n} />
                )}
              </span>
            )}
          </td>
        );
      })}
    </tr>
  );
}

/** Show a small type indicator when types differ between inputs */
function TypeBadge({ value, values, i, n }) {
  const otherIdx = i === 0 ? 1 : 0;
  if (otherIdx >= n) return null;
  const other = values[otherIdx];
  if (other === MISSING || value === MISSING) return null;
  const t1 = getTypeLabel(value);
  const t2 = getTypeLabel(other);
  if (t1 === t2) return null;
  return (
    <span className="ml-1.5 text-[10px] px-1 py-0 rounded bg-[var(--diff-move)] text-[var(--diff-move-text)] align-middle">
      {t1}
    </span>
  );
}

function ValueDisplay({ value, formatted }) {
  if (value === null) return <span className="text-[var(--json-null)]">null</span>;
  if (typeof value === 'boolean') return <span className="text-[var(--json-boolean)]">{formatted}</span>;
  if (typeof value === 'number') return <span className="text-[var(--json-number)]">{formatted}</span>;
  if (typeof value === 'string') return <span className="text-[var(--json-string)]">{formatted}</span>;
  return <span className="text-[var(--text-secondary)]">{formatted}</span>;
}

export default DiffTable;
