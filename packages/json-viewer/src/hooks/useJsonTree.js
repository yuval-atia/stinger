import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { getValueType } from '../utils/jsonParser.js';
import { flattenTree, buildPathIndex } from '../utils/flattenTree.js';

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

export function useJsonTree(data, options = {}) {
  const {
    defaultExpandDepth = 0,
    expandedPaths: controlledExpanded,
    onExpandedPathsChange,
    pinnedPaths: controlledPinned,
    onPinnedPathsChange,
  } = options;

  // Internal state (uncontrolled mode)
  const [internalExpanded, setInternalExpanded] = useState(() => {
    if (defaultExpandDepth > 0 && data) {
      const paths = new Set();
      collectPathsToDepth(data, [], defaultExpandDepth, paths);
      return paths;
    }
    return new Set();
  });
  const [internalPinned, setInternalPinned] = useState(new Set());

  // Use controlled or internal state
  const expandedPaths = controlledExpanded ?? internalExpanded;
  const setExpandedPaths = onExpandedPathsChange
    ? (updater) => {
        const next = typeof updater === 'function' ? updater(expandedPaths) : updater;
        onExpandedPathsChange(next);
      }
    : setInternalExpanded;

  const pinnedPaths = controlledPinned ?? internalPinned;
  const setPinnedPaths = onPinnedPathsChange
    ? (updater) => {
        const next = typeof updater === 'function' ? updater(pinnedPaths) : updater;
        onPinnedPathsChange(next);
      }
    : setInternalPinned;

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [matchCount, setMatchCount] = useState(0);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [filterMode, setFilterMode] = useState(false);
  const searchDebounceRef = useRef(null);

  // Cleanup search debounce on unmount
  useEffect(() => {
    return () => clearTimeout(searchDebounceRef.current);
  }, []);

  // Pinned ancestor paths
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

  // Effective expanded paths (with pinned ancestors merged)
  const effectiveExpandedPaths = useMemo(() => {
    if (pinnedAncestorPaths.size === 0) return expandedPaths;
    const merged = new Set(expandedPaths);
    for (const p of pinnedAncestorPaths) {
      merged.add(p);
    }
    return merged;
  }, [expandedPaths, pinnedAncestorPaths]);

  // Expand/collapse actions
  const expandToDepth = useCallback((depth) => {
    if (!data) return;
    const paths = new Set();
    collectPathsToDepth(data, [], depth, paths);
    setExpandedPaths(paths);
  }, [data, setExpandedPaths]);

  const expandAll = useCallback(() => {
    if (!data) return;
    const paths = new Set();
    collectAllPaths(data, [], paths);
    setExpandedPaths(paths);
  }, [data, setExpandedPaths]);

  const collapseAll = useCallback(() => {
    setExpandedPaths(new Set());
  }, [setExpandedPaths]);

  const togglePath = useCallback((pathStr, isExpanded) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (isExpanded) {
        next.add(pathStr);
      } else {
        next.delete(pathStr);
      }
      return next;
    });
  }, [setExpandedPaths]);

  // Pin actions
  const togglePin = useCallback((pathStr) => {
    setPinnedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(pathStr)) {
        next.delete(pathStr);
      } else {
        next.add(pathStr);
      }
      return next;
    });
  }, [setPinnedPaths]);

  const clearPins = useCallback(() => {
    setPinnedPaths(new Set());
  }, [setPinnedPaths]);

  // Search actions
  const handleSearchChange = useCallback((value) => {
    setSearchQuery(value);
    if (!value.trim()) {
      clearTimeout(searchDebounceRef.current);
      setActiveSearch('');
      setMatchCount(0);
      setCurrentMatchIndex(0);
      setFilterMode(false);
    } else {
      clearTimeout(searchDebounceRef.current);
      searchDebounceRef.current = setTimeout(() => {
        setCurrentMatchIndex(0);
        setActiveSearch(value);
      }, 300);
    }
  }, []);

  const handleSearchSubmit = useCallback(() => {
    if (!searchQuery.trim()) return;
    if (activeSearch === searchQuery && matchCount > 0) {
      setCurrentMatchIndex((prev) => (prev + 1) % matchCount);
      return;
    }
    clearTimeout(searchDebounceRef.current);
    setCurrentMatchIndex(0);
    setActiveSearch(searchQuery);
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
  }, [setExpandedPaths]);

  const toggleFilter = useCallback(() => {
    setFilterMode((prev) => !prev);
  }, []);

  // Flat nodes for virtualization
  const flatNodes = useMemo(() => {
    if (!data) return [];
    return flattenTree(data, effectiveExpandedPaths, {
      searchQuery: activeSearch,
    });
  }, [data, effectiveExpandedPaths, activeSearch]);

  const pathIndex = useMemo(() => buildPathIndex(flatNodes), [flatNodes]);

  return {
    // Expand state
    expandedPaths: effectiveExpandedPaths,
    expandToDepth,
    expandAll,
    collapseAll,
    togglePath,

    // Pin state
    pinnedPaths,
    togglePin,
    clearPins,

    // Search state
    search: {
      query: searchQuery,
      setQuery: handleSearchChange,
      activeQuery: activeSearch,
      matches: matchCount,
      currentMatch: currentMatchIndex,
      next: handleSearchNext,
      prev: handleSearchPrev,
      submit: handleSearchSubmit,
      filterMode,
      toggleFilter,
      onMatchCountChange: handleMatchCountChange,
    },

    // Flat nodes for custom rendering / virtualization
    flatNodes,
    pathIndex,
  };
}
