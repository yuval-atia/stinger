import { useMemo, useEffect } from 'react';
import TreeNode from './TreeNode';

function TreeView({ data, searchQuery, onValueEdit, diffMap, side, currentMatchIndex, onMatchCountChange, controlledExpandedPaths, onTogglePath }) {
  const { matches, expandedPaths, matchList } = useMemo(() => {
    if (!searchQuery.trim()) {
      return { matches: new Set(), expandedPaths: new Set(), matchList: [] };
    }

    const matchPaths = new Set();
    const pathsToExpand = new Set();
    const orderedMatches = [];

    searchInValue(data, [], searchQuery.toLowerCase(), matchPaths, pathsToExpand, orderedMatches);

    return { matches: matchPaths, expandedPaths: pathsToExpand, matchList: orderedMatches };
  }, [data, searchQuery]);

  // Report match count and expanded paths to parent
  useEffect(() => {
    onMatchCountChange?.(matchList.length, expandedPaths);
  }, [matchList.length, expandedPaths, onMatchCountChange]);

  // Merge controlled paths with search paths
  const mergedExpandedPaths = useMemo(() => {
    const merged = new Set(expandedPaths);
    if (controlledExpandedPaths) {
      for (const path of controlledExpandedPaths) {
        merged.add(path);
      }
    }
    return merged;
  }, [expandedPaths, controlledExpandedPaths]);

  // Get current match path for highlighting
  const currentMatchPath = matchList[currentMatchIndex] || null;

  return (
    <div className="tree-view font-mono text-sm">
      <TreeNode
        keyName={null}
        value={data}
        path={[]}
        searchQuery={searchQuery}
        matches={matches}
        expandedPaths={mergedExpandedPaths}
        controlledExpandedPaths={controlledExpandedPaths}
        currentMatchPath={currentMatchPath}
        onValueEdit={onValueEdit}
        onTogglePath={onTogglePath}
        diffMap={diffMap}
        side={side}
        isRoot
      />
    </div>
  );
}

function searchInValue(value, path, query, matchPaths, pathsToExpand, orderedMatches) {
  const pathStr = path.join('.');

  if (value === null) {
    if ('null'.includes(query)) {
      matchPaths.add(pathStr);
      orderedMatches.push(pathStr);
      addParentPaths(path, pathsToExpand);
    }
    return;
  }

  if (typeof value === 'string') {
    if (value.toLowerCase().includes(query)) {
      matchPaths.add(pathStr);
      orderedMatches.push(pathStr);
      addParentPaths(path, pathsToExpand);
    }
    return;
  }

  if (typeof value === 'number') {
    if (String(value).includes(query)) {
      matchPaths.add(pathStr);
      orderedMatches.push(pathStr);
      addParentPaths(path, pathsToExpand);
    }
    return;
  }

  if (typeof value === 'boolean') {
    if (String(value).includes(query)) {
      matchPaths.add(pathStr);
      orderedMatches.push(pathStr);
      addParentPaths(path, pathsToExpand);
    }
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      searchInValue(item, [...path, index], query, matchPaths, pathsToExpand, orderedMatches);
    });
    return;
  }

  if (typeof value === 'object') {
    Object.entries(value).forEach(([key, val]) => {
      const keyPath = [...path, key];
      // Check if key matches
      if (key.toLowerCase().includes(query)) {
        const keyPathStr = keyPath.join('.');
        matchPaths.add(keyPathStr);
        orderedMatches.push(keyPathStr);
        addParentPaths(keyPath, pathsToExpand);
      }
      searchInValue(val, keyPath, query, matchPaths, pathsToExpand, orderedMatches);
    });
  }
}

function addParentPaths(path, pathsToExpand) {
  // Add all parent paths so they get expanded
  for (let i = 0; i <= path.length; i++) {
    const parentPath = path.slice(0, i).join('.');
    pathsToExpand.add(parentPath);
  }
}

export default TreeView;
