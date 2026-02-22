import { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

const Modal = ({ isOpen, onClose, title, children }) => {
  const handleEscape = useCallback((e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = '';
      };
    }
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  return createPortal(
    <div className="sjt">
      <div
        className="sjt-fixed sjt-inset-0 sjt-z-[9999] sjt-flex sjt-items-center sjt-justify-center sjt-p-4"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
        onClick={handleBackdropClick}
      >
        <div
          className="sjt-rounded-lg sjt-shadow-2xl sjt-w-full sjt-flex sjt-flex-col"
          style={{
            backgroundColor: 'var(--sjt-bg-primary)',
            border: '1px solid var(--sjt-border-color)',
            maxWidth: '56rem',
            maxHeight: '80vh',
          }}
        >
          {/* Header */}
          <div
            className="sjt-flex sjt-items-center sjt-justify-between sjt-px-4 sjt-py-3"
            style={{ borderBottom: '1px solid var(--sjt-border-color)' }}
          >
            <h2
              className="sjt-text-lg sjt-font-semibold"
              style={{ color: 'var(--sjt-text-primary)' }}
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              className="sjt-p-1 sjt-rounded sjt-transition-colors"
              style={{ color: 'var(--sjt-text-secondary)' }}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--sjt-bg-secondary)'; e.currentTarget.style.color = 'var(--sjt-text-primary)'; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = 'var(--sjt-text-secondary)'; }}
              aria-label="Close modal"
            >
              <svg className="sjt-w-5 sjt-h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="sjt-flex-1 sjt-overflow-auto sjt-p-4">
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
