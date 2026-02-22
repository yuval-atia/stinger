import { useMemo, useEffect } from 'react';
import TreeNode from './TreeNode.jsx';
import VirtualizedTree from './VirtualizedTree.jsx';
import { flattenTree, buildPathIndex } from '../utils/flattenTree.js';

const VIRTUALIZE_THRESHOLD = 500;

function TreeView({ data, searchQuery, onValueEdit, diffMap, side, currentMatchIndex, onMatchCountChange, controlledExpandedPaths, onTogglePath, filterMode, onBreadcrumbPath, pinnedPaths, onTogglePin, showPinHint, currentDiffPath, jsonpathMatches, onDeleteNode, onAddKey, onAddArrayItem, containerRef, scrollToPath, virtualizeThreshold }) {
  const threshold = virtualizeThreshold ?? VIRTUALIZE_THRESHOLD;

  const { matches, expandedPaths, matchList } = useMemo(() => {
    if (!searchQuery || !searchQuery.trim()) {
      return { matches: new Set(), expandedPaths: new Set(), matchList: [] };
    }

    const matchPaths = new Set();
    const pathsToExpand = new Set();
    const orderedMatches = [];

    searchInValue(data, [], searchQuery.toLowerCase(), matchPaths, pathsToExpand, orderedMatches);

    return { matches: matchPaths, expandedPaths: pathsToExpand, matchList: orderedMatches };
  }, [data, searchQuery]);

  useEffect(() => {
    onMatchCountChange?.(matchList.length, expandedPaths);
  }, [matchList.length, expandedPaths, onMatchCountChange]);

  const mergedExpandedPaths = useMemo(() => {
    const merged = new Set(expandedPaths);
    if (controlledExpandedPaths) {
      for (const path of controlledExpandedPaths) {
        merged.add(path);
      }
    }
    return merged;
  }, [expandedPaths, controlledExpandedPaths]);

  const currentMatchPath = matchList[currentMatchIndex] || null;

  const flatNodes = useMemo(() => {
    return flattenTree(data, mergedExpandedPaths, {
      matches,
      filterMode,
      searchQuery,
      diffMap,
      side,
    });
  }, [data, mergedExpandedPaths, matches, filterMode, searchQuery, diffMap, side]);

  const pathIndex = useMemo(() => buildPathIndex(flatNodes), [flatNodes]);

  const useVirtual = flatNodes.length > threshold;

  if (useVirtual && containerRef) {
    return (
      <VirtualizedTree
        flatNodes={flatNodes}
        pathIndex={pathIndex}
        containerRef={containerRef}
        searchQuery={searchQuery}
        matches={matches}
        currentMatchPath={currentMatchPath}
        onValueEdit={onValueEdit}
        onTogglePath={onTogglePath}
        diffMap={diffMap}
        side={side}
        pinnedPaths={pinnedPaths}
        onTogglePin={onTogglePin}
        showPinHint={showPinHint}
        currentDiffPath={currentDiffPath}
        jsonpathMatches={jsonpathMatches}
        onDeleteNode={onDeleteNode}
        onAddKey={onAddKey}
        onAddArrayItem={onAddArrayItem}
        onBreadcrumbPath={onBreadcrumbPath}
        scrollToPath={scrollToPath}
      />
    );
  }

  return (
    <div className="tree-view sjt-font-mono sjt-text-sm">
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
        filterMode={filterMode}
        onBreadcrumbPath={onBreadcrumbPath}
        pinnedPaths={pinnedPaths}
        onTogglePin={onTogglePin}
        showPinHint={showPinHint}
        currentDiffPath={currentDiffPath}
        jsonpathMatches={jsonpathMatches}
        onDeleteNode={onDeleteNode}
        onAddKey={onAddKey}
        onAddArrayItem={onAddArrayItem}
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
  for (let i = 0; i <= path.length; i++) {
    const parentPath = path.slice(0, i).join('.');
    pathsToExpand.add(parentPath);
  }
}

export default TreeView;
