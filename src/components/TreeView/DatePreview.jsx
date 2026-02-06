import { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { formatDateInfo } from '../../utils/dateDetector';

const DatePreview = ({ dateInfo, children }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const iconRef = useRef(null);

  const formattedInfo = formatDateInfo(dateInfo);

  const updatePosition = useCallback(() => {
    if (iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top - 8,
        left: Math.min(rect.right, window.innerWidth - 280),
      });
    }
  }, []);

  const handleMouseEnter = useCallback(() => {
    updatePosition();
    setShowPreview(true);
  }, [updatePosition]);

  const handleMouseLeave = useCallback(() => {
    setShowPreview(false);
  }, []);

  useEffect(() => {
    if (showPreview) {
      const handleScroll = () => updatePosition();
      window.addEventListener('scroll', handleScroll, true);
      return () => window.removeEventListener('scroll', handleScroll, true);
    }
  }, [showPreview, updatePosition]);

  const previewPopup = showPreview && createPortal(
    <div
      className="fixed z-[9999] p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg shadow-lg text-sm"
      style={{
        top: position.top,
        left: position.left,
        transform: 'translateY(-100%)',
        minWidth: '200px',
      }}
    >
      <div className="space-y-2">
        <div>
          <div className="text-[var(--text-secondary)] text-xs mb-0.5">Format Type</div>
          <div className="text-[var(--text-primary)] font-medium">{formattedInfo.type}</div>
        </div>
        <div>
          <div className="text-[var(--text-secondary)] text-xs mb-0.5">Local Time</div>
          <div className="text-[var(--text-primary)]">{formattedInfo.formatted}</div>
        </div>
        <div>
          <div className="text-[var(--text-secondary)] text-xs mb-0.5">ISO 8601</div>
          <div className="text-[var(--text-primary)] font-mono text-xs">{formattedInfo.iso}</div>
        </div>
      </div>
    </div>,
    document.body
  );

  return (
    <span className="inline-flex items-center gap-1">
      {children}
      <span
        ref={iconRef}
        className="text-[var(--text-secondary)] text-xs opacity-60 cursor-pointer flex-shrink-0"
        title="Date/timestamp - hover for details"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        📅
      </span>

      {previewPopup}
    </span>
  );
};

export default DatePreview;
