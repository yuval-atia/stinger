import { useState, useCallback, useEffect, useRef, memo } from 'react';
import { buildPath, copyToClipboard } from '../../utils/pathCopier';
import { getDiffType, pathHasDiff } from '../../utils/differ';
import { charDiff } from '../../utils/charDiff';
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

  const { showToast } = useToast();
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

  // Close copy menu on outside click
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

  // Get diff info
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
    await copyToClipboard(buildPath(path));
    showToast('Path copied');
  }, [path, showToast]);

  const handleCopyValue = useCallback(async () => {
    const valueString = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
    await copyToClipboard(valueString);
    showToast('Value copied');
    setCopyMenuOpen(false);
  }, [value, showToast]);

  const handleCopyMinified = useCallback(async () => {
    await copyToClipboard(JSON.stringify(value));
    showToast('Minified JSON copied');
    setCopyMenuOpen(false);
  }, [value, showToast]);

  const handleCopyKeys = useCallback(async () => {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      await copyToClipboard(JSON.stringify(Object.keys(value)));
      showToast('Keys copied');
    }
    setCopyMenuOpen(false);
  }, [value, showToast]);

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
          className="bg-[var(--bg-secondary)] border border-[var(--accent-color)] rounded px-1 py-0.5 text-sm min-w-[100px] focus:outline-none"
          style={{ width: `${Math.max(100, Math.min(400, editValue.length * 8))}px` }}
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
              <span className="json-string cursor-pointer" onDoubleClick={handleStartEdit}>
                "{segments.map((seg, idx) => {
                  if (seg.type === 'equal') return <span key={idx}>{seg.value}</span>;
                  if (side === 'left' && seg.type === 'remove') return <span key={idx} className="char-diff-remove">{seg.value}</span>;
                  if (side === 'right' && seg.type === 'add') return <span key={idx} className="char-diff-add">{seg.value}</span>;
                  return null;
                })}"
              </span>
            );
          } else {
            stringContent = <span className="json-string cursor-pointer" onDoubleClick={handleStartEdit}>"{highlightText(value)}"</span>;
          }
        } else {
          stringContent = <span className="json-string cursor-pointer" onDoubleClick={handleStartEdit}>"{highlightText(value)}"</span>;
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
        return <span className="json-number cursor-pointer" onDoubleClick={handleStartEdit}>{highlightText(String(value))}</span>;
      case 'boolean':
        return <span className="json-boolean cursor-pointer" onDoubleClick={handleStartEdit}>{highlightText(String(value))}</span>;
      case 'null':
        return <span className="json-null cursor-pointer" onDoubleClick={handleStartEdit}>{highlightText('null')}</span>;
      case 'array':
      case 'object':
        return <span className="text-[var(--text-secondary)] cursor-pointer" onClick={handleToggle}>{preview}</span>;
      default:
        return <span>{String(value)}</span>;
    }
  };

  // Empty container indicator (rendered as a separate node in the flat list isn't needed;
  // we handle it inline after the toggle)
  const showEmptyHint = isExpandable && isExpanded && childCount === 0;

  return (
    <>
      <div
        className={`tree-node ${getDiffClass()}`}
        style={style}
      >
        <div
          className={`flex items-center gap-1 py-0.5 group hover:bg-[var(--bg-secondary)] rounded px-1 ${
            isCurrentMatch ? 'search-current-match'
            : isMatch ? 'search-other-match' : ''
          } ${isCurrentDiffMatch ? 'diff-current-match' : ''} ${isJsonPathMatch ? 'jsonpath-match' : ''} ${hasDiffInChildren && !diffType ? 'has-diff-children' : ''} ${isExpandable ? 'cursor-pointer' : ''} ${isPinned ? 'pinned-node' : ''}`}
          onClick={isExpandable ? handleToggle : handleNodeClick}
          data-pinned-path={isPinned ? pathStr : undefined}
          style={{ paddingLeft: `${depth * 16 + 4}px`, height: `${ROW_HEIGHT}px` }}
        >
          {/* Toggle */}
          {isExpandable ? (
            <button onClick={handleToggle} className="w-4 h-4 flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex-shrink-0">
              {isExpanded ? '▼' : '▶'}
            </button>
          ) : (
            <span className="w-4 flex-shrink-0" />
          )}

          {/* Key */}
          {keyName !== null && (
            <>
              <span className="json-key cursor-pointer" onClick={isExpandable ? handleToggle : undefined}>
                {typeof keyName === 'number' ? `[${keyName}]` : keyName}
              </span>
              <span className={`text-[var(--text-secondary)] ${isExpandable ? 'cursor-pointer' : ''}`} onClick={isExpandable ? handleToggle : undefined}>:</span>
            </>
          )}

          {/* Move indicator */}
          {diffType === 'moved' && diffEntry && (
            <span className="text-[10px] px-1 py-0.5 rounded bg-[var(--diff-move)] text-[var(--diff-move-text)] whitespace-nowrap">
              {diffEntry.side === 'left' ? `moved to [${diffEntry.toIndex}]` : `moved from [${diffEntry.fromIndex}]`}
            </span>
          )}

          {/* Value */}
          <span className="flex-1 truncate" onClick={isExpandable ? undefined : (e) => e.stopPropagation()}>
            {renderValue()}
            {showEmptyHint && (
              <span className="text-[var(--text-secondary)] text-xs italic ml-1">
                {valueType === 'array' ? 'empty array' : 'empty object'}
              </span>
            )}
          </span>

          {/* Actions */}
          <div className="flex-shrink-0 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            {!isRoot && onTogglePin && (
              <span className={`transition-opacity relative ${isPinned ? '' : showPinHint && path.length === 1 && isExpandable ? 'opacity-40' : 'opacity-0 group-hover:opacity-100'}`}>
                <CopyButton onClick={() => onTogglePin(pathStr)} tooltip={isPinned ? 'Unpin node' : 'Pin node'} size="sm">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 translate-y-0.5">
                    <path d="M10.97 2.22a.75.75 0 0 1 1.06 0l1.75 1.75a.75.75 0 0 1-.177 1.206l-2.12 1.061a1.5 1.5 0 0 0-.653.737l-.706 1.765a.75.75 0 0 1-1.239.263L7.25 7.363 4.03 10.584a.75.75 0 0 1-1.06-1.061L6.189 6.3 4.555 4.665a.75.75 0 0 1 .263-1.238l1.765-.706a1.5 1.5 0 0 0 .737-.653l1.06-2.12a.75.75 0 0 1 1.207-.178l.382.383Z" />
                  </svg>
                </CopyButton>
                {showPinHint && path.length === 1 && isExpandable && !isPinned && (
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-[var(--accent-color)] rounded-full animate-pulse" />
                )}
              </span>
            )}
            {!isRoot && (
              <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                <CopyButton onClick={handleCopyPath} tooltip="Copy path" size="sm">📋</CopyButton>
              </span>
            )}
            {isExpandable ? (
              <span className="opacity-0 group-hover:opacity-100 transition-opacity relative" ref={copyMenuRef}>
                <CopyButton onClick={() => setCopyMenuOpen((p) => !p)} tooltip={valueType === 'object' ? `Copy object (${childCount} keys)` : `Copy array (${childCount} items)`} size="sm">📄</CopyButton>
                {copyMenuOpen && (
                  <div className="absolute top-full right-0 mt-1 z-50 w-32 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] shadow-lg py-1">
                    <button onClick={handleCopyValue} className="w-full text-left px-3 py-1.5 text-xs hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] transition-colors">Copy JSON</button>
                    <button onClick={handleCopyMinified} className="w-full text-left px-3 py-1.5 text-xs hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] transition-colors">Copy minified</button>
                    {valueType === 'object' && (
                      <button onClick={handleCopyKeys} className="w-full text-left px-3 py-1.5 text-xs hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] transition-colors">Copy keys</button>
                    )}
                  </div>
                )}
              </span>
            ) : (
              <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                <CopyButton onClick={handleCopyValue} tooltip="Copy value" size="sm">📄</CopyButton>
              </span>
            )}
            {isExpandable && onDeleteNode && (
              <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                <CopyButton
                  onClick={() => {
                    if (valueType === 'array') onAddArrayItem(path);
                    else { setIsAddingKey(true); setNewKeyName(''); setNewKeyValue(''); }
                  }}
                  tooltip={valueType === 'array' ? 'Add item' : 'Add key'}
                  size="sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                    <path d="M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z" />
                  </svg>
                </CopyButton>
              </span>
            )}
            {!isRoot && onDeleteNode && (
              <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                <CopyButton onClick={() => onDeleteNode(path)} tooltip="Delete node" size="sm">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 text-[var(--error-color)]">
                    <path fillRule="evenodd" d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5ZM6.05 6a.75.75 0 0 1 .787.713l.275 5.5a.75.75 0 0 1-1.498.075l-.275-5.5A.75.75 0 0 1 6.05 6Zm3.9 0a.75.75 0 0 1 .712.787l-.275 5.5a.75.75 0 0 1-1.498-.075l.275-5.5a.75.75 0 0 1 .786-.711Z" clipRule="evenodd" />
                  </svg>
                </CopyButton>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Inline add-key form (rendered outside virtual row for simplicity) */}
      {isAddingKey && isExpanded && valueType === 'object' && (
        <div
          style={{ ...style, top: parseFloat(style.top) + ROW_HEIGHT, height: ROW_HEIGHT }}
          className="flex items-center gap-1"
        >
          <div style={{ paddingLeft: `${(depth + 1) * 16 + 4}px` }} className="flex items-center gap-1">
            <input
              type="text"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="key"
              autoFocus
              className="w-24 px-1.5 py-0.5 text-xs rounded border border-[var(--accent-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none font-mono"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newKeyName.trim()) {
                  let val = newKeyValue.trim();
                  try { val = JSON.parse(val); } catch { /* keep as string */ }
                  onAddKey(path, newKeyName.trim(), val || null);
                  setIsAddingKey(false);
                } else if (e.key === 'Escape') setIsAddingKey(false);
              }}
            />
            <span className="text-[var(--text-secondary)] text-xs">:</span>
            <input
              type="text"
              value={newKeyValue}
              onChange={(e) => setNewKeyValue(e.target.value)}
              placeholder="value"
              className="w-24 px-1.5 py-0.5 text-xs rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none font-mono"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newKeyName.trim()) {
                  let val = newKeyValue.trim();
                  try { val = JSON.parse(val); } catch { /* keep as string */ }
                  onAddKey(path, newKeyName.trim(), val || null);
                  setIsAddingKey(false);
                } else if (e.key === 'Escape') setIsAddingKey(false);
              }}
            />
            <button onClick={() => { if (newKeyName.trim()) { let val = newKeyValue.trim(); try { val = JSON.parse(val); } catch {} onAddKey(path, newKeyName.trim(), val || null); } setIsAddingKey(false); }} className="text-xs px-1.5 py-0.5 rounded bg-[var(--accent-color)] text-white hover:opacity-80">Add</button>
            <button onClick={() => setIsAddingKey(false)} className="text-xs px-1.5 py-0.5 rounded bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]">Cancel</button>
          </div>
        </div>
      )}
    </>
  );
}

export default memo(FlatTreeNode, (prev, next) => {
  // Custom comparator: only re-render if relevant props changed
  if (prev.node !== next.node) return false;
  if (prev.style.top !== next.style.top) return false;
  if (prev.searchQuery !== next.searchQuery) return false;
  if (prev.currentMatchPath !== next.currentMatchPath) return false;
  if (prev.currentDiffPath !== next.currentDiffPath) return false;
  // Check if this specific node's match/pin/diff status changed
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
