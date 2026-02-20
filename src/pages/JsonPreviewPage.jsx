import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import JsonInput from '../components/Editor/JsonInput';
import TreeView from '../components/TreeView/TreeView';
import SearchBar from '../components/Search/SearchBar';
import FormatButton from '../components/common/FormatButton';
import ShareButton from '../components/common/ShareButton';
import { InfoButton } from '../components/common/InfoTooltip';
import ScrollToTop from '../components/common/ScrollToTop';
import { useJsonParser } from '../hooks/useJsonParser';
import { parseJson, formatJson, getValueType } from '../utils/jsonParser';
import { setValueAtPath } from '../utils/pathCopier';
import { calculateJsonStats } from '../utils/jsonStats';
import { resolveHashState, stripHash } from '../utils/shareCompression';
import { inferDepthFromPaths } from '../utils/depthDetector';
import { evaluateJsonPath } from '../utils/jsonpath';
import { convertJsonKeys, toCamelCase, toSnakeCase, toPascalCase, toKebabCase, toConstantCase } from '../utils/caseConverter';

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Collect all expandable paths up to a given depth */
function collectPathsToDepth(value, path, maxDepth, result) {
  if (path.length >= maxDepth) return;
  const type = getValueType(value);
  if (type === 'object') {
    const pathStr = path.join('.');
    result.add(pathStr);
    Object.entries(value).forEach(([k, v]) => collectPathsToDepth(v, [...path, k], maxDepth, result));
  } else if (type === 'array') {
    const pathStr = path.join('.');
    result.add(pathStr);
    value.forEach((item, i) => collectPathsToDepth(item, [...path, i], maxDepth, result));
  }
}

function collectAllPaths(value, path, result) {
  const type = getValueType(value);
  if (type === 'object') {
    const pathStr = path.join('.');
    result.add(pathStr);
    Object.entries(value).forEach(([k, v]) => collectAllPaths(v, [...path, k], result));
  } else if (type === 'array') {
    const pathStr = path.join('.');
    result.add(pathStr);
    value.forEach((item, i) => collectAllPaths(item, [...path, i], result));
  }
}

// ── Breadcrumb ───────────────────────────────────────────────────────────────

