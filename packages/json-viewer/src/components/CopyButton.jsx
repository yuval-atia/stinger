import { useState, useRef } from 'react';

function CopyButton({ onClick, tooltip, children, size = 'md' }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);

  const sizeClasses = {
    sm: 'sjt-w-5 sjt-h-5 sjt-text-xs',
    md: 'sjt-w-6 sjt-h-6 sjt-text-sm',
    lg: 'sjt-w-8 sjt-h-8 sjt-text-base',
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
        className={`${sizeClasses[size]} sjt-flex sjt-items-center sjt-justify-center sjt-rounded sjt-transition-colors`}
        style={{
          color: 'var(--sjt-text-secondary)',
        }}
        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--sjt-bg-secondary)'; e.currentTarget.style.color = 'var(--sjt-text-primary)'; }}
        onMouseOut={(e) => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = 'var(--sjt-text-secondary)'; }}
      >
        {children}
      </button>
      {showTooltip && tooltip && (
        <div
          className="sjt-fixed -sjt-translate-x-1/2 -sjt-translate-y-full sjt-px-2 sjt-py-1 sjt-text-xs sjt-rounded sjt-whitespace-nowrap sjt-pointer-events-none sjt-z-[9999]"
          style={{
            top: tooltipPos.top,
            left: tooltipPos.left,
            backgroundColor: 'var(--sjt-text-primary)',
            color: 'var(--sjt-bg-primary)',
          }}
        >
          {tooltip}
          <div
            className="sjt-absolute sjt-top-full sjt-left-1/2 -sjt-translate-x-1/2"
            style={{ borderWidth: '4px', borderStyle: 'solid', borderColor: 'var(--sjt-text-primary) transparent transparent transparent' }}
          />
        </div>
      )}
    </>
  );
}

export default CopyButton;
