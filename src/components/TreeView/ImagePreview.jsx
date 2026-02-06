import { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';

const ImagePreview = ({ url, children }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [imageState, setImageState] = useState('idle'); // idle, loading, loaded, error
  const [errorType, setErrorType] = useState(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const timeoutRef = useRef(null);
  const iconRef = useRef(null);

  const updatePosition = useCallback(() => {
    if (iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top - 8, // Position above the icon
        left: Math.min(rect.right, window.innerWidth - 220), // Keep within viewport
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

  // Update position on scroll
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
        <div className="flex items-center justify-center w-32 h-20 text-xs text-[var(--text-secondary)]">
          Loading...
        </div>
      );
    }

    if (imageState === 'error') {
      return (
        <div className="flex flex-col items-center justify-center w-40 p-2 text-xs text-center">
          <span className="text-red-400 mb-1">Failed to load image</span>
          <span className="text-[var(--text-secondary)]">
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
    <div
      className="fixed z-[9999] p-1 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg shadow-lg"
      style={{
        top: position.top,
        left: position.left,
        transform: 'translateY(-100%)',
        minWidth: '80px',
      }}
    >
      <img
        src={url}
        alt="Preview"
        loading="lazy"
        onLoad={handleImageLoad}
        onError={handleImageError}
        className={`max-w-[200px] max-h-[150px] object-contain rounded ${
          imageState === 'loaded' ? 'block' : 'hidden'
        }`}
      />
      {imageState !== 'loaded' && renderPreviewContent()}
    </div>,
    document.body
  );

  return (
    <span className="inline-flex items-center gap-1">
      <span className="truncate max-w-[300px]">{children}</span>
      <span
        ref={iconRef}
        className="text-[var(--text-secondary)] text-xs opacity-60 cursor-pointer flex-shrink-0"
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
