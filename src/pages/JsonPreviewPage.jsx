import { useState, useCallback, useRef, useMemo } from 'react';
import JsonInput from '../components/Editor/JsonInput';
import TreeView from '../components/TreeView/TreeView';
import SearchBar from '../components/Search/SearchBar';
import FormatButton from '../components/common/FormatButton';
import { InfoButton } from '../components/common/InfoTooltip';
import ScrollToTop from '../components/common/ScrollToTop';
import { useJsonParser } from '../hooks/useJsonParser';
import { parseJson, formatJson } from '../utils/jsonParser';
import { setValueAtPath } from '../utils/pathCopier';
import { calculateJsonStats } from '../utils/jsonStats';

function JsonPreviewPage() {
  const {
    inputValue,
    setInputValue,
    parsedData,
    setParsedData,
    parseError,
    inputType,
    handleInputChange,
  } = useJsonParser();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [matchCount, setMatchCount] = useState(0);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [expandedPaths, setExpandedPaths] = useState(new Set());

  const inputTextareaRef = useRef(null);
  const treeScrollRef = useRef(null);

  const jsonStats = useMemo(() => calculateJsonStats(parsedData), [parsedData]);

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

  const handleFormat = useCallback(() => {
    const result = formatJson(inputValue);
    if (result.success) {
      setInputValue(result.formatted);
    }
  }, [inputValue, setInputValue]);

  const handleMinify = useCallback(() => {
    const result = parseJson(inputValue);
    if (result.success) {
      setInputValue(JSON.stringify(result.data));
    }
  }, [inputValue, setInputValue]);

  const handleValueEdit = useCallback((path, newValue) => {
    if (!parsedData) return;
    const newData = setValueAtPath(parsedData, path, newValue);
    setParsedData(newData);
    setInputValue(JSON.stringify(newData, null, 2));
  }, [parsedData, setParsedData, setInputValue]);

  const handleClear = useCallback(() => {
    setInputValue('');
    handleInputChange('');
    setSearchQuery('');
    setActiveSearch('');
    setMatchCount(0);
    setCurrentMatchIndex(0);
    setExpandedPaths(new Set());
  }, [setInputValue, handleInputChange]);

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

  // Wrap handleInputChange to also reset expanded paths
  const onInputChange = useCallback((value) => {
    handleInputChange(value);
    setExpandedPaths(new Set());
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
              <FormatButton onClick={handleClear} label="Clear" variant="danger" />
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <JsonInput
              ref={inputTextareaRef}
              value={inputValue}
              onChange={onInputChange}
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
              <span className="text-sm font-medium flex items-center gap-1.5"><span className="text-[var(--accent-color)]"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4"><path d="M8 .5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0V1.25A.75.75 0 0 1 8 .5ZM4.5 7a.75.75 0 0 0 0 1.5h7a.75.75 0 0 0 0-1.5h-7ZM3 12a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-2Zm7-1a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1h-2Z" /></svg></span>Tree View</span>
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
  );
}

export default JsonPreviewPage;
