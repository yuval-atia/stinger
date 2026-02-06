import { useState, useCallback } from 'react';
import Modal from '../common/Modal';
import TreeView from './TreeView';

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
    <span>
      {children}
      <span
        onClick={handleOpen}
        className="text-[var(--text-secondary)] text-xs opacity-60 cursor-pointer ml-1"
        title="Click to open parsed JSON in modal"
      >
        📦
      </span>
      <Modal isOpen={isModalOpen} onClose={handleClose} title={title}>
        <div className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border-color)]">
          <div className="text-xs text-[var(--text-secondary)] mb-3 pb-2 border-b border-[var(--border-color)]">
            This string value contains embedded JSON. Below is the parsed content:
          </div>
          <div className="font-mono text-sm">
            <TreeView
              data={nestedJson.parsed}
              searchQuery=""
              controlledExpandedPaths={expandedPaths}
              onTogglePath={handleTogglePath}
            />
          </div>
        </div>
      </Modal>
    </span>
  );
};

export default NestedJsonPreview;
