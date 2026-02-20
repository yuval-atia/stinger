import { useCallback, useRef } from 'react';

function JsonPathInput({ value, onChange, matchCount, error }) {
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

  return (
    <div className="flex items-center gap-1.5">
      {/* Result counter or error */}
      <span className="text-xs text-[var(--text-secondary)] whitespace-nowrap w-12 text-right">
        {error ? (
          <span className="text-[var(--error-color)]" title={error}>err</span>
        ) : matchCount > 0 ? (
          `${matchCount}`
        ) : value ? (
          '0'
        ) : ''}
      </span>

      {/* Input with $ prefix */}
      <div className="relative flex items-center">
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--accent-color)] font-bold text-sm select-none">
          $
        </span>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          placeholder=".users[*].name"
          className="w-44 pl-7 pr-7 py-1 text-sm bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded focus:outline-none focus:border-[var(--accent-color)] transition-colors"
        />
        {value && (
          <button
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            aria-label="Clear query"
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

export default JsonPathInput;
