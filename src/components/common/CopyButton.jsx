import { useState, useRef } from 'react';

function CopyButton({ onClick, tooltip, children, size = 'md' }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);

  const sizeClasses = {
    sm: 'w-5 h-5 text-xs',
    md: 'w-6 h-6 text-sm',
    lg: 'w-8 h-8 text-base',
  };

  const handleMouseEnter = () => {
    if (buttonRef.current && tooltip) {
      const rect = buttonRef.current.getBoundingClientRect();
      setTooltipPos({
        top: rect.top - 4,
        left: rect.left + rect.width / 2,
      });
      setShowTooltip(true);
    }
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`${sizeClasses[size]} flex items-center justify-center rounded hover:bg-[var(--bg-secondary)] transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]`}
      >
        {children}
      </button>
      {showTooltip && tooltip && (
        <div
          className="fixed -translate-x-1/2 -translate-y-full px-2 py-1 text-xs bg-[var(--text-primary)] text-[var(--bg-primary)] rounded whitespace-nowrap pointer-events-none z-[9999]"
          style={{ top: tooltipPos.top, left: tooltipPos.left }}
        >
          {tooltip}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[var(--text-primary)]" />
        </div>
      )}
    </>
  );
}

export default CopyButton;
