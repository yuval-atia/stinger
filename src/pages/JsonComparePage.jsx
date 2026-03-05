import { useState, useCallback, useMemo } from 'react';
import JsonInput from '../components/Editor/JsonInput';
import DiffTable from '../components/Compare/DiffTable';
import { useJsonParser } from '../hooks/useJsonParser';
import ToolCard from '../components/common/ToolCard';

const MAX_INPUTS = 5;
const MIN_INPUTS = 2;

const SAMPLE_LEFT = JSON.stringify({
  name: "John Doe",
  age: 30,
  email: "john@example.com",
  address: { city: "New York", zip: "10001" },
  hobbies: ["reading", "gaming"],
  active: true
}, null, 2);

const SAMPLE_RIGHT = JSON.stringify({
  name: "Jane Doe",
  age: 28,
  email: "jane@example.com",
  address: { city: "Boston", zip: "02101", state: "MA" },
  hobbies: ["reading", "cooking"],
  active: true,
  role: "admin"
}, null, 2);

function JsonComparePage() {
  const [inputCount, setInputCount] = useState(2);
  const [inputsCollapsed, setInputsCollapsed] = useState(false);
  const [editingLabel, setEditingLabel] = useState(null);
  const [customLabels, setCustomLabels] = useState({});

  // Create all possible parsers upfront (hooks can't be conditional)
  const p1 = useJsonParser();
  const p2 = useJsonParser();
  const p3 = useJsonParser();
  const p4 = useJsonParser();
  const p5 = useJsonParser();

  const allParsers = useMemo(() => [p1, p2, p3, p4, p5], [p1, p2, p3, p4, p5]);
  const parsers = allParsers.slice(0, inputCount);

  const labels = useMemo(
    () => Array.from({ length: inputCount }, (_, i) => customLabels[i] || `JSON ${i + 1}`),
    [inputCount, customLabels]
  );

  const jsonObjects = useMemo(
    () => parsers.map((p) => p.parsedData),
    [parsers]
  );

  const addInput = useCallback(() => {
    if (inputCount < MAX_INPUTS) setInputCount((c) => c + 1);
  }, [inputCount]);

  const removeInput = useCallback((index) => {
    if (inputCount <= MIN_INPUTS) return;
    const values = allParsers.slice(0, inputCount).map((p) => p.inputValue);
    values.splice(index, 1);
    for (let i = 0; i < inputCount - 1; i++) {
      allParsers[i].handleInputChange(values[i] || '');
    }
    allParsers[inputCount - 1].handleInputChange('');
    // Shift custom labels
    const newLabels = {};
    for (let i = 0; i < inputCount - 1; i++) {
      const oldIdx = i < index ? i : i + 1;
      if (customLabels[oldIdx]) newLabels[i] = customLabels[oldIdx];
    }
    setCustomLabels(newLabels);
    setInputCount((c) => c - 1);
  }, [inputCount, allParsers, customLabels]);

  const clearAll = useCallback(() => {
    for (let i = 0; i < inputCount; i++) {
      allParsers[i].handleInputChange('');
    }
  }, [inputCount, allParsers]);

  const loadSample = useCallback(() => {
    allParsers[0].handleInputChange(SAMPLE_LEFT);
    allParsers[1].handleInputChange(SAMPLE_RIGHT);
  }, [allParsers]);

  const swapInputs = useCallback(() => {
    if (inputCount !== 2) return;
    const v0 = allParsers[0].inputValue;
    const v1 = allParsers[1].inputValue;
    allParsers[0].handleInputChange(v1);
    allParsers[1].handleInputChange(v0);
    const l0 = customLabels[0];
    const l1 = customLabels[1];
    setCustomLabels({ 0: l1, 1: l0 });
  }, [inputCount, allParsers, customLabels]);

  const handleLabelChange = useCallback((index, value) => {
    setCustomLabels((prev) => {
      const next = { ...prev };
      if (value.trim()) {
        next[index] = value.trim();
      } else {
        delete next[index];
      }
      return next;
    });
    setEditingLabel(null);
  }, []);

  const validCount = jsonObjects.filter((o) => o !== null).length;
  const hasAnyInput = parsers.some((p) => p.inputValue.trim());

  return (
    <div className="flex flex-col gap-4 h-full overflow-auto">
      {/* Inputs section */}
      <ToolCard
        title="Compare JSON"
        icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4"><path d="M13.488 2.513a1.75 1.75 0 0 0-2.475 0L6.75 6.774a2.75 2.75 0 0 0-.596.892l-.848 2.047a.75.75 0 0 0 .98.98l2.047-.848a2.75 2.75 0 0 0 .892-.596l4.261-4.262a1.75 1.75 0 0 0 0-2.474Z" /><path d="M4.75 3.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h6.5c.69 0 1.25-.56 1.25-1.25V9A.75.75 0 0 1 14 9v2.25A2.75 2.75 0 0 1 11.25 14h-6.5A2.75 2.75 0 0 1 2 11.25v-6.5A2.75 2.75 0 0 1 4.75 2H7a.75.75 0 0 1 0 1.5H4.75Z" /></svg>}
        info={{
          what: 'Compare up to 5 JSON documents in a clean table view showing only what differs.',
          how: 'Walks all paths in each JSON and shows a row for every path where values differ. Click any value to copy it.',
          usedFor: 'Comparing API responses, config versions, state snapshots, data migrations.',
        }}
      >
        <div className="p-4 flex flex-col gap-3">
          {/* Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Collapse toggle */}
            {hasAnyInput && (
              <button
                onClick={() => setInputsCollapsed((p) => !p)}
                className="p-1 rounded hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                title={inputsCollapsed ? 'Expand inputs' : 'Collapse inputs'}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className={`w-3.5 h-3.5 transition-transform ${inputsCollapsed ? '' : 'rotate-90'}`}>
                  <path fillRule="evenodd" d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L8.94 8 6.22 5.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                </svg>
              </button>
            )}

            <span className="text-xs text-[var(--text-secondary)]">
              {inputCount} inputs
              {validCount > 0 && (
                <span className="ml-1 text-[var(--success-color)]">({validCount} valid)</span>
              )}
            </span>

            {inputCount < MAX_INPUTS && (
              <button
                onClick={addInput}
                className="px-2 py-1 text-xs rounded bg-[var(--bg-secondary)] hover:bg-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
                  <path d="M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z" />
                </svg>
                Add
              </button>
            )}

            {/* Swap for 2-input mode */}
            {inputCount === 2 && validCount >= 1 && (
              <button
                onClick={swapInputs}
                className="px-2 py-1 text-xs rounded bg-[var(--bg-secondary)] hover:bg-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-1"
                title="Swap left and right"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
                  <path fillRule="evenodd" d="M13.78 10.47a.75.75 0 0 1 0 1.06l-2.25 2.25a.75.75 0 0 1-1.06 0l-2.25-2.25a.75.75 0 1 1 1.06-1.06l.97.97V8.75a.75.75 0 0 1 1.5 0v2.69l.97-.97a.75.75 0 0 1 1.06 0ZM2.22 5.53a.75.75 0 0 1 0-1.06l2.25-2.25a.75.75 0 0 1 1.06 0l2.25 2.25a.75.75 0 0 1-1.06 1.06l-.97-.97v2.69a.75.75 0 0 1-1.5 0V4.56l-.97.97a.75.75 0 0 1-1.06 0Z" clipRule="evenodd" />
                </svg>
                Swap
              </button>
            )}

            <div className="flex-1" />

            {/* Sample data */}
            {!hasAnyInput && (
              <button
                onClick={loadSample}
                className="px-2 py-1 text-xs rounded bg-[var(--bg-secondary)] hover:bg-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                Load sample
              </button>
            )}

            {/* Clear */}
            {hasAnyInput && (
              <button
                onClick={clearAll}
                className="px-2 py-1 text-xs rounded bg-[var(--bg-secondary)] hover:bg-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Input panels */}
          {!inputsCollapsed && (
            <div
              className={`grid gap-3 ${
                inputCount <= 2 ? 'grid-cols-1 md:grid-cols-2' :
                inputCount === 3 ? 'grid-cols-1 md:grid-cols-3' :
                'grid-cols-1 md:grid-cols-2'
              }`}
              style={inputCount > 3 ? { gridTemplateColumns: `repeat(${Math.min(inputCount, 4)}, minmax(0, 1fr))` } : undefined}
            >
              {parsers.map((parser, i) => (
                <div key={i} className="flex flex-col min-h-0">
                  {/* Label row */}
                  <div className="flex items-center justify-between mb-1.5 gap-1">
                    {editingLabel === i ? (
                      <input
                        autoFocus
                        defaultValue={customLabels[i] || ''}
                        placeholder={`JSON ${i + 1}`}
                        onBlur={(e) => handleLabelChange(i, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleLabelChange(i, e.target.value);
                          if (e.key === 'Escape') setEditingLabel(null);
                        }}
                        className="text-xs font-medium bg-transparent border-b border-[var(--accent-color)] outline-none text-[var(--text-primary)] w-24 py-0"
                      />
                    ) : (
                      <button
                        onClick={() => setEditingLabel(i)}
                        className="text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-1"
                        title="Click to rename"
                      >
                        {labels[i]}
                        {parser.parsedData !== null && (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 text-[var(--success-color)]">
                            <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
                          </svg>
                        )}
                        {parser.parseError && (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 text-[var(--error-color)]">
                            <path fillRule="evenodd" d="M6.701 2.25c.577-1 2.02-1 2.598 0l5.196 9a1.5 1.5 0 0 1-1.299 2.25H2.804a1.5 1.5 0 0 1-1.3-2.25l5.197-9ZM8 4a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    )}

                    <div className="flex items-center gap-1">
                      {parser.inputValue && (
                        <button
                          onClick={() => parser.handleInputChange('')}
                          className="p-0.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors opacity-0 group-hover:opacity-100"
                          title="Clear this input"
                          style={{ opacity: parser.inputValue ? 0.5 : 0 }}
                          onMouseEnter={(e) => e.target.style.opacity = 1}
                          onMouseLeave={(e) => e.target.style.opacity = 0.5}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
                            <path fillRule="evenodd" d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5ZM6.05 6a.75.75 0 0 1 .787.713l.275 5.5a.75.75 0 0 1-1.498.075l-.275-5.5A.75.75 0 0 1 6.05 6Zm3.9 0a.75.75 0 0 1 .712.787l-.275 5.5a.75.75 0 0 1-1.498-.075l.275-5.5a.75.75 0 0 1 .786-.711Z" clipRule="evenodd" />
                          </svg>
                        </button>
                      )}
                      {inputCount > MIN_INPUTS && (
                        <button
                          onClick={() => removeInput(i)}
                          className="p-0.5 text-[var(--text-secondary)] hover:text-[var(--error-color)] transition-colors"
                          title="Remove this input"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                            <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Input box */}
                  <div className="rounded-lg border border-[var(--border-color)] overflow-hidden h-52 transition-all">
                    <JsonInput
                      value={parser.inputValue}
                      onChange={parser.handleInputChange}
                      error={parser.parseError}
                      placeholder={`Paste or drop JSON ${i + 1} here...`}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Collapsed summary */}
          {inputsCollapsed && (
            <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)]">
              {parsers.map((parser, i) => (
                <span key={i} className="flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${parser.parsedData !== null ? 'bg-[var(--success-color)]' : parser.parseError ? 'bg-[var(--error-color)]' : 'bg-[var(--border-color)]'}`} />
                  {labels[i]}
                  {parser.parsedData !== null && <span className="opacity-50">({typeof parser.parsedData === 'object' && parser.parsedData !== null ? Object.keys(parser.parsedData).length + ' keys' : 'value'})</span>}
                </span>
              ))}
              <button
                onClick={() => setInputsCollapsed(false)}
                className="text-[var(--accent-color)] hover:underline ml-auto"
              >
                Edit inputs
              </button>
            </div>
          )}
        </div>
      </ToolCard>

      {/* Results */}
      {validCount >= 2 && (
        <ToolCard
          title="Differences"
          icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M2 3.75A.75.75 0 0 1 2.75 3h10.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 3.75ZM2 8a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 8Zm0 4.25a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" /></svg>}
        >
          <div className="p-4">
            <DiffTable jsonObjects={jsonObjects} labels={labels} />
          </div>
        </ToolCard>
      )}
    </div>
  );
}

export default JsonComparePage;
