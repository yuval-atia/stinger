import { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

function InfoTooltip({ info, buttonRef, onClose }) {
  const tooltipRef = useRef(null);
  const [pos, setPos] = useState(null);

  const reposition = useCallback(() => {
    if (!buttonRef.current || !tooltipRef.current) return;
    const btn = buttonRef.current.getBoundingClientRect();
    const tip = tooltipRef.current.getBoundingClientRect();
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
  }, [reposition]);

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
        tooltipRef.current && !tooltipRef.current.contains(e.target) &&
        buttonRef.current && !buttonRef.current.contains(e.target)
      ) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose, buttonRef]);

  return createPortal(
    <div
      ref={tooltipRef}
      className="fixed z-[9999] w-80 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] shadow-lg p-4 space-y-3"
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

      <div className="flex items-start gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 mt-0.5 flex-shrink-0 text-[var(--accent-color)]">
          <path d="M5 4a.75.75 0 0 1 .738.616l.252 1.388A1.25 1.25 0 0 0 6.996 7.01l1.388.252a.75.75 0 0 1 0 1.476l-1.388.252A1.25 1.25 0 0 0 5.99 9.996l-.252 1.388a.75.75 0 0 1-1.476 0L4.01 9.996A1.25 1.25 0 0 0 3.004 8.99l-1.388-.252a.75.75 0 0 1 0-1.476l1.388-.252A1.25 1.25 0 0 0 4.01 6.004l.252-1.388A.75.75 0 0 1 5 4ZM12 1a.75.75 0 0 1 .721.544l.195.682c.118.415.443.74.858.858l.682.195a.75.75 0 0 1 0 1.442l-.682.195a1.25 1.25 0 0 0-.858.858l-.195.682a.75.75 0 0 1-1.442 0l-.195-.682a1.25 1.25 0 0 0-.858-.858l-.682-.195a.75.75 0 0 1 0-1.442l.682-.195a1.25 1.25 0 0 0 .858-.858l.195-.682A.75.75 0 0 1 12 1ZM10 11a.75.75 0 0 1 .728.568l.258 1.03c.09.36.353.623.713.713l1.03.258a.75.75 0 0 1 0 1.455l-1.03.258a1.25 1.25 0 0 0-.713.714l-.258 1.028a.75.75 0 0 1-1.455 0l-.258-1.028a1.25 1.25 0 0 0-.714-.714l-1.028-.258a.75.75 0 0 1 0-1.455l1.028-.258a1.25 1.25 0 0 0 .714-.713l.258-1.03A.75.75 0 0 1 10 11Z" />
        </svg>
        <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
          <span className="font-semibold text-[var(--text-primary)]">What: </span>{info.what}
        </p>
      </div>
      <div className="flex items-start gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 mt-0.5 flex-shrink-0 text-[var(--accent-color)]">
          <path fillRule="evenodd" d="M11.5 8a3.5 3.5 0 0 0-7 0 .75.75 0 0 1-1.5 0 5 5 0 0 1 10 0 .75.75 0 0 1-1.5 0Zm-6 0a2.5 2.5 0 0 1 5 0 .75.75 0 0 0 1.5 0 4 4 0 0 0-8 0 .75.75 0 0 0 1.5 0Zm3.5 0A1 1 0 0 0 8 7a.75.75 0 0 0 0-1.5A2.5 2.5 0 0 0 5.5 8a.75.75 0 0 0 1.5 0 1 1 0 0 1 1-1Zm-1 5.165V11.5a.75.75 0 0 0-1.5 0v1.665l-1.008.607a.75.75 0 0 0 .772 1.286L8 14.099l1.736 1.042a.75.75 0 0 0 .772-1.286l-1.008-.607V11.5a.75.75 0 0 0-1.5 0v1.665Z" clipRule="evenodd" />
        </svg>
        <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
          <span className="font-semibold text-[var(--text-primary)]">How: </span>{info.how}
        </p>
      </div>
      <div className="flex items-start gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 mt-0.5 flex-shrink-0 text-[var(--accent-color)]">
          <path fillRule="evenodd" d="M8 1.75a.75.75 0 0 1 .692.462l1.41 3.393 3.664.293a.75.75 0 0 1 .428 1.317l-2.791 2.39.853 3.569a.75.75 0 0 1-1.12.814L8 12.07l-3.136 1.918a.75.75 0 0 1-1.12-.814l.853-3.569-2.791-2.39a.75.75 0 0 1 .428-1.317l3.664-.293 1.41-3.393A.75.75 0 0 1 8 1.75Z" clipRule="evenodd" />
        </svg>
        <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
          <span className="font-semibold text-[var(--text-primary)]">Used for: </span>{info.usedFor}
        </p>
      </div>
    </div>,
    document.body
  );
}

export function InfoButton({ info }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
          open
            ? 'text-[var(--accent-color)] bg-[var(--bg-secondary)]'
            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
          <path fillRule="evenodd" d="M15 8A7 7 0 1 1 1 8a7 7 0 0 1 14 0ZM9 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM6.75 8a.75.75 0 0 0 0 1.5h.75v1.75a.75.75 0 0 0 1.5 0v-2.5A.75.75 0 0 0 8.25 8h-1.5Z" clipRule="evenodd" />
        </svg>
        Info
      </button>
      {open && (
        <InfoTooltip info={info} buttonRef={btnRef} onClose={() => setOpen(false)} />
      )}
    </>
  );
}

export default InfoTooltip;
