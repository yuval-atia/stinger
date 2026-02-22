import { useState, useCallback, useEffect, useRef, memo } from 'react';
import { buildPath, copyToClipboard } from '../utils/pathCopier.js';
import { getDiffType, pathHasDiff } from '../diff/differ.js';
import { charDiff } from '../diff/charDiff.js';
import { isImageUrl } from '../utils/imageDetector.js';
import { detectDateFormat } from '../utils/dateDetector.js';
import { detectNestedJson } from '../utils/nestedJsonDetector.js';
import { isUrl } from '../utils/urlDetector.js';
import CopyButton from './CopyButton.jsx';
import ImagePreview from './ImagePreview.jsx';
import DatePreview from './DatePreview.jsx';
import NestedJsonPreview from './NestedJsonPreview.jsx';
import UrlLink from './UrlLink.jsx';
import { useTreeContext } from '../TreeContext.jsx';

const ROW_HEIGHT = 28;

function FlatTreeNode({
  node,
  style,
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
}) {
  const {
    path,
    pathStr,
    keyName,
    value,
    depth,
    valueType,
    isExpandable,
    isExpanded,
    childCount,
    isRoot,
    preview,
  } = node;

  const { showNotification, onCopy } = useTreeContext();
  const isCurrentMatch = currentMatchPath === pathStr;
  const isCurrentDiffMatch = currentDiffPath === pathStr;
  const isJsonPathMatch = jsonpathMatches?.has(pathStr);
  const isPinned = pinnedPaths?.has(pathStr);
  const isMatch = matches?.has(pathStr);

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [copyMenuOpen, setCopyMenuOpen] = useState(false);
  const copyMenuRef = useRef(null);
  const [isAddingKey, setIsAddingKey] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');

  useEffect(() => {
    if (!copyMenuOpen) return;
    const handler = (e) => {
      if (copyMenuRef.current && !copyMenuRef.current.contains(e.target)) {
        setCopyMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [copyMenuOpen]);

  const diffType = diffMap ? getDiffType(diffMap, path) : null;
  const hasDiffInChildren = diffMap && isExpandable ? pathHasDiff(diffMap, path) : false;
  const diffEntry = diffMap ? diffMap.get(pathStr) : null;

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
    showNotification('Path copied');
    onCopy({ type: 'path', path, value: pathString });
  }, [path, showNotification, onCopy]);

  const handleCopyValue = useCallback(async () => {
    const valueString = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
    await copyToClipboard(valueString);
    showNotification('Value copied');
    onCopy({ type: 'value', path, value: valueString });
    setCopyMenuOpen(false);
  }, [value, path, showNotification, onCopy]);

  const handleCopyMinified = useCallback(async () => {
    const valueString = JSON.stringify(value);
    await copyToClipboard(valueString);
    showNotification('Minified JSON copied');
    onCopy({ type: 'minified', path, value: valueString });
    setCopyMenuOpen(false);
  }, [value, path, showNotification, onCopy]);

  const handleCopyKeys = useCallback(async () => {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      const keysString = JSON.stringify(Object.keys(value));
      await copyToClipboard(keysString);
      showNotification('Keys copied');
      onCopy({ type: 'keys', path, value: keysString });
    }
    setCopyMenuOpen(false);
  }, [value, path, showNotification, onCopy]);

  const handleStartEdit = useCallback(() => {
    if (!onValueEdit || isExpandable) return;
    setEditValue(typeof value === 'string' ? value : JSON.stringify(value));
    setIsEditing(true);
  }, [value, isExpandable, onValueEdit]);

  const handleSaveEdit = useCallback(() => {
    if (!onValueEdit) return;
    let newValue = editValue;
    try {
      const parsed = JSON.parse(editValue);
      const parsedType = typeof parsed;
      if (parsedType === 'number' || parsedType === 'boolean' || parsed === null) {
        newValue = parsed;
      }
    } catch { /* keep as string */ }
    onValueEdit(path, newValue);
    setIsEditing(false);
  }, [editValue, path, onValueEdit]);

  const handleCancelEdit = useCallback(() => setIsEditing(false), []);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSaveEdit(); }
    else if (e.key === 'Escape') { handleCancelEdit(); }
  }, [handleSaveEdit, handleCancelEdit]);

  const handleNodeClick = useCallback(() => {
    if (onBreadcrumbPath && path.length > 0) onBreadcrumbPath(path);
  }, [onBreadcrumbPath, path]);

  const getDiffClass = () => {
    if (!diffType) return '';
    switch (diffType) {
      case 'added': return 'diff-added';
      case 'removed': return 'diff-removed';
      case 'changed': return 'diff-changed';
      case 'moved': return 'diff-moved';
      default: return '';
    }
  };

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

  const renderValue = () => {
    if (isEditing) {
      return (
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => handleSaveEdit()}
          autoFocus
          className="sjt-rounded sjt-text-sm"
          style={{
            backgroundColor: 'var(--sjt-bg-secondary)',
            border: '1px solid var(--sjt-accent-color)',
            padding: '2px 4px',
            minWidth: '100px',
            width: `${Math.max(100, Math.min(400, editValue.length * 8))}px`,
            outline: 'none',
          }}
        />
      );
    }

    switch (valueType) {
      case 'string': {
        let stringContent;
        if (diffType === 'changed' && diffEntry && typeof diffEntry.leftValue === 'string' && typeof diffEntry.rightValue === 'string') {
          const segments = charDiff(diffEntry.leftValue, diffEntry.rightValue);
          if (segments && side) {
            stringContent = (
              <span className="json-string sjt-cursor-pointer" onDoubleClick={handleStartEdit}>
                "{segments.map((seg, idx) => {
                  if (seg.type === 'equal') return <span key={idx}>{seg.value}</span>;
                  if (side === 'left' && seg.type === 'remove') return <span key={idx} className="char-diff-remove">{seg.value}</span>;
                  if (side === 'right' && seg.type === 'add') return <span key={idx} className="char-diff-add">{seg.value}</span>;
                  return null;
                })}"
              </span>
            );
          } else {
            stringContent = <span className="json-string sjt-cursor-pointer" onDoubleClick={handleStartEdit}>"{highlightText(value)}"</span>;
          }
        } else {
          stringContent = <span className="json-string sjt-cursor-pointer" onDoubleClick={handleStartEdit}>"{highlightText(value)}"</span>;
        }

        if (isImageUrl(value)) return <ImagePreview url={value}>{stringContent}</ImagePreview>;
        const dateInfo = detectDateFormat(value);
        if (dateInfo) return <DatePreview dateInfo={dateInfo}>{stringContent}</DatePreview>;
        const nestedJson = detectNestedJson(value);
        if (nestedJson) return <NestedJsonPreview nestedJson={nestedJson}>{stringContent}</NestedJsonPreview>;
        if (isUrl(value)) return <UrlLink url={value}>{stringContent}</UrlLink>;
        return stringContent;
      }
      case 'number':
        return <span className="json-number sjt-cursor-pointer" onDoubleClick={handleStartEdit}>{highlightText(String(value))}</span>;
      case 'boolean':
        return <span className="json-boolean sjt-cursor-pointer" onDoubleClick={handleStartEdit}>{highlightText(String(value))}</span>;
      case 'null':
        return <span className="json-null sjt-cursor-pointer" onDoubleClick={handleStartEdit}>{highlightText('null')}</span>;
      case 'array':
      case 'object':
        return <span className="sjt-cursor-pointer" style={{ color: 'var(--sjt-text-secondary)' }} onClick={handleToggle}>{preview}</span>;
      default:
        return <span>{String(value)}</span>;
    }
  };

  const showEmptyHint = isExpandable && isExpanded && childCount === 0;

  return (
    <>
      <div
        className={`tree-node ${getDiffClass()}`}
        style={style}
      >
        <div
          className={`sjt-flex sjt-items-center sjt-gap-1 sjt-py-0.5 sjt-group sjt-rounded sjt-px-1 ${
            isCurrentMatch ? 'search-current-match'
            : isMatch ? 'search-other-match' : ''
          } ${isCurrentDiffMatch ? 'diff-current-match' : ''} ${isJsonPathMatch ? 'jsonpath-match' : ''} ${hasDiffInChildren && !diffType ? 'has-diff-children' : ''} ${isExpandable ? 'sjt-cursor-pointer' : ''} ${isPinned ? 'pinned-node' : ''}`}
          onClick={isExpandable ? handleToggle : handleNodeClick}
          data-pinned-path={isPinned ? pathStr : undefined}
          style={{ paddingLeft: `${depth * 16 + 4}px`, height: `${ROW_HEIGHT}px` }}
        >
          {/* Toggle */}
          {isExpandable ? (
            <button onClick={handleToggle} className="sjt-w-4 sjt-h-4 sjt-flex sjt-items-center sjt-justify-center sjt-flex-shrink-0" style={{ color: 'var(--sjt-text-secondary)' }}>
              {isExpanded ? '▼' : '▶'}
            </button>
          ) : (
            <span className="sjt-w-4 sjt-flex-shrink-0" />
          )}

          {/* Key */}
          {keyName !== null && (
            <>
              <span className="json-key sjt-cursor-pointer" onClick={isExpandable ? handleToggle : undefined}>
                {typeof keyName === 'number' ? `[${keyName}]` : keyName}
              </span>
              <span className={isExpandable ? 'sjt-cursor-pointer' : ''} style={{ color: 'var(--sjt-text-secondary)' }} onClick={isExpandable ? handleToggle : undefined}>:</span>
            </>
          )}

          {/* Move indicator */}
          {diffType === 'moved' && diffEntry && (
            <span className="sjt-text-[10px] sjt-px-1 sjt-py-0.5 sjt-rounded sjt-whitespace-nowrap" style={{ backgroundColor: 'var(--sjt-diff-move)', color: 'var(--sjt-diff-move-text)' }}>
              {diffEntry.side === 'left' ? `moved to [${diffEntry.toIndex}]` : `moved from [${diffEntry.fromIndex}]`}
            </span>
          )}

          {/* Value */}
          <span className="sjt-flex-1 sjt-truncate" onClick={isExpandable ? undefined : (e) => e.stopPropagation()}>
            {renderValue()}
            {showEmptyHint && (
              <span className="sjt-text-xs sjt-italic sjt-ml-1" style={{ color: 'var(--sjt-text-secondary)' }}>
                {valueType === 'array' ? 'empty array' : 'empty object'}
              </span>
            )}
          </span>

          {/* Actions */}
          <div className="sjt-flex-shrink-0 sjt-flex sjt-items-center sjt-gap-1" onClick={(e) => e.stopPropagation()}>
            {!isRoot && onTogglePin && (
              <span className={`sjt-transition-opacity sjt-relative ${isPinned ? '' : showPinHint && path.length === 1 && isExpandable ? 'sjt-opacity-40' : 'sjt-opacity-0 group-hover:sjt-opacity-100'}`}>
                <CopyButton onClick={() => onTogglePin(pathStr)} tooltip={isPinned ? 'Unpin node' : 'Pin node'} size="sm">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="sjt-w-4 sjt-h-4 sjt-translate-y-0.5">
                    <path d="M10.97 2.22a.75.75 0 0 1 1.06 0l1.75 1.75a.75.75 0 0 1-.177 1.206l-2.12 1.061a1.5 1.5 0 0 0-.653.737l-.706 1.765a.75.75 0 0 1-1.239.263L7.25 7.363 4.03 10.584a.75.75 0 0 1-1.06-1.061L6.189 6.3 4.555 4.665a.75.75 0 0 1 .263-1.238l1.765-.706a1.5 1.5 0 0 0 .737-.653l1.06-2.12a.75.75 0 0 1 1.207-.178l.382.383Z" />
                  </svg>
                </CopyButton>
                {showPinHint && path.length === 1 && isExpandable && !isPinned && (
                  <span className="sjt-absolute -sjt-top-0.5 -sjt-right-0.5 sjt-w-1.5 sjt-h-1.5 sjt-rounded-full sjt-animate-pulse" style={{ backgroundColor: 'var(--sjt-accent-color)' }} />
                )}
              </span>
            )}
            {!isRoot && (
              <span className="sjt-opacity-0 group-hover:sjt-opacity-100 sjt-transition-opacity">
                <CopyButton onClick={handleCopyPath} tooltip="Copy path" size="sm">📋</CopyButton>
              </span>
            )}
            {isExpandable ? (
              <span className="sjt-opacity-0 group-hover:sjt-opacity-100 sjt-transition-opacity sjt-relative" ref={copyMenuRef}>
                <CopyButton onClick={() => setCopyMenuOpen((p) => !p)} tooltip={valueType === 'object' ? `Copy object (${childCount} keys)` : `Copy array (${childCount} items)`} size="sm">📄</CopyButton>
                {copyMenuOpen && (
                  <div className="sjt-absolute sjt-top-full sjt-right-0 sjt-mt-1 sjt-z-50 sjt-rounded-lg sjt-shadow-lg sjt-py-1" style={{ width: '8rem', backgroundColor: 'var(--sjt-bg-primary)', border: '1px solid var(--sjt-border-color)' }}>
                    <button onClick={handleCopyValue} className="sjt-w-full sjt-text-left sjt-px-3 sjt-py-1.5 sjt-text-xs sjt-transition-colors" style={{ color: 'var(--sjt-text-primary)' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--sjt-bg-secondary)'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = ''}>Copy JSON</button>
                    <button onClick={handleCopyMinified} className="sjt-w-full sjt-text-left sjt-px-3 sjt-py-1.5 sjt-text-xs sjt-transition-colors" style={{ color: 'var(--sjt-text-primary)' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--sjt-bg-secondary)'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = ''}>Copy minified</button>
                    {valueType === 'object' && (
                      <button onClick={handleCopyKeys} className="sjt-w-full sjt-text-left sjt-px-3 sjt-py-1.5 sjt-text-xs sjt-transition-colors" style={{ color: 'var(--sjt-text-primary)' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--sjt-bg-secondary)'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = ''}>Copy keys</button>
                    )}
                  </div>
                )}
              </span>
            ) : (
              <span className="sjt-opacity-0 group-hover:sjt-opacity-100 sjt-transition-opacity">
                <CopyButton onClick={handleCopyValue} tooltip="Copy value" size="sm">📄</CopyButton>
              </span>
            )}
            {isExpandable && onDeleteNode && (
              <span className="sjt-opacity-0 group-hover:sjt-opacity-100 sjt-transition-opacity">
                <CopyButton
                  onClick={() => {
                    if (valueType === 'array') onAddArrayItem(path);
                    else { setIsAddingKey(true); setNewKeyName(''); setNewKeyValue(''); }
                  }}
                  tooltip={valueType === 'array' ? 'Add item' : 'Add key'}
                  size="sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="sjt-w-3.5 sjt-h-3.5">
                    <path d="M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z" />
                  </svg>
                </CopyButton>
              </span>
            )}
            {!isRoot && onDeleteNode && (
              <span className="sjt-opacity-0 group-hover:sjt-opacity-100 sjt-transition-opacity">
                <CopyButton onClick={() => onDeleteNode(path)} tooltip="Delete node" size="sm">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="sjt-w-3.5 sjt-h-3.5" style={{ color: 'var(--sjt-error-color)' }}>
                    <path fillRule="evenodd" d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5ZM6.05 6a.75.75 0 0 1 .787.713l.275 5.5a.75.75 0 0 1-1.498.075l-.275-5.5A.75.75 0 0 1 6.05 6Zm3.9 0a.75.75 0 0 1 .712.787l-.275 5.5a.75.75 0 0 1-1.498-.075l.275-5.5a.75.75 0 0 1 .786-.711Z" clipRule="evenodd" />
                  </svg>
                </CopyButton>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Inline add-key form */}
      {isAddingKey && isExpanded && valueType === 'object' && (
        <div
          style={{ ...style, top: parseFloat(style.top) + ROW_HEIGHT, height: ROW_HEIGHT }}
          className="sjt-flex sjt-items-center sjt-gap-1"
        >
          <div style={{ paddingLeft: `${(depth + 1) * 16 + 4}px` }} className="sjt-flex sjt-items-center sjt-gap-1">
            <input
              type="text"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="key"
              autoFocus
              className="sjt-rounded sjt-font-mono"
              style={{ width: '6rem', padding: '2px 6px', fontSize: '0.75rem', backgroundColor: 'var(--sjt-bg-secondary)', border: '1px solid var(--sjt-accent-color)', color: 'var(--sjt-text-primary)', outline: 'none' }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newKeyName.trim()) {
                  let val = newKeyValue.trim();
                  try { val = JSON.parse(val); } catch { /* keep as string */ }
                  onAddKey(path, newKeyName.trim(), val || null);
                  setIsAddingKey(false);
                } else if (e.key === 'Escape') setIsAddingKey(false);
              }}
            />
            <span className="sjt-text-xs" style={{ color: 'var(--sjt-text-secondary)' }}>:</span>
            <input
              type="text"
              value={newKeyValue}
              onChange={(e) => setNewKeyValue(e.target.value)}
              placeholder="value"
              className="sjt-rounded sjt-font-mono"
              style={{ width: '6rem', padding: '2px 6px', fontSize: '0.75rem', backgroundColor: 'var(--sjt-bg-secondary)', border: '1px solid var(--sjt-border-color)', color: 'var(--sjt-text-primary)', outline: 'none' }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newKeyName.trim()) {
                  let val = newKeyValue.trim();
                  try { val = JSON.parse(val); } catch { /* keep as string */ }
                  onAddKey(path, newKeyName.trim(), val || null);
                  setIsAddingKey(false);
                } else if (e.key === 'Escape') setIsAddingKey(false);
              }}
            />
            <button onClick={() => { if (newKeyName.trim()) { let val = newKeyValue.trim(); try { val = JSON.parse(val); } catch {} onAddKey(path, newKeyName.trim(), val || null); } setIsAddingKey(false); }} className="sjt-text-xs sjt-rounded sjt-text-white" style={{ padding: '2px 6px', backgroundColor: 'var(--sjt-accent-color)' }}>Add</button>
            <button onClick={() => setIsAddingKey(false)} className="sjt-text-xs sjt-rounded" style={{ padding: '2px 6px', backgroundColor: 'var(--sjt-bg-secondary)', color: 'var(--sjt-text-secondary)' }}>Cancel</button>
          </div>
        </div>
      )}
    </>
  );
}

export default memo(FlatTreeNode, (prev, next) => {
  if (prev.node !== next.node) return false;
  if (prev.style.top !== next.style.top) return false;
  if (prev.searchQuery !== next.searchQuery) return false;
  if (prev.currentMatchPath !== next.currentMatchPath) return false;
  if (prev.currentDiffPath !== next.currentDiffPath) return false;
  const pathStr = prev.node.pathStr;
  if (prev.matches?.has(pathStr) !== next.matches?.has(pathStr)) return false;
  if (prev.pinnedPaths?.has(pathStr) !== next.pinnedPaths?.has(pathStr)) return false;
  if (prev.jsonpathMatches?.has(pathStr) !== next.jsonpathMatches?.has(pathStr)) return false;
  if (prev.showPinHint !== next.showPinHint) return false;
  if (prev.side !== next.side) return false;
  if (prev.diffMap !== next.diffMap) return false;
  if (prev.onDeleteNode !== next.onDeleteNode) return false;
  return true;
});
