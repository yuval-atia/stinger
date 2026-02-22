import { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';

const ImagePreview = ({ url, children }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [imageState, setImageState] = useState('idle');
  const [errorType, setErrorType] = useState(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const timeoutRef = useRef(null);
  const iconRef = useRef(null);

  const updatePosition = useCallback(() => {
    if (iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top - 8,
        left: Math.min(rect.right, window.innerWidth - 220),
      });
    }
  }, []);

  const handleMouseEnter = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      updatePosition();
      setShowPreview(true);
      if (imageState === 'idle') {
        setImageState('loading');
      }
    }, 300);
  }, [imageState, updatePosition]);

  const handleMouseLeave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setShowPreview(false);
  }, []);

  const handleImageLoad = useCallback(() => {
    setImageState('loaded');
  }, []);

  const handleImageError = useCallback(() => {
    const isCrossOrigin = !url.startsWith('data:') && !url.startsWith(window.location.origin);
    if (isCrossOrigin) {
      setErrorType('cors');
    } else {
      setErrorType('load');
    }
    setImageState('error');
  }, [url]);

  useEffect(() => {
    if (showPreview) {
      const handleScroll = () => updatePosition();
      window.addEventListener('scroll', handleScroll, true);
      return () => window.removeEventListener('scroll', handleScroll, true);
    }
  }, [showPreview, updatePosition]);

  const renderPreviewContent = () => {
    if (imageState === 'loading') {
      return (
        <div
          className="sjt-flex sjt-items-center sjt-justify-center sjt-text-xs"
          style={{ width: '8rem', height: '5rem', color: 'var(--sjt-text-secondary)' }}
        >
          Loading...
        </div>
      );
    }

    if (imageState === 'error') {
      return (
        <div className="sjt-flex sjt-flex-col sjt-items-center sjt-justify-center sjt-p-2 sjt-text-xs sjt-text-center" style={{ width: '10rem' }}>
          <span style={{ color: '#f87171' }} className="sjt-mb-1">Failed to load image</span>
          <span style={{ color: 'var(--sjt-text-secondary)' }}>
            {errorType === 'cors'
              ? 'CORS policy blocked the request'
              : 'Image could not be loaded'}
          </span>
        </div>
      );
    }

    return null;
  };

  const previewPopup = showPreview && createPortal(
    <div className="sjt">
      <div
        className="sjt-fixed sjt-z-[9999] sjt-p-1 sjt-rounded-lg sjt-shadow-lg"
        style={{
          top: position.top,
          left: position.left,
          transform: 'translateY(-100%)',
          minWidth: '80px',
          backgroundColor: 'var(--sjt-bg-secondary)',
          border: '1px solid var(--sjt-border-color)',
        }}
      >
        <img
          src={url}
          alt="Preview"
          loading="lazy"
          onLoad={handleImageLoad}
          onError={handleImageError}
          className={`sjt-rounded ${imageState === 'loaded' ? 'sjt-block' : 'sjt-hidden'}`}
          style={{ maxWidth: '200px', maxHeight: '150px', objectFit: 'contain' }}
        />
        {imageState !== 'loaded' && renderPreviewContent()}
      </div>
    </div>,
    document.body
  );

  return (
    <span className="sjt-inline-flex sjt-items-center sjt-gap-1">
      <span className="sjt-truncate" style={{ maxWidth: '300px' }}>{children}</span>
      <span
        ref={iconRef}
        className="sjt-text-xs sjt-cursor-pointer sjt-flex-shrink-0"
        style={{ color: 'var(--sjt-text-secondary)', opacity: 0.6 }}
        title="Image URL - hover to preview"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        🖼️
      </span>
      {previewPopup}
    </span>
  );
};

export default ImagePreview;