function Breadcrumb({ path, onNavigate }) {
  if (!path || path.length === 0) return null;

  return (
    <div className="flex items-center gap-0.5 text-xs text-[var(--text-secondary)] overflow-x-auto px-4 py-1.5 border-b border-[var(--border-color)] flex-shrink-0">
      <button
        onClick={() => onNavigate([])}
        className="hover:text-[var(--accent-color)] transition-colors flex-shrink-0"
      >
        root
      </button>
      {path.map((segment, i) => (
        <span key={i} className="flex items-center gap-0.5 flex-shrink-0">
          <span className="text-[var(--border-color)]">/</span>
          <button
            onClick={() => onNavigate(path.slice(0, i + 1))}
            className={`hover:text-[var(--accent-color)] transition-colors ${
              i === path.length - 1 ? 'text-[var(--text-primary)] font-medium' : ''
            }`}
          >
            {typeof segment === 'number' ? `[${segment}]` : segment}
          </button>
        </span>
      ))}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

function JsonPreviewPage() {
  const {
    inputValue,
    setInputValue,
    parsedData,
    setParsedData,
    parseError,
    inputType,
    handleInputChange,
  } = useJsonParser('json-preview-input');

  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [matchCount, setMatchCount] = useState(0);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [expandedPaths, setExpandedPaths] = useState(new Set());
  const [filterMode, setFilterMode] = useState(false);
  const [breadcrumbPath, setBreadcrumbPath] = useState([]);
  const [pinnedPaths, setPinnedPaths] = useState(new Set());
  const [queryMode, setQueryMode] = useState('search'); // 'search' | 'jsonpath'
  const [jsonPathQuery, setJsonPathQuery] = useState('');
  const [jsonPathResultsOpen, setJsonPathResultsOpen] = useState(true);

  const [keyCaseOpen, setKeyCaseOpen] = useState(false);

  const inputTextareaRef = useRef(null);
  const treeScrollRef = useRef(null);
  const currentPinIndexRef = useRef(0);
  const keyCaseRef = useRef(null);
  const undoStack = useRef([]);
  const redoStack = useRef([]);

  /** Save current value before a transform action */
  const pushUndo = useCallback(() => {
    undoStack.current.push(inputValue);
    redoStack.current = [];
  }, [inputValue]);

  const jsonStats = useMemo(() => calculateJsonStats(parsedData), [parsedData]);

  // Infer current depth level from expandedPaths for share state
  const currentDepth = useMemo(
    () => inferDepthFromPaths(parsedData, expandedPaths),
    [parsedData, expandedPaths]
  );

  // ── Hash state restoration on mount ──────────────────────────────────────
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.startsWith('#state=') && !hash.startsWith('#s=')) return;

    (async () => {
      try {
        const state = await resolveHashState();
        // Only restore v1 (preview) state — v2 is for Compare page
        if (state && state.v === 1) restoreSharedState(state);
      } catch {
        // Invalid hash — silently ignore
      } finally {
        stripHash();
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Compute ancestor paths for all pinned nodes so they stay expanded
  const pinnedAncestorPaths = useMemo(() => {
    const ancestors = new Set();
    for (const pinned of pinnedPaths) {
      const parts = pinned.split('.');
      for (let i = 0; i <= parts.length; i++) {
        ancestors.add(parts.slice(0, i).join('.'));
      }
    }
    return ancestors;
  }, [pinnedPaths]);

  // Merge pinned ancestor paths into expandedPaths so pinned nodes stay open
  const effectiveExpandedPaths = useMemo(() => {
    if (pinnedAncestorPaths.size === 0) return expandedPaths;
    const merged = new Set(expandedPaths);
    for (const p of pinnedAncestorPaths) {
      merged.add(p);
    }
    return merged;
  }, [expandedPaths, pinnedAncestorPaths]);

  // ── JSONPath evaluation ──────────────────────────────────────────────────
  const jsonPathResults = useMemo(() => {
    if (queryMode !== 'jsonpath' || !jsonPathQuery.trim() || !parsedData) {
      return { matches: [], matchPaths: new Set(), error: null };
    }
    const expr = '$' + jsonPathQuery;
    const result = evaluateJsonPath(parsedData, expr);
    const matchPaths = new Set(result.matches.map((m) => m.path));
    return { matches: result.matches, matchPaths, error: result.error };
  }, [queryMode, jsonPathQuery, parsedData]);

  // Auto-expand ancestors of jsonpath matches
  useEffect(() => {
    if (jsonPathResults.matchPaths.size === 0) return;
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      for (const matchPath of jsonPathResults.matchPaths) {
        const parts = matchPath.split('.');
        for (let i = 0; i <= parts.length; i++) {
          next.add(parts.slice(0, i).join('.'));
        }
      }
      return next;
    });
  }, [jsonPathResults.matchPaths]);

  const hasExpandedNodes = expandedPaths.size > 0;

  // ── Expand / Collapse ────────────────────────────────────────────────────

  const handleCollapseAll = useCallback(() => {
    setExpandedPaths(new Set());
  }, []);

  const handleExpandToDepth = useCallback((depth) => {
    if (!parsedData) return;
    const paths = new Set();
    collectPathsToDepth(parsedData, [], depth, paths);
    setExpandedPaths(paths);
  }, [parsedData]);

  const handleExpandAll = useCallback(() => {
    if (!parsedData) return;
    const paths = new Set();
    collectAllPaths(parsedData, [], paths);
    setExpandedPaths(paths);
  }, [parsedData]);

  const handleTogglePath = useCallback((pathStr, isExpanded) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (isExpanded) {
        next.add(pathStr);
      } else {
        next.delete(pathStr);
      }
      return next;
    });
  }, []);

  const handleTogglePin = useCallback((pathStr) => {
    setPinnedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(pathStr)) {
        next.delete(pathStr);
      } else {
        next.add(pathStr);
      }
      return next;
    });
  }, []);

  const handleClearPins = useCallback(() => {
    setPinnedPaths(new Set());
    currentPinIndexRef.current = 0;
  }, []);

  const handleJumpToPin = useCallback(() => {
    if (pinnedPaths.size === 0) return;
    const paths = [...pinnedPaths];
    const index = currentPinIndexRef.current % paths.length;
    currentPinIndexRef.current = index + 1;
    const targetPath = paths[index];

    // Find the pinned node in the DOM
    const container = treeScrollRef.current;
    if (!container) return;
    const el = container.querySelector(`[data-pinned-path="${CSS.escape(targetPath)}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [pinnedPaths]);

  // ── Format / Minify / Clear / Download ────────────────────────────────────

  const handleFormat = useCallback(() => {
    const result = formatJson(inputValue);
    if (result.success) {
      pushUndo();
      setInputValue(result.formatted);
    }
  }, [inputValue, setInputValue, pushUndo]);

  const handleMinify = useCallback(() => {
    const result = parseJson(inputValue);
    if (result.success) {
      pushUndo();
      setInputValue(JSON.stringify(result.data));
    }
  }, [inputValue, setInputValue, pushUndo]);

  const handleConvertKeys = useCallback((converterFn) => {
    if (!parsedData) return;
    pushUndo();
    const converted = convertJsonKeys(parsedData, converterFn);
    const json = JSON.stringify(converted, null, 2);
    handleInputChange(json);
    setInputValue(json);
    setKeyCaseOpen(false);
  }, [parsedData, handleInputChange, setInputValue, pushUndo]);

  // Close keys dropdown on outside click
  useEffect(() => {
    if (!keyCaseOpen) return;
    const handler = (e) => {
      if (keyCaseRef.current && !keyCaseRef.current.contains(e.target)) {
        setKeyCaseOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [keyCaseOpen]);

  // ── Undo / Redo ──────────────────────────────────────────────────────────

  const handleUndo = useCallback(() => {
    if (undoStack.current.length === 0) return;
    redoStack.current.push(inputValue);
    const prev = undoStack.current.pop();
    handleInputChange(prev);
    setInputValue(prev);
  }, [inputValue, handleInputChange, setInputValue]);

  const handleRedo = useCallback(() => {
    if (redoStack.current.length === 0) return;
    undoStack.current.push(inputValue);
    const next = redoStack.current.pop();
    handleInputChange(next);
    setInputValue(next);
  }, [inputValue, handleInputChange, setInputValue]);

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        if (undoStack.current.length === 0) return; // let browser handle native undo
        e.preventDefault();
        handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        if (redoStack.current.length === 0) return; // let browser handle native redo
        e.preventDefault();
        handleRedo();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [handleUndo, handleRedo]);

  const handleDownload = useCallback(() => {
    if (!parsedData) return;
    const json = JSON.stringify(parsedData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [parsedData]);

  const handleValueEdit = useCallback((path, newValue) => {
    if (!parsedData) return;
    pushUndo();
    const newData = setValueAtPath(parsedData, path, newValue);
    setParsedData(newData);
    setInputValue(JSON.stringify(newData, null, 2));
  }, [parsedData, setParsedData, setInputValue, pushUndo]);

  const handleClear = useCallback(() => {
    if (inputValue) pushUndo();
    setInputValue('');
    handleInputChange('');
    setSearchQuery('');
    setActiveSearch('');
    setMatchCount(0);
    setCurrentMatchIndex(0);
    setExpandedPaths(new Set());
    setBreadcrumbPath([]);
    setFilterMode(false);
    setPinnedPaths(new Set());
    setQueryMode('search');
    setJsonPathQuery('');
  }, [setInputValue, handleInputChange]);

  // ── Share state restoration ────────────────────────────────────────────────

  const restoreSharedState = useCallback((state) => {
    if (!state || !state.j) return;

    // Restore JSON input
    handleInputChange(state.j);
    setInputValue(state.j);

    // Restore pinned paths
    if (state.p && state.p.length > 0) {
      setPinnedPaths(new Set(state.p));
    }

    // Restore expand depth — need parsed data to compute paths
    const result = parseJson(state.j);
    if (result.success && state.d) {
      const paths = new Set();
      if (state.d === 'all') {
        collectAllPaths(result.data, [], paths);
      } else {
        collectPathsToDepth(result.data, [], state.d, paths);
      }
      setExpandedPaths(paths);
    }

    // Restore search
    if (state.s) {
      setSearchQuery(state.s);
      setActiveSearch(state.s);
    }

    // Restore filter mode
    if (state.f) {
      setFilterMode(true);
    }
  }, [handleInputChange, setInputValue]);

  // ── Search ────────────────────────────────────────────────────────────────

  const handleSearchChange = useCallback((value) => {
    setSearchQuery(value);
    if (!value.trim()) {
      setActiveSearch('');
      setMatchCount(0);
      setCurrentMatchIndex(0);
      setFilterMode(false);
    }
  }, []);

  const handleSearchSubmit = useCallback(() => {
    if (!searchQuery.trim()) return;

    if (activeSearch === searchQuery && matchCount > 0) {
      setCurrentMatchIndex((prev) => (prev + 1) % matchCount);
      return;
    }

    setIsSearching(true);
    setCurrentMatchIndex(0);
    setTimeout(() => {
      setActiveSearch(searchQuery);
      setIsSearching(false);
    }, 50);
  }, [searchQuery, activeSearch, matchCount]);

  const handleSearchPrev = useCallback(() => {
    if (matchCount <= 0) return;
    if (activeSearch !== searchQuery) {
      handleSearchSubmit();
      return;
    }
    setCurrentMatchIndex((prev) => (prev - 1 + matchCount) % matchCount);
  }, [activeSearch, searchQuery, matchCount, handleSearchSubmit]);

  const handleSearchNext = useCallback(() => {
    if (matchCount <= 0) {
      handleSearchSubmit();
      return;
    }
    if (activeSearch !== searchQuery) {
      handleSearchSubmit();
      return;
    }
    setCurrentMatchIndex((prev) => (prev + 1) % matchCount);
  }, [activeSearch, searchQuery, matchCount, handleSearchSubmit]);

  const handleMatchCountChange = useCallback((count, searchExpandedPaths) => {
    setMatchCount(count);
    if (count === 0) {
      setCurrentMatchIndex(0);
    }
    if (searchExpandedPaths && searchExpandedPaths.size > 0) {
      setExpandedPaths((prev) => {
        const next = new Set(prev);
        for (const path of searchExpandedPaths) {
          if (path) next.add(path);
        }
        return next;
      });
    }
  }, []);

  const handleFilterToggle = useCallback(() => {
    setFilterMode((prev) => !prev);
  }, []);

  // ── Breadcrumb ────────────────────────────────────────────────────────────

  const handleBreadcrumbPath = useCallback((path) => {
    setBreadcrumbPath(path);
  }, []);

  const handleBreadcrumbNavigate = useCallback((path) => {
    if (path.length === 0) {
      setBreadcrumbPath([]);
      handleCollapseAll();
      return;
    }
    setBreadcrumbPath(path);
    // Ensure all ancestors are expanded
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      for (let i = 0; i <= path.length; i++) {
        next.add(path.slice(0, i).join('.'));
      }
      return next;
    });
  }, [handleCollapseAll]);

  // Wrap handleInputChange to also reset state
  const onInputChange = useCallback((value) => {
    handleInputChange(value);
    setExpandedPaths(new Set());
    setBreadcrumbPath([]);
    setPinnedPaths(new Set());
  }, [handleInputChange]);

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
        {/* Input Panel */}
        <div className="bg-[var(--bg-primary)] rounded-lg border border-[var(--border-color)] flex flex-col overflow-hidden relative">
          <div className="flex-shrink-0 h-11 flex items-center justify-between px-4 border-b border-[var(--border-color)]">
            <span className="text-sm font-medium flex items-center gap-1.5"><span className="text-[var(--accent-color)]"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M4 2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H4Zm1 2.25a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5A.75.75 0 0 1 5 4.25Zm0 2.5A.75.75 0 0 1 5.75 6h4.5a.75.75 0 0 1 0 1.5h-4.5A.75.75 0 0 1 5 6.75ZM5.75 8.5a.75.75 0 0 0 0 1.5h2.5a.75.75 0 0 0 0-1.5h-2.5Z" clipRule="evenodd" /></svg></span>Input</span>
            <div className="flex items-center gap-2">
              <InfoButton info={{
                what: 'Parses and visualises JSON (or JSON5) as an interactive, collapsible tree with syntax highlighting, search, and in-place editing.',
                how: 'The input is parsed with a lenient JSON/JSON5 parser, then rendered as a virtual tree. Nodes are expandable, searchable, and editable — changes are reflected in the raw input in real time.',
                usedFor: 'Exploring API responses, debugging deeply nested data, editing config files, and quickly navigating large JSON documents.',
              }} />
              <FormatButton onClick={handleFormat} label="Format" />
              <FormatButton onClick={handleMinify} label="Minify" />
              {parsedData && (
                <div className="relative" ref={keyCaseRef}>
                  <button
                    onClick={() => setKeyCaseOpen((p) => !p)}
                    className={`px-2 py-1 text-xs rounded transition-colors flex items-center gap-0.5 ${
                      keyCaseOpen
                        ? 'bg-[var(--accent-color)] text-white'
                        : 'bg-[var(--bg-secondary)] hover:bg-[var(--border-color)] text-[var(--text-primary)]'
                    }`}
                  >
                    Keys
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
                      <path fillRule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {keyCaseOpen && (
                    <div className="absolute top-full left-0 mt-1 z-50 w-36 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] shadow-lg py-1">
                      {[
                        { label: 'camelCase', fn: toCamelCase },
                        { label: 'snake_case', fn: toSnakeCase },
                        { label: 'PascalCase', fn: toPascalCase },
                        { label: 'kebab-case', fn: toKebabCase },
                        { label: 'CONSTANT_CASE', fn: toConstantCase },
                      ].map(({ label, fn }) => (
                        <button
                          key={label}
                          onClick={() => handleConvertKeys(fn)}
                          className="w-full text-left px-3 py-1.5 text-xs font-mono hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] transition-colors"
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {parsedData && (
                <FormatButton onClick={handleDownload} label="Download" />
              )}
              <FormatButton onClick={handleClear} label="Clear" variant="danger" />
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <JsonInput
              ref={inputTextareaRef}
              value={inputValue}
              onChange={onInputChange}
              error={parseError}
              placeholder="Paste JSON here, or drag & drop a file..."
            />
          </div>
          {(inputType || jsonStats) && (
            <div className="absolute bottom-3 left-3 flex items-center gap-2">
              {inputType && (
                <div className="px-2 py-0.5 text-xs bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded text-[var(--text-secondary)]">
                  {inputType === 'json' ? 'JSON' : 'JS Object'}
                </div>
              )}
              {jsonStats && (
                <>
                  <div className="px-2 py-0.5 text-xs bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded text-[var(--text-secondary)]">
                    {jsonStats.sizeFormatted}
                  </div>
                  <div className="px-2 py-0.5 text-xs bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded text-[var(--text-secondary)]">
                    {jsonStats.keys} keys
                  </div>
                  <div className="px-2 py-0.5 text-xs bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded text-[var(--text-secondary)]">
                    depth {jsonStats.maxDepth}
                  </div>
                </>
              )}
            </div>
          )}
          <ScrollToTop containerRef={inputTextareaRef} />
        </div>

        {/* Output Panel */}
        <div className="bg-[var(--bg-primary)] rounded-lg border border-[var(--border-color)] flex flex-col overflow-hidden relative">
          <div className="flex-shrink-0 h-11 flex items-center justify-between px-4 border-b border-[var(--border-color)]">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium flex items-center gap-1.5"><span className="text-[var(--accent-color)]"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4"><path d="M8 .5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0V1.25A.75.75 0 0 1 8 .5ZM4.5 7a.75.75 0 0 0 0 1.5h7a.75.75 0 0 0 0-1.5h-7ZM3 12a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-2Zm7-1a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1h-2Z" /></svg></span>Tree View</span>
              {/* Depth controls */}
              {parsedData && (
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3].map((d) => (
                    <button
                      key={d}
                      onClick={() => handleExpandToDepth(d)}
                      className="px-1.5 py-0.5 text-xs bg-[var(--bg-secondary)] hover:bg-[var(--border-color)] rounded transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      title={`Expand to depth ${d}`}
                    >
                      {d}
                    </button>
                  ))}
                  <button
                    onClick={handleExpandAll}
                    className="px-1.5 py-0.5 text-xs bg-[var(--bg-secondary)] hover:bg-[var(--border-color)] rounded transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    title="Expand all"
                  >
                    All
                  </button>
                  {hasExpandedNodes && (
                    <button
                      onClick={handleCollapseAll}
                      className="px-1.5 py-0.5 text-xs bg-[var(--bg-secondary)] hover:bg-[var(--border-color)] rounded transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center justify-center"
                      title="Collapse all"
                      style={{ minHeight: '1.25rem' }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                        <path d="M3.75 3.5a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5h-8.5ZM3.75 7.5a.75.75 0 0 0 0 1.5h4.5a.75.75 0 0 0 0-1.5h-4.5ZM3 12.25a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 0 1.5h-2.5a.75.75 0 0 1-.75-.75Z" />
                      </svg>
                    </button>
                  )}
                </div>
              )}
              {/* Pin count pill */}
              {pinnedPaths.size > 0 && (
                <div className="flex items-center">
                  <button
                    onClick={handleJumpToPin}
                    className="flex items-center gap-1 px-1.5 py-0.5 text-xs rounded-l border border-r-0 border-[var(--accent-color)] bg-[var(--accent-color)]/10 text-[var(--accent-color)] hover:bg-[var(--accent-color)]/20 transition-colors"
                    title="Jump to next pinned node"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
                      <path d="M10.97 2.22a.75.75 0 0 1 1.06 0l1.75 1.75a.75.75 0 0 1-.177 1.206l-2.12 1.061a1.5 1.5 0 0 0-.653.737l-.706 1.765a.75.75 0 0 1-1.239.263L7.25 7.363 4.03 10.584a.75.75 0 0 1-1.06-1.061L6.189 6.3 4.555 4.665a.75.75 0 0 1 .263-1.238l1.765-.706a1.5 1.5 0 0 0 .737-.653l1.06-2.12a.75.75 0 0 1 1.207-.178l.382.383Z" />
                    </svg>
                    {pinnedPaths.size}
                  </button>
                  <button
                    onClick={handleClearPins}
                    className="px-1 py-0.5 text-xs rounded-r border border-[var(--accent-color)] bg-[var(--accent-color)]/10 text-[var(--accent-color)] hover:bg-[var(--accent-color)]/20 transition-colors"
                    title="Clear all pins"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <SearchBar
                value={queryMode === 'search' ? searchQuery : jsonPathQuery}
                onChange={queryMode === 'search' ? handleSearchChange : setJsonPathQuery}
                onSubmit={queryMode === 'search' ? handleSearchSubmit : undefined}
                onPrev={queryMode === 'search' ? handleSearchPrev : undefined}
                onNext={queryMode === 'search' ? handleSearchNext : undefined}
                isSearching={queryMode === 'search' ? isSearching : false}
                matchCount={queryMode === 'search' ? matchCount : jsonPathResults.matches.length}
                currentMatch={queryMode === 'search' ? currentMatchIndex : undefined}
                filterMode={queryMode === 'search' ? filterMode : false}
                onFilterToggle={queryMode === 'search' && parsedData ? handleFilterToggle : undefined}
                queryMode={queryMode}
                onToggleQueryMode={parsedData ? () => setQueryMode((m) => m === 'search' ? 'jsonpath' : 'search') : undefined}
                jsonPathError={queryMode === 'jsonpath' ? jsonPathResults.error : null}
              />
              {parsedData && (
                <ShareButton shareData={{
                  json: inputValue,
                  pinnedPaths: [...pinnedPaths],
                  depth: currentDepth,
                  searchQuery: activeSearch,
                  filterMode,
                  jsonStats,
                }} />
              )}
            </div>
          </div>
          {/* Breadcrumb */}
          <Breadcrumb path={breadcrumbPath} onNavigate={handleBreadcrumbNavigate} />

          {/* JSONPath results panel */}
          {queryMode === 'jsonpath' && jsonPathResults.matches.length > 0 && (
            <div className="flex-shrink-0 border-b border-[var(--border-color)]">
              <button
                onClick={() => setJsonPathResultsOpen((p) => !p)}
                className="w-full flex items-center gap-1.5 px-4 py-1.5 text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors"
              >
                <span className="text-[10px]">{jsonPathResultsOpen ? '▼' : '▶'}</span>
                <span className="font-medium text-[var(--jsonpath-color)]">{jsonPathResults.matches.length}</span>
                <span>match{jsonPathResults.matches.length !== 1 ? 'es' : ''}</span>
              </button>
              {jsonPathResultsOpen && (
                <div className="max-h-32 overflow-auto px-4 pb-2 space-y-0.5">
                  {jsonPathResults.matches.slice(0, 100).map((m, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className="text-[var(--text-secondary)] font-mono truncate min-w-0 flex-shrink" title={m.path}>
                        $.{m.path}
                      </span>
                      <span className="text-[var(--text-secondary)]">=</span>
                      <span className="font-mono truncate min-w-0 flex-1 text-[var(--jsonpath-color)]">
                        {typeof m.value === 'string' ? `"${m.value}"` : JSON.stringify(m.value)}
                      </span>
                    </div>
                  ))}
                  {jsonPathResults.matches.length > 100 && (
                    <div className="text-xs text-[var(--text-secondary)] italic">
                      ...and {jsonPathResults.matches.length - 100} more
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex-1 overflow-auto p-4" ref={treeScrollRef}>
            {parsedData !== null ? (
              <TreeView
                data={parsedData}
                searchQuery={queryMode === 'search' ? activeSearch : ''}
                onValueEdit={handleValueEdit}
                currentMatchIndex={currentMatchIndex}
                onMatchCountChange={handleMatchCountChange}
                controlledExpandedPaths={effectiveExpandedPaths}
                onTogglePath={handleTogglePath}
                filterMode={filterMode}
                onBreadcrumbPath={handleBreadcrumbPath}
                pinnedPaths={pinnedPaths}
                onTogglePin={handleTogglePin}
                jsonpathMatches={queryMode === 'jsonpath' ? jsonPathResults.matchPaths : undefined}
              />
            ) : parseError ? (
              <div className="text-[var(--error-color)] text-sm">
                <span className="font-medium">Parse Error:</span> {parseError}
              </div>
            ) : (
              <div className="text-[var(--text-secondary)] text-sm">
                Enter JSON or JavaScript object to view tree
              </div>
            )}
          </div>
          <ScrollToTop containerRef={treeScrollRef} />
        </div>
      </div>

    </div>
  );
}

export default JsonPreviewPage;
