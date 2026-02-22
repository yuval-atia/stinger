import { useState, useCallback, lazy, Suspense } from 'react';
import Modal from './Modal.jsx';

// Lazy import to break circular dependency (TreeView -> TreeNode -> NestedJsonPreview -> TreeView)
const LazyTreeView = lazy(() => import('./TreeView.jsx'));

const NestedJsonPreview = ({ nestedJson, children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedPaths, setExpandedPaths] = useState(new Set());

  const handleOpen = useCallback(() => {
    setIsModalOpen(true);
    setExpandedPaths(new Set());
  }, []);

  const handleClose = useCallback(() => {
    setIsModalOpen(false);
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

  const title = nestedJson.isArray
    ? `Nested JSON Array (${nestedJson.parsed.length} items)`
    : `Nested JSON Object (${Object.keys(nestedJson.parsed).length} keys)`;

  return (
    <span className="sjt-inline-flex sjt-items-center sjt-gap-1">
      <span className="sjt-truncate" style={{ maxWidth: '300px' }}>{children}</span>
      <span
        onClick={handleOpen}
        className="sjt-text-xs sjt-cursor-pointer sjt-flex-shrink-0"
        style={{ color: 'var(--sjt-text-secondary)', opacity: 0.6 }}
        title="Click to open parsed JSON in modal"
      >
        📦
      </span>
      <Modal isOpen={isModalOpen} onClose={handleClose} title={title}>
        <div
          className="sjt-rounded-lg sjt-p-4"
          style={{
            backgroundColor: 'var(--sjt-bg-secondary)',
            border: '1px solid var(--sjt-border-color)',
          }}
        >
          <div
            className="sjt-text-xs sjt-mb-3 sjt-pb-2"
            style={{
              color: 'var(--sjt-text-secondary)',
              borderBottom: '1px solid var(--sjt-border-color)',
            }}
          >
            This string value contains embedded JSON. Below is the parsed content:
          </div>
          <div className="sjt-font-mono sjt-text-sm">
            <Suspense fallback={<div style={{ color: 'var(--sjt-text-secondary)' }}>Loading...</div>}>
              <LazyTreeView
                data={nestedJson.parsed}
                searchQuery=""
                controlledExpandedPaths={expandedPaths}
                onTogglePath={handleTogglePath}
              />
            </Suspense>
          </div>
        </div>
      </Modal>
    </span>
  );
};

export default NestedJsonPreview;
