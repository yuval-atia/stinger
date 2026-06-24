import { useState } from 'react';
import { decompressState } from '../../utils/shareCompression';

function ImportBlobForm({ onImport, onCancel }) {
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    try {
      const state = await decompressState(trimmed);
      onImport(state);
    } catch {
      setError('Invalid share blob. Make sure you pasted the full text.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-[var(--text-secondary)]">
        Paste a shared text blob to restore the JSON view state.
      </p>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Paste share blob here..."
        className="w-full h-32 px-3 py-2 text-sm font-mono rounded border border-white/10 dark:border-white/5 bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] resize-none focus:outline-none focus:border-[var(--accent-color)]"
        autoFocus
      />
      {error && (
        <div className="text-xs text-[var(--error-color)]">{error}</div>
      )}
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 text-xs rounded bg-white/50 dark:bg-black/30 hover:bg-white/80 dark:hover:bg-white/10 border border-white/40 dark:border-white/10 shadow-sm backdrop-blur-sm text-[var(--text-primary)] transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || !value.trim()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded bg-[var(--accent-color)] hover:bg-blue-600 text-white transition-colors disabled:opacity-60"
        >
          {loading ? (
            <>
              <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" opacity="0.3" />
                <path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Importing...
            </>
          ) : (
            'Import'
          )}
        </button>
      </div>
    </form>
  );
}

export default ImportBlobForm;
