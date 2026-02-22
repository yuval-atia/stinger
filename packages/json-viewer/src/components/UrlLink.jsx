import { useCallback } from 'react';

const UrlLink = ({ url, children }) => {
  const handleClick = useCallback(() => {
    window.open(url, '_blank', 'noopener,noreferrer');
  }, [url]);

  return (
    <span>
      {children}
      <span
        onClick={handleClick}
        className="sjt-text-xs sjt-cursor-pointer sjt-ml-1"
        style={{ color: 'var(--sjt-text-secondary)', opacity: 0.6 }}
        title="Click to open URL in new tab"
      >
        🔗
      </span>
    </span>
  );
};

export default UrlLink;
