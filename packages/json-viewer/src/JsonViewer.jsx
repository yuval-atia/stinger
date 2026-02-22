import { useRef, useMemo, useCallback } from 'react';
import { TreeProvider } from './TreeContext.jsx';
import TreeView from './components/TreeView.jsx';
import SearchBar from './components/SearchBar.jsx';
import { useJsonTree } from './hooks/useJsonTree.js';
import { diffJson, createDiffMap } from './diff/differ.js';
import { setValueAtPath, deleteAtPath, addKeyToObject, appendToArray } from './utils/pathCopier.js';

function JsonViewer({
  data,
  editable = false,
  searchable = true,
  diff,
  defaultExpandDepth = 1,
  height,
  virtualizeThreshold = 500,
  className = '',
  theme = 'auto',
  onEdit,
  onSelect,
  onCopy,
  onNotify,
  expandedPaths: controlledExpanded,
  onExpandedPathsChange,
  pinnedPaths: controlledPinned,
  onPinnedPathsChange,
}) {
  const containerRef = useRef(null);

  const tree = useJsonTree(data, {
    defaultExpandDepth,
    expandedPaths: controlledExpanded,
    onExpandedPathsChange,
    pinnedPaths: controlledPinned,
    onPinnedPathsChange,
  });

  // Compute diff map if diff prop is provided
  const diffMap = useMemo(() => {
    if (!diff || !diff.data || !data) return undefined;
    const side = diff.side || 'left';
    const left = side === 'left' ? data : diff.data;
    const right = side === 'left' ? diff.data : data;
    const diffs = diffJson(left, right);
    return createDiffMap(diffs);
  }, [data, diff]);

  const diffSide = diff?.side || undefined;

  // Edit handlers
  const handleValueEdit = useCallback((path, newValue) => {
    if (!editable || !onEdit) return;
    onEdit({ type: 'edit', path, value: newValue });
  }, [editable, onEdit]);

  const handleDeleteNode = useCallback((path) => {
    if (!editable || !onEdit) return;
    onEdit({ type: 'delete', path });
  }, [editable, onEdit]);

  const handleAddKey = useCallback((parentPath, key, value) => {
    if (!editable || !onEdit) return;
    onEdit({ type: 'add', path: parentPath, key, value });
  }, [editable, onEdit]);

  const handleAddArrayItem = useCallback((parentPath) => {
    if (!editable || !onEdit) return;
    onEdit({ type: 'add', path: parentPath, value: null });
  }, [editable, onEdit]);

  const handleBreadcrumbPath = useCallback((path) => {
    if (onSelect) {
      // Get value at path
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
    containerStyle.height = typeof height === 'number' ? `${height}px` : height;
    containerStyle.overflow = 'auto';
  }

  return (
    <TreeProvider onNotify={onNotify} onCopy={onCopy}>
      <div className={['sjt', theme === 'dark' ? 'dark' : '', className].filter(Boolean).join(' ')} style={containerStyle} ref={height ? containerRef : undefined}>
        {/* Search bar */}
        {searchable && data && (
          <div className="sjt-mb-2">
            <SearchBar
              value={tree.search.query}
              onChange={tree.search.setQuery}
              onSubmit={tree.search.submit}
              onPrev={tree.search.prev}
              onNext={tree.search.next}
              isSearching={false}
              matchCount={tree.search.matches}
              currentMatch={tree.search.currentMatch}
              filterMode={tree.search.filterMode}
              onFilterToggle={tree.search.toggleFilter}
            />
          </div>
        )}

        {/* Tree content */}
        {data != null ? (
          <div
            ref={!height ? containerRef : undefined}
            className="sjt-overflow-auto"
            style={!height ? { maxHeight: '100%' } : undefined}
          >
            <TreeView
              data={data}
              searchQuery={tree.search.activeQuery}
              onValueEdit={editable ? handleValueEdit : undefined}
              currentMatchIndex={tree.search.currentMatch}
              onMatchCountChange={tree.search.onMatchCountChange}
              controlledExpandedPaths={tree.expandedPaths}
              onTogglePath={tree.togglePath}
              filterMode={tree.search.filterMode}
              onBreadcrumbPath={handleBreadcrumbPath}
              pinnedPaths={tree.pinnedPaths}
              onTogglePin={tree.togglePin}
              diffMap={diffMap}
              side={diffSide}
              onDeleteNode={editable ? handleDeleteNode : undefined}
              onAddKey={editable ? handleAddKey : undefined}
              onAddArrayItem={editable ? handleAddArrayItem : undefined}
              containerRef={containerRef}
              virtualizeThreshold={virtualizeThreshold}
            />
          </div>
        ) : (
          <div className="sjt-text-sm" style={{ color: 'var(--sjt-text-secondary)' }}>
            No data to display
          </div>
        )}
      </div>
    </TreeProvider>
  );
}

export default JsonViewer;
