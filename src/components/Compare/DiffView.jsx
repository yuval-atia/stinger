import { useMemo } from 'react';
import JsonInput from '../Editor/JsonInput';
import TreeView from '../TreeView/TreeView';
import { diffJson, createDiffMap } from '../../utils/differ';

function DiffView({
  leftInput,
  rightInput,
  leftData,
  rightData,
  leftError,
  rightError,
  onLeftChange,
  onRightChange,
  searchQuery,
}) {
  const { diffs, diffMap } = useMemo(() => {
    if (leftData === null || rightData === null) {
      return { diffs: [], diffMap: new Map() };
    }
    const diffs = diffJson(leftData, rightData);
    const diffMap = createDiffMap(diffs);
    return { diffs, diffMap };
  }, [leftData, rightData]);

  const stats = useMemo(() => {
    const added = diffs.filter((d) => d.type === 'added').length;
    const removed = diffs.filter((d) => d.type === 'removed').length;
    const changed = diffs.filter((d) => d.type === 'changed').length;
    return { added, removed, changed, total: diffs.length };
  }, [diffs]);

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Stats bar */}
      {leftData !== null && rightData !== null && (
        <div className="flex-shrink-0 flex items-center gap-4 px-4 py-2 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-color)]">
          <span className="text-sm font-medium">Diff Summary:</span>
          {stats.total === 0 ? (
            <span className="text-[var(--success-color)] text-sm">No differences found</span>
          ) : (
            <>
              <span className="text-sm">
                <span className="inline-block w-3 h-3 rounded mr-1 bg-[var(--diff-add)]" />
                {stats.added} added
              </span>
              <span className="text-sm">
                <span className="inline-block w-3 h-3 rounded mr-1 bg-[var(--diff-remove)]" />
                {stats.removed} removed
              </span>
              <span className="text-sm">
                <span className="inline-block w-3 h-3 rounded mr-1 bg-[var(--diff-change)]" />
                {stats.changed} changed
              </span>
            </>
          )}
        </div>
      )}

      {/* Split view */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
        {/* Left panel */}
        <div className="flex flex-col gap-4 min-h-0">
          {/* Input */}
          <div className="flex-1 min-h-0 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-color)] flex flex-col overflow-hidden">
            <div className="flex-shrink-0 px-4 py-2 border-b border-[var(--border-color)]">
              <span className="text-sm font-medium">Left (Original)</span>
            </div>
            <div className="flex-1 overflow-auto">
              <JsonInput
                value={leftInput}
                onChange={onLeftChange}
                error={leftError}
                placeholder="Paste first JSON here..."
              />
            </div>
          </div>

          {/* Tree */}
          <div className="flex-1 min-h-0 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-color)] flex flex-col overflow-hidden">
            <div className="flex-shrink-0 px-4 py-2 border-b border-[var(--border-color)]">
              <span className="text-sm font-medium">Left Tree</span>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {leftData !== null ? (
                <TreeView
                  data={leftData}
                  searchQuery={searchQuery}
                  diffMap={diffMap}
                  side="left"
                />
              ) : leftError ? (
                <div className="text-[var(--error-color)] text-sm">
                  <span className="font-medium">Parse Error:</span> {leftError}
                </div>
              ) : (
                <div className="text-[var(--text-secondary)] text-sm">
                  Enter JSON to compare
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex flex-col gap-4 min-h-0">
          {/* Input */}
          <div className="flex-1 min-h-0 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-color)] flex flex-col overflow-hidden">
            <div className="flex-shrink-0 px-4 py-2 border-b border-[var(--border-color)]">
              <span className="text-sm font-medium">Right (Modified)</span>
            </div>
            <div className="flex-1 overflow-auto">
              <JsonInput
                value={rightInput}
                onChange={onRightChange}
                error={rightError}
                placeholder="Paste second JSON here..."
              />
            </div>
          </div>

          {/* Tree */}
          <div className="flex-1 min-h-0 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-color)] flex flex-col overflow-hidden">
            <div className="flex-shrink-0 px-4 py-2 border-b border-[var(--border-color)]">
              <span className="text-sm font-medium">Right Tree</span>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {rightData !== null ? (
                <TreeView
                  data={rightData}
                  searchQuery={searchQuery}
                  diffMap={diffMap}
                  side="right"
                />
              ) : rightError ? (
                <div className="text-[var(--error-color)] text-sm">
                  <span className="font-medium">Parse Error:</span> {rightError}
                </div>
              ) : (
                <div className="text-[var(--text-secondary)] text-sm">
                  Enter JSON to compare
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DiffView;
