import { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { compressAndCheck, uploadToWorker, TURNSTILE_SITE_KEY } from '../../utils/shareCompression';
import { useToast } from './Toast';

function SharePopover({ buttonRef, onClose, shareData }) {
  const popoverRef = useRef(null);
  const turnstileRef = useRef(null);
  const turnstileWidgetId = useRef(null);
  const [pos, setPos] = useState(null);

  // States: 'compressing' → 'ready' (inline) or 'verify' (needs turnstile) → 'uploading' → 'done' or 'error'
  const [phase, setPhase] = useState('compressing');
  const [url, setUrl] = useState(null);
  const [compressed, setCompressed] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  const { json, pinnedPaths, depth, searchQuery, filterMode, jsonStats } = shareData;

  // ── Positioning ────────────────────────────────────────────────────────────

  const reposition = useCallback(() => {
    if (!buttonRef.current || !popoverRef.current) return;
    const btn = buttonRef.current.getBoundingClientRect();
    const tip = popoverRef.current.getBoundingClientRect();
    const pad = 8;

    let top = btn.bottom + 8;
    let left = btn.left + btn.width / 2 - tip.width / 2;

    if (left < pad) left = pad;
    if (left + tip.width > window.innerWidth - pad) left = window.innerWidth - pad - tip.width;

    let flipped = false;
    if (top + tip.height > window.innerHeight - pad) {
      top = btn.top - tip.height - 8;
      flipped = true;
    }

    const arrowLeft = Math.min(Math.max(btn.left + btn.width / 2 - left, 12), tip.width - 12);
    setPos({ top, left, arrowLeft, flipped });
  }, [buttonRef]);

  useLayoutEffect(() => {
    reposition();
  }, [reposition, phase, url, error]);

  useEffect(() => {
    window.addEventListener('resize', reposition);
    window.addEventListener('scroll', reposition, true);
    return () => {
      window.removeEventListener('resize', reposition);
      window.removeEventListener('scroll', reposition, true);
    };
  }, [reposition]);

  useEffect(() => {
    const handleClick = (e) => {
      if (
        popoverRef.current && !popoverRef.current.contains(e.target) &&
        buttonRef.current && !buttonRef.current.contains(e.target)
      ) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose, buttonRef]);

  // ── Step 1: Compress on mount ──────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await compressAndCheck({ json, pinnedPaths, depth, searchQuery, filterMode });
        if (cancelled) return;
        if (!result.needsWorker) {
          setUrl(result.inlineUrl);
          setPhase('ready');
        } else {
          setCompressed(result.compressed);
          setPhase('verify');
        }
      } catch {
        if (!cancelled) {
          setError('Failed to generate link');
          setPhase('error');
        }
      }
    })();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Step 2: Render Turnstile when entering 'verify' phase ──────────────────

  useEffect(() => {
    if (phase !== 'verify' || !turnstileRef.current) return;
    if (typeof window.turnstile === 'undefined') {
      setError('Verification not available');
      setPhase('error');
      return;
    }

    turnstileWidgetId.current = window.turnstile.render(turnstileRef.current, {
      sitekey: TURNSTILE_SITE_KEY,
      theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
      callback: (token) => {
        handleTurnstileSuccess(token);
      },
      'error-callback': () => {
        setError('Verification failed. Please try again.');
        setPhase('error');
      },
    });

    return () => {
      if (turnstileWidgetId.current !== null && typeof window.turnstile !== 'undefined') {
        window.turnstile.remove(turnstileWidgetId.current);
        turnstileWidgetId.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // ── Step 3: Upload to worker after Turnstile success ───────────────────────

  const handleTurnstileSuccess = async (token) => {
    setPhase('uploading');
    try {
      const shareUrl = await uploadToWorker(compressed, token);
      setUrl(shareUrl);
      setPhase('ready');
    } catch {
      setError('Failed to upload. Please try again.');
      setPhase('error');
    }
  };

  // ── Copy handler ───────────────────────────────────────────────────────────

  const handleCopy = async () => {
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    showToast('Shareable link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Summary pills ──────────────────────────────────────────────────────────

  const summaryItems = [];
  if (jsonStats) summaryItems.push(jsonStats.sizeFormatted);
  if (pinnedPaths.length > 0) summaryItems.push(`${pinnedPaths.length} pin${pinnedPaths.length > 1 ? 's' : ''}`);
  if (depth) summaryItems.push(`depth ${depth}`);
  if (searchQuery) summaryItems.push(`"${searchQuery}"`);

  const displayUrl = url
    ? url.replace(/^https?:\/\//, '').slice(0, 42) + (url.replace(/^https?:\/\//, '').length > 42 ? '...' : '')
    : '';

  return createPortal(
    <div
      ref={popoverRef}
      className="fixed z-[9999] w-80 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] shadow-lg p-3 space-y-2.5"
      style={pos ? { top: pos.top, left: pos.left } : { visibility: 'hidden' }}
    >
      <div
        className={`absolute w-3 h-3 rotate-45 bg-[var(--bg-primary)] ${
          pos?.flipped
            ? '-bottom-2 border-r border-b border-[var(--border-color)]'
            : '-top-2 border-l border-t border-[var(--border-color)]'
        }`}
        style={{ left: pos?.arrowLeft ?? 0 }}
      />

      {/* Header + summary pills */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-xs font-semibold text-[var(--text-primary)]">Share</span>
        {summaryItems.map((item, i) => (
          <span key={i} className="px-1.5 py-0.5 text-[10px] rounded bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-color)]">
            {item}
          </span>
        ))}
      </div>

      {/* Content based on phase */}
      {(phase === 'compressing' || phase === 'uploading') && (
        <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
          <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" opacity="0.3" />
            <path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          {phase === 'compressing' ? 'Generating link...' : 'Uploading...'}
        </div>
      )}

      {phase === 'verify' && (
        <div className="space-y-2">
          <div className="text-xs text-[var(--text-secondary)]">
            Quick verification needed for large shares:
          </div>
          <div ref={turnstileRef} />
        </div>
      )}

      {phase === 'error' && (
        <div className="text-xs text-[var(--error-color)]">{error}</div>
      )}

      {phase === 'ready' && url && (
        <div className="flex items-center gap-1.5">
          <div className="flex-1 min-w-0 px-2 py-1.5 text-[11px] font-mono rounded bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] truncate select-all">
            {displayUrl}
          </div>
          <button
            onClick={handleCopy}
            className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded transition-colors ${
              copied
                ? 'bg-[var(--success-color)] text-white'
                : 'bg-[var(--accent-color)] hover:bg-blue-600 text-white'
            }`}
          >
            {copied ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
                  <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
                </svg>
                Copied
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
                  <path d="M5.5 3.5A1.5 1.5 0 0 1 7 2h2.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 1 .439 1.061V9.5A1.5 1.5 0 0 1 12 11V3.5H7a1.5 1.5 0 0 1-1.5-1.5v1.5Z" />
                  <path d="M4 5a1.5 1.5 0 0 0-1.5 1.5v6A1.5 1.5 0 0 0 4 14h5a1.5 1.5 0 0 0 1.5-1.5V8.621a1.5 1.5 0 0 0-.44-1.06L7.94 5.439A1.5 1.5 0 0 0 6.878 5H4Z" />
                </svg>
                Copy
              </>
            )}
          </button>
        </div>
      )}
    </div>,
    document.body
  );
}

export default SharePopover;
