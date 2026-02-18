import { useState, useRef } from 'react';
import SharePopover from './SharePopover';

function ShareButton({ shareData }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);

  return (
    <>
      <button
        ref={btnRef}
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-3 py-1 text-sm rounded border transition-colors ${
          open
            ? 'bg-[var(--accent-color)] border-[var(--accent-color)] text-white'
            : 'bg-[var(--bg-secondary)] border-[var(--border-color)] hover:bg-[var(--border-color)] text-[var(--text-primary)]'
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-4 h-4 ${open ? '' : 'text-[var(--accent-color)]'}`}>
          <path d="M13 4.5a2.5 2.5 0 1 1 .702 1.737L6.97 9.604a2.518 2.518 0 0 1 0 .799l6.733 3.365a2.5 2.5 0 1 1-.671 1.341l-6.733-3.365a2.5 2.5 0 1 1 0-3.482l6.733-3.366A2.52 2.52 0 0 1 13 4.5Z" />
        </svg>
        Share
      </button>
      {open && (
        <SharePopover
          buttonRef={btnRef}
          onClose={() => setOpen(false)}
          shareData={shareData}
        />
      )}
    </>
  );
}

export default ShareButton;
