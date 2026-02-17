import { useCallback, useRef } from 'react';

function SearchBar({ value, onChange, onSubmit, onPrev, onNext, isSearching, matchCount, currentMatch, filterMode, onFilterToggle }) {
  const inputRef = useRef(null);

  const handleChange = useCallback(
    (e) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  const handleClear = useCallback(() => {
    onChange('');
    inputRef.current?.focus();
  }, [onChange]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        onChange('');
        inputRef.current?.blur();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (e.shiftKey) {
          onPrev?.();
        } else {
          onSubmit?.();
        }
      }
    },
    [onChange, onSubmit, onPrev]
  );

  return (
    <div className="flex items-center gap-1.5">
      {/* Match counter */}
      <span className="text-xs text-[var(--text-secondary)] whitespace-nowrap w-12 text-right">
        {matchCount > 0 ? `${currentMatch + 1}/${matchCount}` : ''}
      </span>

      {/* Prev/Next arrows */}
      {matchCount > 0 && (
        <div className="flex items-center">
          <button
            onClick={onPrev}
            className="p-0.5 rounded hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            title="Previous match (Shift+Enter)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
              <path fillRule="evenodd" d="M11.78 9.78a.75.75 0 0 1-1.06 0L8 7.06 5.28 9.78a.75.75 0 0 1-1.06-1.06l3.25-3.25a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06Z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            onClick={onNext}
            className="p-0.5 rounded hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            title="Next match (Enter)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
              <path fillRule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      {/* Filter toggle */}
      {onFilterToggle && matchCount > 0 && (
        <button
          onClick={onFilterToggle}
          className={`p-1 rounded transition-colors ${
            filterMode
              ? 'bg-[var(--accent-color)] text-white'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
          }`}
          title={filterMode ? 'Show all nodes' : 'Show only matches'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
            <path d="M14 2H2l5 5.6V12l2 1.5V7.6L14 2Z" />
          </svg>
        </button>
      )}

      {/* Search input */}
      <div className="relative flex items-center">
        {isSearching ? (
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] text-xs flex items-center justify-center">
            <span className="inline-block animate-spin">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                <path fillRule="evenodd" d="M13.836 2.477a.75.75 0 0 1 .75.75v3.182a.75.75 0 0 1-.75.75h-3.182a.75.75 0 0 1 0-1.5h1.37l-.84-.841a4.5 4.5 0 0 0-7.08.681.75.75 0 0 1-1.3-.75 6 6 0 0 1 9.44-.908l.84.84V3.227a.75.75 0 0 1 .75-.75Zm-.911 7.5A.75.75 0 0 1 13.199 11a6 6 0 0 1-9.44.908l-.84-.84v1.836a.75.75 0 0 1-1.5 0V9.722a.75.75 0 0 1 .75-.75h3.182a.75.75 0 0 1 0 1.5H3.98l.841.841a4.5 4.5 0 0 0 7.08-.681.75.75 0 0 1 1.025-.274Z" clipRule="evenodd" />
              </svg>
            </span>
          </span>
        ) : (
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
              <path fillRule="evenodd" d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z" clipRule="evenodd" />
            </svg>
          </span>
        )}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Search..."
          className="w-44 pl-8 pr-7 py-1 text-sm bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded focus:outline-none focus:border-[var(--accent-color)] transition-colors"
        />
        {value && !isSearching && (
          <button
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            aria-label="Clear search"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
              <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

export default SearchBar;
