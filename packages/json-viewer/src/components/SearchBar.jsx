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
    <div className="sjt-flex sjt-items-center sjt-gap-1.5">
      {/* Match counter */}
      <span className="sjt-text-xs sjt-whitespace-nowrap sjt-text-right" style={{ color: 'var(--sjt-text-secondary)', width: '3rem' }}>
        {matchCount > 0 ? `${currentMatch + 1}/${matchCount}` : ''}
      </span>

      {/* Prev/Next arrows */}
      {matchCount > 0 && (
        <div className="sjt-flex sjt-items-center">
          <button
            onClick={onPrev}
            className="sjt-rounded sjt-transition-colors"
            style={{ padding: '2px', color: 'var(--sjt-text-secondary)' }}
            title="Previous match (Shift+Enter)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="sjt-w-3.5 sjt-h-3.5">
              <path fillRule="evenodd" d="M11.78 9.78a.75.75 0 0 1-1.06 0L8 7.06 5.28 9.78a.75.75 0 0 1-1.06-1.06l3.25-3.25a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06Z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            onClick={onNext}
            className="sjt-rounded sjt-transition-colors"
            style={{ padding: '2px', color: 'var(--sjt-text-secondary)' }}
            title="Next match (Enter)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="sjt-w-3.5 sjt-h-3.5">
              <path fillRule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      {/* Filter toggle */}
      {onFilterToggle && matchCount > 0 && (
        <button
          onClick={onFilterToggle}
          className="sjt-rounded sjt-transition-colors"
          style={{
            padding: '4px',
            backgroundColor: filterMode ? 'var(--sjt-accent-color)' : 'transparent',
            color: filterMode ? '#ffffff' : 'var(--sjt-text-secondary)',
          }}
          title={filterMode ? 'Show all nodes' : 'Show only matches'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="sjt-w-3.5 sjt-h-3.5">
            <path d="M14 2H2l5 5.6V12l2 1.5V7.6L14 2Z" />
          </svg>
        </button>
      )}

      {/* Search input */}
      <div className="sjt-relative sjt-flex sjt-items-center">
        {isSearching ? (
          <span className="sjt-absolute sjt-text-xs sjt-flex sjt-items-center sjt-justify-center" style={{ left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--sjt-text-secondary)' }}>
            <span className="sjt-inline-block sjt-animate-spin">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="sjt-w-3.5 sjt-h-3.5">
                <path fillRule="evenodd" d="M13.836 2.477a.75.75 0 0 1 .75.75v3.182a.75.75 0 0 1-.75.75h-3.182a.75.75 0 0 1 0-1.5h1.37l-.84-.841a4.5 4.5 0 0 0-7.08.681.75.75 0 0 1-1.3-.75 6 6 0 0 1 9.44-.908l.84.84V3.227a.75.75 0 0 1 .75-.75Zm-.911 7.5A.75.75 0 0 1 13.199 11a6 6 0 0 1-9.44.908l-.84-.84v1.836a.75.75 0 0 1-1.5 0V9.722a.75.75 0 0 1 .75-.75h3.182a.75.75 0 0 1 0 1.5H3.98l.841.841a4.5 4.5 0 0 0 7.08-.681.75.75 0 0 1 1.025-.274Z" clipRule="evenodd" />
              </svg>
            </span>
          </span>
        ) : (
          <span className="sjt-absolute sjt-flex sjt-items-center sjt-justify-center" style={{ left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--sjt-text-secondary)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="sjt-w-3.5 sjt-h-3.5">
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
          className="sjt-rounded sjt-text-sm"
          style={{
            width: '11rem',
            paddingLeft: '2rem',
            paddingRight: '1.75rem',
            paddingTop: '4px',
            paddingBottom: '4px',
            backgroundColor: 'var(--sjt-bg-secondary)',
            border: '1px solid var(--sjt-border-color)',
            color: 'var(--sjt-text-primary)',
            outline: 'none',
          }}
        />
        {value && !isSearching && (
          <button
            onClick={handleClear}
            className="sjt-absolute"
            style={{ right: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--sjt-text-secondary)' }}
            aria-label="Clear search"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="sjt-w-3.5 sjt-h-3.5">
              <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

export default SearchBar;
