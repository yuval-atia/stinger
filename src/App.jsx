import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import JsonInput from './components/Editor/JsonInput';
import TreeView from './components/TreeView/TreeView';
import SearchBar from './components/Search/SearchBar';
import DiffView from './components/Compare/DiffView';
import FormatButton from './components/common/FormatButton';
import ScrollToTop from './components/common/ScrollToTop';
import { parseJson, formatJson } from './utils/jsonParser';
import { parseJsObject } from './components/Editor/JsObjectParser';
import { setValueAtPath } from './utils/pathCopier';
import { calculateJsonStats } from './utils/jsonStats';

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  const [inputValue, setInputValue] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [parseError, setParseError] = useState(null);
  const [inputType, setInputType] = useState(null); // 'json' | 'js' | null
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [matchCount, setMatchCount] = useState(0);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [compareMode, setCompareMode] = useState(false);
  const [compareInput, setCompareInput] = useState('');
  const [compareData, setCompareData] = useState(null);
  const [compareError, setCompareError] = useState(null);
  const [expandedPaths, setExpandedPaths] = useState(new Set());

  const inputTextareaRef = useRef(null);
  const treeScrollRef = useRef(null);

  // Calculate stats when data changes
  const jsonStats = useMemo(() => calculateJsonStats(parsedData), [parsedData]);

  // Single source of truth: are there any expanded non-root paths?
  const hasExpandedNodes = expandedPaths.size > 0;

  const handleCollapseAll = useCallback(() => {
    setExpandedPaths(new Set());
  }, []);

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

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleInputChange = useCallback((value) => {
    setInputValue(value);

    if (!value.trim()) {
      setParsedData(null);
      setParseError(null);
      setInputType(null);
      return;
    }

    // Try standard JSON first
    let result = parseJson(value);
    let detectedType = 'json';

    // If that fails, try parsing as JS object
    if (!result.success) {
      const jsResult = parseJsObject(value);
      if (jsResult.success) {
        result = jsResult;
        detectedType = 'js';
      }
    }

    if (result.success) {
      setParsedData(result.data);
      setParseError(null);
      setInputType(detectedType);
      setExpandedPaths(new Set());
    } else {
      setParsedData(null);
      setParseError(result.error);
      setInputType(null);
      setExpandedPaths(new Set());
    }
  }, []);

  const handleCompareInputChange = useCallback((value) => {
    setCompareInput(value);

    if (!value.trim()) {
      setCompareData(null);
      setCompareError(null);
      return;
    }

    let result = parseJson(value);

    if (!result.success) {
      const jsResult = parseJsObject(value);
      if (jsResult.success) {
        result = jsResult;
      }
    }

    if (result.success) {
      setCompareData(result.data);
      setCompareError(null);
    } else {
      setCompareData(null);
      setCompareError(result.error);
    }
  }, []);

  const handleFormat = useCallback(() => {
    const result = formatJson(inputValue);
    if (result.success) {
      setInputValue(result.formatted);
    }
  }, [inputValue]);

  const handleMinify = useCallback(() => {
    const result = parseJson(inputValue);
    if (result.success) {
      setInputValue(JSON.stringify(result.data));
    }
  }, [inputValue]);

  const handleValueEdit = useCallback((path, newValue) => {
    if (!parsedData) return;

    const newData = setValueAtPath(parsedData, path, newValue);
    setParsedData(newData);
    setInputValue(JSON.stringify(newData, null, 2));
  }, [parsedData]);

  const handleClear = useCallback(() => {
    setInputValue('');
    setParsedData(null);
    setParseError(null);
    setSearchQuery('');
    setActiveSearch('');
    setMatchCount(0);
    setCurrentMatchIndex(0);
  }, []);

  const handleSearchChange = useCallback((value) => {
    setSearchQuery(value);
    if (!value.trim()) {
      setActiveSearch('');
      setMatchCount(0);
      setCurrentMatchIndex(0);
    }
  }, []);

  const handleSearchSubmit = useCallback(() => {
    if (!searchQuery.trim()) return;

    // If already searching with same query, move to next match
    if (activeSearch === searchQuery && matchCount > 0) {
      setCurrentMatchIndex((prev) => (prev + 1) % matchCount);
      return;
    }

    // New search
    setIsSearching(true);
    setCurrentMatchIndex(0);
    setTimeout(() => {
      setActiveSearch(searchQuery);
      setIsSearching(false);
    }, 50);
  }, [searchQuery, activeSearch, matchCount]);

  const handleMatchCountChange = useCallback((count, searchExpandedPaths) => {
    setMatchCount(count);
    if (count === 0) {
      setCurrentMatchIndex(0);
    }
    // Merge search-expanded paths into our expanded paths
    if (searchExpandedPaths && searchExpandedPaths.size > 0) {
      setExpandedPaths((prev) => {
        const next = new Set(prev);
        for (const path of searchExpandedPaths) {
          if (path) next.add(path); // Don't add empty root path
        }
        return next;
      });
    }
  }, []);

  return (
    <div className="h-screen flex flex-col bg-[var(--bg-secondary)] text-[var(--text-primary)]">
      {/* Header */}
      <header className="flex-shrink-0 bg-[var(--bg-primary)] border-b border-[var(--border-color)] px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="flex items-center">
            <img src={import.meta.env.BASE_URL + 'logo.png'} alt="JSON Bee" className="h-8" />
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCompareMode(!compareMode)}
              className={`px-3 py-1.5 rounded text-sm transition-colors ${
                compareMode
                  ? 'bg-[var(--accent-color)] text-white'
                  : 'bg-[var(--bg-secondary)] hover:bg-[var(--border-color)]'
              }`}
            >
              Compare
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded hover:bg-[var(--bg-secondary)] transition-colors"
              aria-label="Toggle theme"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden max-w-7xl w-full mx-auto p-4">
        {compareMode ? (
          <DiffView
            leftInput={inputValue}
            rightInput={compareInput}
            leftData={parsedData}
            rightData={compareData}
            leftError={parseError}
            rightError={compareError}
            onLeftChange={handleInputChange}
            onRightChange={handleCompareInputChange}
            searchQuery={activeSearch}
            onSearchChange={handleSearchChange}
            onSearchSubmit={handleSearchSubmit}
            isSearching={isSearching}
          />
        ) : (
          <div className="flex flex-col h-full gap-4">
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
            {/* Input Panel */}
            <div className="bg-[var(--bg-primary)] rounded-lg border border-[var(--border-color)] flex flex-col overflow-hidden relative">
              <div className="flex-shrink-0 h-11 flex items-center justify-between px-4 border-b border-[var(--border-color)]">
                <span className="text-sm font-medium">Input</span>
                <div className="flex items-center gap-2">
                  <FormatButton onClick={handleFormat} label="Format" />
                  <FormatButton onClick={handleMinify} label="Minify" />
                  <FormatButton onClick={handleClear} label="Clear" variant="danger" />
                </div>
              </div>
              <div className="flex-1 overflow-hidden">
                <JsonInput
                  ref={inputTextareaRef}
                  value={inputValue}
                  onChange={handleInputChange}
                  error={parseError}
                  placeholder="Paste JSON or JavaScript object here..."
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
                    <div className="px-2 py-0.5 text-xs bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded text-[var(--text-secondary)]">
                      {jsonStats.sizeFormatted}
                    </div>
                  )}
                </div>
              )}
              <ScrollToTop containerRef={inputTextareaRef} />
            </div>

            {/* Output Panel */}
            <div className="bg-[var(--bg-primary)] rounded-lg border border-[var(--border-color)] flex flex-col overflow-hidden relative">
              <div className="flex-shrink-0 h-11 flex items-center justify-between px-4 border-b border-[var(--border-color)]">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Tree View</span>
                  {hasExpandedNodes && (
                    <button
                      onClick={handleCollapseAll}
                      className="px-2 py-1 text-xs bg-[var(--bg-secondary)] hover:bg-[var(--border-color)] rounded transition-colors"
                      title="Collapse all"
                    >
                      Collapse
                    </button>
                  )}
                </div>
                <SearchBar
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onSubmit={handleSearchSubmit}
                  isSearching={isSearching}
                  matchCount={matchCount}
                  currentMatch={currentMatchIndex}
                />
              </div>
              <div className="flex-1 overflow-auto p-4" ref={treeScrollRef}>
                {parsedData !== null ? (
                  <TreeView
                    data={parsedData}
                    searchQuery={activeSearch}
                    onValueEdit={handleValueEdit}
                    currentMatchIndex={currentMatchIndex}
                    onMatchCountChange={handleMatchCountChange}
                    controlledExpandedPaths={expandedPaths}
                    onTogglePath={handleTogglePath}
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

          {/* Ad Placeholder */}
          <div className="flex-shrink-0 h-24 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-color)] flex items-center justify-center">
            <span className="text-[var(--text-secondary)] text-sm">Ad Space</span>
          </div>
          </div>
        )}
      </main>

      <footer className="flex-shrink-0 px-4 py-1.5">
        <p className="text-xs text-[var(--text-secondary)] opacity-50">Created by Yuval Atia</p>
      </footer>
    </div>
  );
}

export default App;
