'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var chunkENLJ6X3T_cjs = require('./chunk-ENLJ6X3T.cjs');
var chunkLWZCANR6_cjs = require('./chunk-LWZCANR6.cjs');
var chunkR44OFLPH_cjs = require('./chunk-R44OFLPH.cjs');
var react = require('react');
var jsxRuntime = require('react/jsx-runtime');

function SearchBar({ value, onChange, onSubmit, onPrev, onNext, isSearching, matchCount, currentMatch, filterMode, onFilterToggle }) {
  const inputRef = react.useRef(null);
  const handleChange = react.useCallback(
    (e) => {
      onChange(e.target.value);
    },
    [onChange]
  );
  const handleClear = react.useCallback(() => {
    var _a;
    onChange("");
    (_a = inputRef.current) == null ? void 0 : _a.focus();
  }, [onChange]);
  const handleKeyDown = react.useCallback(
    (e) => {
      var _a;
      if (e.key === "Escape") {
        onChange("");
        (_a = inputRef.current) == null ? void 0 : _a.blur();
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (e.shiftKey) {
          onPrev == null ? void 0 : onPrev();
        } else {
          onSubmit == null ? void 0 : onSubmit();
        }
      }
    },
    [onChange, onSubmit, onPrev]
  );
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "sjt-flex sjt-items-center sjt-gap-1.5", children: [
    /* @__PURE__ */ jsxRuntime.jsx("span", { className: "sjt-text-xs sjt-whitespace-nowrap sjt-text-right", style: { color: "var(--sjt-text-secondary)", width: "3rem" }, children: matchCount > 0 ? `${currentMatch + 1}/${matchCount}` : "" }),
    matchCount > 0 && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "sjt-flex sjt-items-center", children: [
      /* @__PURE__ */ jsxRuntime.jsx(
        "button",
        {
          onClick: onPrev,
          className: "sjt-rounded sjt-transition-colors",
          style: { padding: "2px", color: "var(--sjt-text-secondary)" },
          title: "Previous match (Shift+Enter)",
          children: /* @__PURE__ */ jsxRuntime.jsx("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 16 16", fill: "currentColor", className: "sjt-w-3.5 sjt-h-3.5", children: /* @__PURE__ */ jsxRuntime.jsx("path", { fillRule: "evenodd", d: "M11.78 9.78a.75.75 0 0 1-1.06 0L8 7.06 5.28 9.78a.75.75 0 0 1-1.06-1.06l3.25-3.25a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06Z", clipRule: "evenodd" }) })
        }
      ),
      /* @__PURE__ */ jsxRuntime.jsx(
        "button",
        {
          onClick: onNext,
          className: "sjt-rounded sjt-transition-colors",
          style: { padding: "2px", color: "var(--sjt-text-secondary)" },
          title: "Next match (Enter)",
          children: /* @__PURE__ */ jsxRuntime.jsx("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 16 16", fill: "currentColor", className: "sjt-w-3.5 sjt-h-3.5", children: /* @__PURE__ */ jsxRuntime.jsx("path", { fillRule: "evenodd", d: "M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z", clipRule: "evenodd" }) })
        }
      )
    ] }),
    onFilterToggle && matchCount > 0 && /* @__PURE__ */ jsxRuntime.jsx(
      "button",
      {
        onClick: onFilterToggle,
        className: "sjt-rounded sjt-transition-colors",
        style: {
          padding: "4px",
          backgroundColor: filterMode ? "var(--sjt-accent-color)" : "transparent",
          color: filterMode ? "#ffffff" : "var(--sjt-text-secondary)"
        },
        title: filterMode ? "Show all nodes" : "Show only matches",
        children: /* @__PURE__ */ jsxRuntime.jsx("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 16 16", fill: "currentColor", className: "sjt-w-3.5 sjt-h-3.5", children: /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M14 2H2l5 5.6V12l2 1.5V7.6L14 2Z" }) })
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "sjt-relative sjt-flex sjt-items-center", children: [
      isSearching ? /* @__PURE__ */ jsxRuntime.jsx("span", { className: "sjt-absolute sjt-text-xs sjt-flex sjt-items-center sjt-justify-center", style: { left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--sjt-text-secondary)" }, children: /* @__PURE__ */ jsxRuntime.jsx("span", { className: "sjt-inline-block sjt-animate-spin", children: /* @__PURE__ */ jsxRuntime.jsx("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 16 16", fill: "currentColor", className: "sjt-w-3.5 sjt-h-3.5", children: /* @__PURE__ */ jsxRuntime.jsx("path", { fillRule: "evenodd", d: "M13.836 2.477a.75.75 0 0 1 .75.75v3.182a.75.75 0 0 1-.75.75h-3.182a.75.75 0 0 1 0-1.5h1.37l-.84-.841a4.5 4.5 0 0 0-7.08.681.75.75 0 0 1-1.3-.75 6 6 0 0 1 9.44-.908l.84.84V3.227a.75.75 0 0 1 .75-.75Zm-.911 7.5A.75.75 0 0 1 13.199 11a6 6 0 0 1-9.44.908l-.84-.84v1.836a.75.75 0 0 1-1.5 0V9.722a.75.75 0 0 1 .75-.75h3.182a.75.75 0 0 1 0 1.5H3.98l.841.841a4.5 4.5 0 0 0 7.08-.681.75.75 0 0 1 1.025-.274Z", clipRule: "evenodd" }) }) }) }) : /* @__PURE__ */ jsxRuntime.jsx("span", { className: "sjt-absolute sjt-flex sjt-items-center sjt-justify-center", style: { left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--sjt-text-secondary)" }, children: /* @__PURE__ */ jsxRuntime.jsx("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 16 16", fill: "currentColor", className: "sjt-w-3.5 sjt-h-3.5", children: /* @__PURE__ */ jsxRuntime.jsx("path", { fillRule: "evenodd", d: "M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z", clipRule: "evenodd" }) }) }),
      /* @__PURE__ */ jsxRuntime.jsx(
        "input",
        {
          ref: inputRef,
          type: "text",
          value,
          onChange: handleChange,
          onKeyDown: handleKeyDown,
          placeholder: "Search...",
          className: "sjt-rounded sjt-text-sm",
          style: {
            width: "11rem",
            paddingLeft: "2rem",
            paddingRight: "1.75rem",
            paddingTop: "4px",
            paddingBottom: "4px",
            backgroundColor: "var(--sjt-bg-secondary)",
            border: "1px solid var(--sjt-border-color)",
            color: "var(--sjt-text-primary)",
            outline: "none"
          }
        }
      ),
      value && !isSearching && /* @__PURE__ */ jsxRuntime.jsx(
        "button",
        {
          onClick: handleClear,
          className: "sjt-absolute",
          style: { right: "8px", top: "50%", transform: "translateY(-50%)", color: "var(--sjt-text-secondary)" },
          "aria-label": "Clear search",
          children: /* @__PURE__ */ jsxRuntime.jsx("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 16 16", fill: "currentColor", className: "sjt-w-3.5 sjt-h-3.5", children: /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" }) })
        }
      )
    ] })
  ] });
}
var SearchBar_default = SearchBar;
function collectPathsToDepth(value, path, maxDepth, result) {
  if (path.length >= maxDepth) return;
  const type = chunkR44OFLPH_cjs.getValueType(value);
  if (type === "object") {
    const pathStr = path.join(".");
    result.add(pathStr);
    Object.entries(value).forEach(([k, v]) => collectPathsToDepth(v, [...path, k], maxDepth, result));
  } else if (type === "array") {
    const pathStr = path.join(".");
    result.add(pathStr);
    value.forEach((item, i) => collectPathsToDepth(item, [...path, i], maxDepth, result));
  }
}
function collectAllPaths(value, path, result) {
  const type = chunkR44OFLPH_cjs.getValueType(value);
  if (type === "object") {
    const pathStr = path.join(".");
    result.add(pathStr);
    Object.entries(value).forEach(([k, v]) => collectAllPaths(v, [...path, k], result));
  } else if (type === "array") {
    const pathStr = path.join(".");
    result.add(pathStr);
    value.forEach((item, i) => collectAllPaths(item, [...path, i], result));
  }
}
function useJsonTree(data, options = {}) {
  const {
    defaultExpandDepth = 0,
    expandedPaths: controlledExpanded,
    onExpandedPathsChange,
    pinnedPaths: controlledPinned,
    onPinnedPathsChange
  } = options;
  const [internalExpanded, setInternalExpanded] = react.useState(() => {
    if (defaultExpandDepth > 0 && data) {
      const paths = /* @__PURE__ */ new Set();
      collectPathsToDepth(data, [], defaultExpandDepth, paths);
      return paths;
    }
    return /* @__PURE__ */ new Set();
  });
  const [internalPinned, setInternalPinned] = react.useState(/* @__PURE__ */ new Set());
  const expandedPaths = controlledExpanded ?? internalExpanded;
  const setExpandedPaths = onExpandedPathsChange ? (updater) => {
    const next = typeof updater === "function" ? updater(expandedPaths) : updater;
    onExpandedPathsChange(next);
  } : setInternalExpanded;
  const pinnedPaths = controlledPinned ?? internalPinned;
  const setPinnedPaths = onPinnedPathsChange ? (updater) => {
    const next = typeof updater === "function" ? updater(pinnedPaths) : updater;
    onPinnedPathsChange(next);
  } : setInternalPinned;
  const [searchQuery, setSearchQuery] = react.useState("");
  const [activeSearch, setActiveSearch] = react.useState("");
  const [matchCount, setMatchCount] = react.useState(0);
  const [currentMatchIndex, setCurrentMatchIndex] = react.useState(0);
  const [filterMode, setFilterMode] = react.useState(false);
  const searchDebounceRef = react.useRef(null);
  react.useEffect(() => {
    return () => clearTimeout(searchDebounceRef.current);
  }, []);
  const pinnedAncestorPaths = react.useMemo(() => {
    const ancestors = /* @__PURE__ */ new Set();
    for (const pinned of pinnedPaths) {
      const parts = pinned.split(".");
      for (let i = 0; i <= parts.length; i++) {
        ancestors.add(parts.slice(0, i).join("."));
      }
    }
    return ancestors;
  }, [pinnedPaths]);
  const effectiveExpandedPaths = react.useMemo(() => {
    if (pinnedAncestorPaths.size === 0) return expandedPaths;
    const merged = new Set(expandedPaths);
    for (const p of pinnedAncestorPaths) {
      merged.add(p);
    }
    return merged;
  }, [expandedPaths, pinnedAncestorPaths]);
  const expandToDepth = react.useCallback((depth) => {
    if (!data) return;
    const paths = /* @__PURE__ */ new Set();
    collectPathsToDepth(data, [], depth, paths);
    setExpandedPaths(paths);
  }, [data, setExpandedPaths]);
  const expandAll = react.useCallback(() => {
    if (!data) return;
    const paths = /* @__PURE__ */ new Set();
    collectAllPaths(data, [], paths);
    setExpandedPaths(paths);
  }, [data, setExpandedPaths]);
  const collapseAll = react.useCallback(() => {
    setExpandedPaths(/* @__PURE__ */ new Set());
  }, [setExpandedPaths]);
  const togglePath = react.useCallback((pathStr, isExpanded) => {
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
  const togglePin = react.useCallback((pathStr) => {
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
  const clearPins = react.useCallback(() => {
    setPinnedPaths(/* @__PURE__ */ new Set());
  }, [setPinnedPaths]);
  const handleSearchChange = react.useCallback((value) => {
    setSearchQuery(value);
    if (!value.trim()) {
      clearTimeout(searchDebounceRef.current);
      setActiveSearch("");
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
  const handleSearchSubmit = react.useCallback(() => {
    if (!searchQuery.trim()) return;
    if (activeSearch === searchQuery && matchCount > 0) {
      setCurrentMatchIndex((prev) => (prev + 1) % matchCount);
      return;
    }
    clearTimeout(searchDebounceRef.current);
    setCurrentMatchIndex(0);
    setActiveSearch(searchQuery);
  }, [searchQuery, activeSearch, matchCount]);
  const handleSearchPrev = react.useCallback(() => {
    if (matchCount <= 0) return;
    if (activeSearch !== searchQuery) {
      handleSearchSubmit();
      return;
    }
    setCurrentMatchIndex((prev) => (prev - 1 + matchCount) % matchCount);
  }, [activeSearch, searchQuery, matchCount, handleSearchSubmit]);
  const handleSearchNext = react.useCallback(() => {
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
  const handleMatchCountChange = react.useCallback((count, searchExpandedPaths) => {
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
  const toggleFilter = react.useCallback(() => {
    setFilterMode((prev) => !prev);
  }, []);
  const flatNodes = react.useMemo(() => {
    if (!data) return [];
    return chunkR44OFLPH_cjs.flattenTree(data, effectiveExpandedPaths, {
      searchQuery: activeSearch
    });
  }, [data, effectiveExpandedPaths, activeSearch]);
  const pathIndex = react.useMemo(() => chunkR44OFLPH_cjs.buildPathIndex(flatNodes), [flatNodes]);
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
      onMatchCountChange: handleMatchCountChange
    },
    // Flat nodes for custom rendering / virtualization
    flatNodes,
    pathIndex
  };
}
function JsonViewer({
  data,
  editable = false,
  searchable = true,
  diff,
  defaultExpandDepth = 1,
  height,
  virtualizeThreshold = 500,
  className = "",
  theme = "auto",
  onEdit,
  onSelect,
  onCopy,
  onNotify,
  expandedPaths: controlledExpanded,
  onExpandedPathsChange,
  pinnedPaths: controlledPinned,
  onPinnedPathsChange
}) {
  const containerRef = react.useRef(null);
  const tree = useJsonTree(data, {
    defaultExpandDepth,
    expandedPaths: controlledExpanded,
    onExpandedPathsChange,
    pinnedPaths: controlledPinned,
    onPinnedPathsChange
  });
  const diffMap = react.useMemo(() => {
    if (!diff || !diff.data || !data) return void 0;
    const side = diff.side || "left";
    const left = side === "left" ? data : diff.data;
    const right = side === "left" ? diff.data : data;
    const diffs = chunkLWZCANR6_cjs.diffJson(left, right);
    return chunkLWZCANR6_cjs.createDiffMap(diffs);
  }, [data, diff]);
  const diffSide = (diff == null ? void 0 : diff.side) || void 0;
  const handleValueEdit = react.useCallback((path, newValue) => {
    if (!editable || !onEdit) return;
    onEdit({ type: "edit", path, value: newValue });
  }, [editable, onEdit]);
  const handleDeleteNode = react.useCallback((path) => {
    if (!editable || !onEdit) return;
    onEdit({ type: "delete", path });
  }, [editable, onEdit]);
  const handleAddKey = react.useCallback((parentPath, key, value) => {
    if (!editable || !onEdit) return;
    onEdit({ type: "add", path: parentPath, key, value });
  }, [editable, onEdit]);
  const handleAddArrayItem = react.useCallback((parentPath) => {
    if (!editable || !onEdit) return;
    onEdit({ type: "add", path: parentPath, value: null });
  }, [editable, onEdit]);
  const handleBreadcrumbPath = react.useCallback((path) => {
    if (onSelect) {
      let current = data;
      for (const segment of path) {
        if (current == null) break;
        current = current[segment];
      }
      onSelect(path, current);
    }
  }, [data, onSelect]);
  const containerStyle = {};
  if (height) {
    containerStyle.height = typeof height === "number" ? `${height}px` : height;
    containerStyle.overflow = "auto";
  }
  return /* @__PURE__ */ jsxRuntime.jsx(chunkENLJ6X3T_cjs.TreeProvider, { onNotify, onCopy, children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: ["sjt", theme === "dark" ? "dark" : "", className].filter(Boolean).join(" "), style: containerStyle, ref: height ? containerRef : void 0, children: [
    searchable && data && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "sjt-mb-2", children: /* @__PURE__ */ jsxRuntime.jsx(
      SearchBar_default,
      {
        value: tree.search.query,
        onChange: tree.search.setQuery,
        onSubmit: tree.search.submit,
        onPrev: tree.search.prev,
        onNext: tree.search.next,
        isSearching: false,
        matchCount: tree.search.matches,
        currentMatch: tree.search.currentMatch,
        filterMode: tree.search.filterMode,
        onFilterToggle: tree.search.toggleFilter
      }
    ) }),
    data != null ? /* @__PURE__ */ jsxRuntime.jsx(
      "div",
      {
        ref: !height ? containerRef : void 0,
        className: "sjt-overflow-auto",
        style: !height ? { maxHeight: "100%" } : void 0,
        children: /* @__PURE__ */ jsxRuntime.jsx(
          chunkENLJ6X3T_cjs.TreeView_default,
          {
            data,
            searchQuery: tree.search.activeQuery,
            onValueEdit: editable ? handleValueEdit : void 0,
            currentMatchIndex: tree.search.currentMatch,
            onMatchCountChange: tree.search.onMatchCountChange,
            controlledExpandedPaths: tree.expandedPaths,
            onTogglePath: tree.togglePath,
            filterMode: tree.search.filterMode,
            onBreadcrumbPath: handleBreadcrumbPath,
            pinnedPaths: tree.pinnedPaths,
            onTogglePin: tree.togglePin,
            diffMap,
            side: diffSide,
            onDeleteNode: editable ? handleDeleteNode : void 0,
            onAddKey: editable ? handleAddKey : void 0,
            onAddArrayItem: editable ? handleAddArrayItem : void 0,
            containerRef,
            virtualizeThreshold
          }
        )
      }
    ) : /* @__PURE__ */ jsxRuntime.jsx("div", { className: "sjt-text-sm", style: { color: "var(--sjt-text-secondary)" }, children: "No data to display" })
  ] }) });
}
var JsonViewer_default = JsonViewer;

Object.defineProperty(exports, "TreeProvider", {
  enumerable: true,
  get: function () { return chunkENLJ6X3T_cjs.TreeProvider; }
});
Object.defineProperty(exports, "TreeView", {
  enumerable: true,
  get: function () { return chunkENLJ6X3T_cjs.TreeView_default; }
});
exports.JsonViewer = JsonViewer_default;
exports.default = JsonViewer_default;
exports.useJsonTree = useJsonTree;
