import { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { formatDateInfo } from '../utils/dateDetector.js';

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
    <div className="sjt">
      <div
        className="sjt-fixed sjt-z-[9999] sjt-p-3 sjt-rounded-lg sjt-shadow-lg sjt-text-sm"
        style={{
          top: position.top,
          left: position.left,
          transform: 'translateY(-100%)',
          minWidth: '200px',
          backgroundColor: 'var(--sjt-bg-secondary)',
          border: '1px solid var(--sjt-border-color)',
        }}
      >
        <div className="sjt-space-y-2">
          <div>
            <div className="sjt-text-xs" style={{ color: 'var(--sjt-text-secondary)', marginBottom: '2px' }}>Format Type</div>
            <div className="sjt-font-medium" style={{ color: 'var(--sjt-text-primary)' }}>{formattedInfo.type}</div>
          </div>
          <div>
            <div className="sjt-text-xs" style={{ color: 'var(--sjt-text-secondary)', marginBottom: '2px' }}>Local Time</div>
            <div style={{ color: 'var(--sjt-text-primary)' }}>{formattedInfo.formatted}</div>
          </div>
          <div>
            <div className="sjt-text-xs" style={{ color: 'var(--sjt-text-secondary)', marginBottom: '2px' }}>ISO 8601</div>
            <div className="sjt-font-mono sjt-text-xs" style={{ color: 'var(--sjt-text-primary)' }}>{formattedInfo.iso}</div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );

  return (
    <span className="sjt-inline-flex sjt-items-center sjt-gap-1">
      {children}
      <span
        ref={iconRef}
        className="sjt-text-xs sjt-cursor-pointer sjt-flex-shrink-0"
        style={{ color: 'var(--sjt-text-secondary)', opacity: 0.6 }}
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
