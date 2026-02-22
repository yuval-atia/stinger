import { useState, useEffect, useRef, useMemo } from 'react';
import FlatTreeNode from './FlatTreeNode.jsx';

const ROW_HEIGHT = 28;
const OVERSCAN = 10;

function VirtualizedTree({
  flatNodes,
  pathIndex,
  containerRef,
  searchQuery,
  matches,
  currentMatchPath,
  onValueEdit,
  onTogglePath,
  diffMap,
  side,
  pinnedPaths,
  onTogglePin,
  showPinHint,
  currentDiffPath,
  jsonpathMatches,
  onDeleteNode,
  onAddKey,
  onAddArrayItem,
  onBreadcrumbPath,
  scrollToPath,
}) {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(600);
  const innerRef = useRef(null);

  useEffect(() => {
    const el = containerRef?.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height);
      }
    });
    observer.observe(el);
    setContainerHeight(el.clientHeight);

    return () => observer.disconnect();
  }, [containerRef]);

  useEffect(() => {
    const el = containerRef?.current;
    if (!el) return;

    const onScroll = () => {
      setScrollTop(el.scrollTop);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [containerRef]);

  useEffect(() => {
    if (!scrollToPath || !pathIndex || !containerRef?.current) return;
    const idx = pathIndex.get(scrollToPath);
    if (idx !== undefined) {
      const targetTop = idx * ROW_HEIGHT;
      containerRef.current.scrollTo({
        top: targetTop - containerHeight / 2 + ROW_HEIGHT / 2,
        behavior: 'smooth',
      });
    }
  }, [scrollToPath, pathIndex, containerRef, containerHeight]);

  useEffect(() => {
    if (!currentMatchPath || !pathIndex || !containerRef?.current) return;
    const idx = pathIndex.get(currentMatchPath);
    if (idx !== undefined) {
      const targetTop = idx * ROW_HEIGHT;
      const currentScroll = containerRef.current.scrollTop;
      if (targetTop < currentScroll || targetTop > currentScroll + containerHeight - ROW_HEIGHT) {
        containerRef.current.scrollTo({
          top: targetTop - containerHeight / 2 + ROW_HEIGHT / 2,
          behavior: 'smooth',
        });
      }
    }
  }, [currentMatchPath, pathIndex, containerRef, containerHeight]);

  useEffect(() => {
    if (!currentDiffPath || !pathIndex || !containerRef?.current) return;
    const idx = pathIndex.get(currentDiffPath);
    if (idx !== undefined) {
      const targetTop = idx * ROW_HEIGHT;
      const currentScroll = containerRef.current.scrollTop;
      if (targetTop < currentScroll || targetTop > currentScroll + containerHeight - ROW_HEIGHT) {
        containerRef.current.scrollTo({
          top: targetTop - containerHeight / 2 + ROW_HEIGHT / 2,
          behavior: 'smooth',
        });
      }
    }
  }, [currentDiffPath, pathIndex, containerRef, containerHeight]);

  const totalHeight = flatNodes.length * ROW_HEIGHT;

  const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
  const endIndex = Math.min(
    flatNodes.length,
    Math.ceil((scrollTop + containerHeight) / ROW_HEIGHT) + OVERSCAN
  );

  const visibleNodes = useMemo(() => {
    return flatNodes.slice(startIndex, endIndex);
  }, [flatNodes, startIndex, endIndex]);

  return (
    <div
      ref={innerRef}
      style={{ height: `${totalHeight}px`, position: 'relative' }}
      className="tree-view sjt-font-mono sjt-text-sm"
    >
      {visibleNodes.map((node, i) => {
        const index = startIndex + i;
        return (
          <FlatTreeNode
            key={node.pathStr || 'root'}
            node={node}
            style={{
              position: 'absolute',
              top: `${index * ROW_HEIGHT}px`,
              left: 0,
              right: 0,
              height: `${ROW_HEIGHT}px`,
            }}
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
          />
        );
      })}
    </div>
  );
}

export default VirtualizedTree;
