import { useState, useCallback, useEffect, useRef } from 'react';
import { buildPath, copyToClipboard } from '../../utils/pathCopier';
import { getValueType, getPreview } from '../../utils/jsonParser';
import { getDiffType, pathHasDiff } from '../../utils/differ';
import { isImageUrl } from '../../utils/imageDetector';
import { detectDateFormat } from '../../utils/dateDetector';
import { detectNestedJson } from '../../utils/nestedJsonDetector';
import { isUrl } from '../../utils/urlDetector';
import CopyButton from '../common/CopyButton';
import ImagePreview from './ImagePreview';
import DatePreview from './DatePreview';
import NestedJsonPreview from './NestedJsonPreview';
import UrlLink from './UrlLink';
import { useToast } from '../common/Toast';
import './TreeNode.css';

function TreeNode({
  keyName,
  value,
  path,
  searchQuery,
  matches,
  expandedPaths,
  controlledExpandedPaths,
  currentMatchPath,
  onValueEdit,
  onTogglePath,
  diffMap,
  side,
  isRoot = false,
  filterMode = false,
  onBreadcrumbPath,
  pinnedPaths,
  onTogglePin,
}) {
  const nodeRef = useRef(null);
  const pathStr = path.join('.');
  const isCurrentMatch = currentMatchPath === pathStr;
  const { showToast } = useToast();
  const isPinned = pinnedPaths?.has(pathStr);

  // Expanded state is derived from controlledExpandedPaths
  // Root is always expanded, others check if in expandedPaths
  const isExpanded = isRoot || (expandedPaths?.has(pathStr) ?? false);

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  // Scroll into view when this is the current match
  useEffect(() => {
    if (isCurrentMatch && nodeRef.current) {
      nodeRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [isCurrentMatch]);

  const valueType = getValueType(value);
  const isExpandable = valueType === 'object' || valueType === 'array';
  const isMatch = matches?.has(pathStr);

  // Get diff info if in compare mode
  const diffType = diffMap ? getDiffType(diffMap, path) : null;
  const hasDiffInChildren = diffMap && isExpandable ? pathHasDiff(diffMap, path) : false;

  const handleToggle = useCallback(() => {
    if (!isRoot && onTogglePath) {
      onTogglePath(pathStr, !isExpanded);
    }
    if (onBreadcrumbPath && path.length > 0) {
      onBreadcrumbPath(path);
    }
  }, [isRoot, onTogglePath, pathStr, isExpanded, onBreadcrumbPath, path]);

  const handleCopyPath = useCallback(async () => {
    const pathString = buildPath(path);
    await copyToClipboard(pathString);
    showToast('Path copied');
  }, [path, showToast]);

  const handleCopyValue = useCallback(async () => {
    const valueString = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
    await copyToClipboard(valueString);
    showToast('Value copied');
  }, [value, showToast]);

  const handleStartEdit = useCallback(() => {
    if (!onValueEdit) return;
    if (isExpandable) return;

    setEditValue(typeof value === 'string' ? value : JSON.stringify(value));
    setIsEditing(true);
  }, [value, isExpandable, onValueEdit]);

  const handleSaveEdit = useCallback(() => {
    if (!onValueEdit) return;

    let newValue = editValue;

    // Only auto-parse primitives (numbers, booleans, null), not objects/arrays
    // This preserves nested JSON strings while allowing "123" → 123 conversion
    try {
      const parsed = JSON.parse(editValue);
      const parsedType = typeof parsed;
      if (parsedType === 'number' || parsedType === 'boolean' || parsed === null) {
        newValue = parsed;
      }
      // If it parses to object/array, keep as string (preserves nested JSON strings)
    } catch {
      // Not valid JSON, keep as string
    }

    onValueEdit(path, newValue);
    setIsEditing(false);
  }, [editValue, path, onValueEdit]);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSaveEdit();
      } else if (e.key === 'Escape') {
        handleCancelEdit();
      }
    },
    [handleSaveEdit, handleCancelEdit]
  );

  const getDiffClass = () => {
    if (!diffType) return '';
    switch (diffType) {
      case 'added':
        return 'diff-added';
      case 'removed':
        return 'diff-removed';
      case 'changed':
        return 'diff-changed';
      default:
        return '';
    }
  };

  const renderValue = () => {
    if (isEditing) {
      const isLargeValue = editValue.length > 50 || editValue.includes('\n');

      if (isLargeValue) {
        const lineCount = Math.min(10, Math.max(3, editValue.split('\n').length));
        return (
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                handleCancelEdit();
              } else if (e.key === 'Enter' && e.metaKey) {
                e.preventDefault();
                handleSaveEdit();
              }
            }}
            onBlur={(e) => { e.stopPropagation(); handleSaveEdit(); }}
            autoFocus
            rows={lineCount}
            className="bg-[var(--bg-secondary)] border border-[var(--accent-color)] rounded px-2 py-1 text-sm w-full max-w-md focus:outline-none resize-y font-mono"
            placeholder="Cmd+Enter to save, Esc to cancel"
          />
        );
      }

      return (
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={(e) => { e.stopPropagation(); handleSaveEdit(); }}
          autoFocus
          className="bg-[var(--bg-secondary)] border border-[var(--accent-color)] rounded px-1 py-0.5 text-sm min-w-[100px] focus:outline-none"
          style={{ width: `${Math.max(100, Math.min(400, editValue.length * 8))}px` }}
        />
      );
    }

    const highlightText = (text) => {
      if (!searchQuery || !isMatch) return text;
      const query = searchQuery.toLowerCase();
      const lowerText = text.toLowerCase();
      const index = lowerText.indexOf(query);
      if (index === -1) return text;

      return (
        <>
          {text.substring(0, index)}
          <span className="highlight-match">{text.substring(index, index + query.length)}</span>
          {text.substring(index + query.length)}
        </>
      );
    };

    switch (valueType) {
      case 'string': {
        const stringContent = (
          <span className="json-string cursor-pointer" onDoubleClick={handleStartEdit}>
            "{highlightText(value)}"
          </span>
        );

        if (isImageUrl(value)) {
          return <ImagePreview url={value}>{stringContent}</ImagePreview>;
        }

        const dateInfo = detectDateFormat(value);
        if (dateInfo) {
          return <DatePreview dateInfo={dateInfo}>{stringContent}</DatePreview>;
        }

        const nestedJson = detectNestedJson(value);
        if (nestedJson) {
          return <NestedJsonPreview nestedJson={nestedJson}>{stringContent}</NestedJsonPreview>;
        }

        if (isUrl(value)) {
          return <UrlLink url={value}>{stringContent}</UrlLink>;
        }

        return stringContent;
      }
      case 'number':
        return (
          <span className="json-number cursor-pointer" onDoubleClick={handleStartEdit}>
            {highlightText(String(value))}
          </span>
        );
      case 'boolean':
        return (
          <span className="json-boolean cursor-pointer" onDoubleClick={handleStartEdit}>
            {highlightText(String(value))}
          </span>
        );
      case 'null':
        return (
          <span className="json-null cursor-pointer" onDoubleClick={handleStartEdit}>
            {highlightText('null')}
          </span>
        );
      case 'array':
        return (
          <span className="text-[var(--text-secondary)] cursor-pointer" onClick={handleToggle}>
            {getPreview(value)}
          </span>
        );
      case 'object':
        return (
          <span className="text-[var(--text-secondary)] cursor-pointer" onClick={handleToggle}>
            {getPreview(value)}
          </span>
        );
      default:
        return <span>{String(value)}</span>;
    }
  };

  const handleNodeClick = useCallback(() => {
    if (onBreadcrumbPath && path.length > 0) {
      onBreadcrumbPath(path);
    }
  }, [onBreadcrumbPath, path]);

  // Check if a child path (or any of its descendants) has a match
  const childHasMatch = useCallback((childPath) => {
    if (!matches) return false;
    const childPathStr = childPath.join('.');
    for (const matchPath of matches) {
      if (matchPath === childPathStr || matchPath.startsWith(childPathStr + '.')) {
        return true;
      }
    }
    return false;
  }, [matches]);

  const renderChildren = () => {
    if (!isExpandable || !isExpanded) return null;

    const entries =
      valueType === 'array'
        ? value.map((v, i) => [i, v])
        : Object.entries(value);

    if (entries.length === 0) {
      return (
        <div className="pl-4 text-[var(--text-secondary)] text-xs italic">
          {valueType === 'array' ? 'empty array' : 'empty object'}
        </div>
      );
    }

    // In filter mode, only show children that match or have matching descendants
    const filteredEntries = filterMode && searchQuery && matches?.size > 0
      ? entries.filter(([key]) => {
          const childPath = [...path, key];
          return childHasMatch(childPath);
        })
      : entries;

    if (filterMode && filteredEntries.length === 0) {
      return null;
    }

    return (
      <div className="pl-4 border-l border-[var(--border-color)]">
        {filteredEntries.map(([key, val]) => (
          <TreeNode
            key={key}
            keyName={key}
            value={val}
            path={[...path, key]}
            searchQuery={searchQuery}
            matches={matches}
            expandedPaths={expandedPaths}
            controlledExpandedPaths={controlledExpandedPaths}
            currentMatchPath={currentMatchPath}
            onValueEdit={onValueEdit}
            onTogglePath={onTogglePath}
            diffMap={diffMap}
            side={side}
            filterMode={filterMode}
            onBreadcrumbPath={onBreadcrumbPath}
            pinnedPaths={pinnedPaths}
            onTogglePin={onTogglePin}
          />
        ))}
      </div>
    );
  };

  return (
    <div className={`tree-node ${getDiffClass()}`} ref={nodeRef}>
      <div
        className={`flex items-center gap-1 py-0.5 group hover:bg-[var(--bg-secondary)] rounded px-1 -mx-1 ${
          isCurrentMatch
            ? 'search-current-match'
            : isMatch
            ? 'search-other-match'
            : ''
        } ${hasDiffInChildren && !diffType ? 'has-diff-children' : ''} ${isExpandable ? 'cursor-pointer' : ''} ${isPinned ? 'pinned-node' : ''}`}
        onClick={isExpandable ? handleToggle : handleNodeClick}
        data-pinned-path={isPinned ? pathStr : undefined}
      >
        {/* Expand/Collapse Toggle */}
        {isExpandable ? (
          <button
            onClick={handleToggle}
            className="w-4 h-4 flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex-shrink-0"
          >
            {isExpanded ? '▼' : '▶'}
          </button>
        ) : (
          <span className="w-4 flex-shrink-0" />
        )}

        {/* Key name */}
        {keyName !== null && (
          <>
            <span
              className="json-key cursor-pointer"
              onClick={isExpandable ? handleToggle : undefined}
              title={isExpandable ? 'Click to expand/collapse' : undefined}
            >
              {typeof keyName === 'number' ? `[${keyName}]` : keyName}
            </span>
            <span
              className={`text-[var(--text-secondary)] ${isExpandable ? 'cursor-pointer' : ''}`}
              onClick={isExpandable ? handleToggle : undefined}
            >:</span>
          </>
        )}

        {/* Value */}
        <span className="flex-1" onClick={isExpandable ? undefined : (e) => e.stopPropagation()}>{renderValue()}</span>

        {/* Action buttons */}
        <div className="flex-shrink-0 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {!isRoot && onTogglePin && (
            <span className={`transition-opacity ${isPinned ? '' : 'opacity-0 group-hover:opacity-100'}`}>
              <CopyButton onClick={() => onTogglePin(pathStr)} tooltip={isPinned ? 'Unpin node' : 'Pin node'} size="sm">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 translate-y-0.5">
                  <path d="M10.97 2.22a.75.75 0 0 1 1.06 0l1.75 1.75a.75.75 0 0 1-.177 1.206l-2.12 1.061a1.5 1.5 0 0 0-.653.737l-.706 1.765a.75.75 0 0 1-1.239.263L7.25 7.363 4.03 10.584a.75.75 0 0 1-1.06-1.061L6.189 6.3 4.555 4.665a.75.75 0 0 1 .263-1.238l1.765-.706a1.5 1.5 0 0 0 .737-.653l1.06-2.12a.75.75 0 0 1 1.207-.178l.382.383Z" />
                </svg>
              </CopyButton>
            </span>
          )}
          {!isRoot && (
            <span className="opacity-0 group-hover:opacity-100 transition-opacity">
              <CopyButton onClick={handleCopyPath} tooltip="Copy path" size="sm">
                📋
              </CopyButton>
            </span>
          )}
          <span className="opacity-0 group-hover:opacity-100 transition-opacity">
            <CopyButton onClick={handleCopyValue} tooltip="Copy value" size="sm">
              📄
            </CopyButton>
          </span>
        </div>
      </div>

      {/* Children */}
      {renderChildren()}
    </div>
  );
}

export default TreeNode;
