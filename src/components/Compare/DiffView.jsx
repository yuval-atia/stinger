import { useMemo } from 'react';
import JsonInput from '../Editor/JsonInput';
import TreeView from '../TreeView/TreeView';
import { InfoButton } from '../common/InfoTooltip';
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
          <span className="text-sm font-medium flex items-center gap-1.5"><span className="text-[var(--accent-color)]"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4"><path d="M13.488 2.513a1.75 1.75 0 0 0-2.475 0L6.75 6.774a2.75 2.75 0 0 0-.596.892l-.848 2.047a.75.75 0 0 0 .98.98l2.047-.848a2.75 2.75 0 0 0 .892-.596l4.261-4.262a1.75 1.75 0 0 0 0-2.474Z" /><path d="M4.75 3.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h6.5c.69 0 1.25-.56 1.25-1.25V9A.75.75 0 0 1 14 9v2.25A2.75 2.75 0 0 1 11.25 14h-6.5A2.75 2.75 0 0 1 2 11.25v-6.5A2.75 2.75 0 0 1 4.75 2H7a.75.75 0 0 1 0 1.5H4.75Z" /></svg></span>Diff Summary:</span>
          <InfoButton info={{
            what: 'Side-by-side JSON comparison that highlights added, removed, and changed keys between two JSON documents.',
            how: 'Recursively walks both object trees, comparing keys and values at each level. Differences are classified as added, removed, or changed and colour-coded in the tree view.',
            usedFor: 'Reviewing API response changes, comparing config versions, debugging state mutations, and validating data migrations.',
          }} />
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
              <span className="text-sm font-medium flex items-center gap-1.5"><span className="text-[var(--accent-color)]"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M4 2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H4Zm1 2.25a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5A.75.75 0 0 1 5 4.25Zm0 2.5A.75.75 0 0 1 5.75 6h4.5a.75.75 0 0 1 0 1.5h-4.5A.75.75 0 0 1 5 6.75ZM5.75 8.5a.75.75 0 0 0 0 1.5h2.5a.75.75 0 0 0 0-1.5h-2.5Z" clipRule="evenodd" /></svg></span>Left (Original)</span>
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
              <span className="text-sm font-medium flex items-center gap-1.5"><span className="text-[var(--accent-color)]"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4"><path d="M8 .5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0V1.25A.75.75 0 0 1 8 .5ZM4.5 7a.75.75 0 0 0 0 1.5h7a.75.75 0 0 0 0-1.5h-7ZM3 12a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-2Zm7-1a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1h-2Z" /></svg></span>Left Tree</span>
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
              <span className="text-sm font-medium flex items-center gap-1.5"><span className="text-[var(--accent-color)]"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M4 2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H4Zm1 2.25a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5A.75.75 0 0 1 5 4.25Zm0 2.5A.75.75 0 0 1 5.75 6h4.5a.75.75 0 0 1 0 1.5h-4.5A.75.75 0 0 1 5 6.75ZM5.75 8.5a.75.75 0 0 0 0 1.5h2.5a.75.75 0 0 0 0-1.5h-2.5Z" clipRule="evenodd" /></svg></span>Right (Modified)</span>
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
              <span className="text-sm font-medium flex items-center gap-1.5"><span className="text-[var(--accent-color)]"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4"><path d="M8 .5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0V1.25A.75.75 0 0 1 8 .5ZM4.5 7a.75.75 0 0 0 0 1.5h7a.75.75 0 0 0 0-1.5h-7ZM3 12a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-2Zm7-1a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1h-2Z" /></svg></span>Right Tree</span>
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
