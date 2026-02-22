import { useState, useCallback, useEffect, useMemo } from 'react';
import DiffView from '../components/Compare/DiffView';
import { useJsonParser } from '../hooks/useJsonParser';
import { resolveHashState, stripHash } from '../utils/shareCompression';

function JsonComparePage() {
  const left = useJsonParser();
  const right = useJsonParser();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [diffOnly, setDiffOnly] = useState(false);
  const [arrayMatchKey, setArrayMatchKey] = useState('');

  // ── Hash state restoration on mount ──────────────────────────────────────
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.startsWith('#state=') && !hash.startsWith('#s=')) return;

    (async () => {
      try {
        const state = await resolveHashState();
        if (state && state.v === 2) {
          if (state.l) left.handleInputChange(state.l);
          if (state.r) right.handleInputChange(state.r);
          if (state.do) setDiffOnly(true);
          if (state.ak) setArrayMatchKey(state.ak);
        }
      } catch {
        // Invalid hash — silently ignore
      } finally {
        stripHash();
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearchChange = useCallback((value) => {
    setSearchQuery(value);
    if (!value.trim()) {
      setActiveSearch('');
    }
  }, []);

  const handleSearchSubmit = useCallback(() => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setTimeout(() => {
      setActiveSearch(searchQuery);
      setIsSearching(false);
    }, 50);
  }, [searchQuery]);

  const handleSwap = useCallback(() => {
    const leftVal = left.inputValue;
    const rightVal = right.inputValue;
    left.handleInputChange(rightVal);
    right.handleInputChange(leftVal);
  }, [left, right]);

  const handleDiffOnlyChange = useCallback((val) => {
    setDiffOnly(val);
  }, []);

  const shareData = useMemo(() => ({
    leftJson: left.inputValue,
    rightJson: right.inputValue,
    diffOnly,
    arrayMatchKey,
  }), [left.inputValue, right.inputValue, diffOnly, arrayMatchKey]);

  return (
    <DiffView
      leftInput={left.inputValue}
      rightInput={right.inputValue}
      leftData={left.parsedData}
      rightData={right.parsedData}
      leftError={left.parseError}
      rightError={right.parseError}
      onLeftChange={left.handleInputChange}
      onRightChange={right.handleInputChange}
      searchQuery={activeSearch}
      onSearchChange={handleSearchChange}
      onSearchSubmit={handleSearchSubmit}
      isSearching={isSearching}
      onSwap={handleSwap}
      diffOnly={diffOnly}
      onDiffOnlyChange={handleDiffOnlyChange}
      arrayMatchKey={arrayMatchKey}
      onArrayMatchKeyChange={setArrayMatchKey}
      shareData={shareData}
    />
  );
}

export default JsonComparePage;
