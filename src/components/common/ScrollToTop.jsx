import { useState, useEffect, useCallback } from 'react';

function ScrollToTop({ containerRef }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const container = containerRef?.current;
    if (!container) return;

    const handleScroll = () => {
      setIsVisible(container.scrollTop > 100);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [containerRef]);

  const scrollToTop = useCallback(() => {
    const container = containerRef?.current;
    if (container) {
      container.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [containerRef]);

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="absolute bottom-3 right-6 w-7 h-7 flex items-center justify-center rounded-md bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-color)] hover:bg-[var(--bg-primary)] transition-all shadow-sm z-10"
      aria-label="Scroll to top"
      title="Scroll to top"
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 15l-6-6-6 6"/>
      </svg>
    </button>
  );
}

export default ScrollToTop;
