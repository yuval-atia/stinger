import { useCallback, useRef } from 'react';

function SearchBar({ value, onChange, onSubmit, isSearching, matchCount, currentMatch }) {
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
        onSubmit?.();
      }
    },
    [onChange, onSubmit]
  );

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-[var(--text-secondary)] whitespace-nowrap w-10 text-right">
        {matchCount > 0 ? `${currentMatch + 1}/${matchCount}` : ''}
      </span>
      <div className="relative flex items-center">
        {isSearching ? (
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] text-xs flex items-center justify-center">
            <span className="inline-block animate-spin">⏳</span>
          </span>
        ) : (
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] text-xs flex items-center justify-center">🔍</span>
        )}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Search + Enter..."
          className="w-48 pl-8 pr-7 py-1 text-sm bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded focus:outline-none focus:border-[var(--accent-color)] transition-colors"
        />
        {value && !isSearching && (
          <button
            onClick={handleClear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

export default SearchBar;
