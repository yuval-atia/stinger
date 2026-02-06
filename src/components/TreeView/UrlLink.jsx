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
        className="text-[var(--text-secondary)] text-xs opacity-60 cursor-pointer ml-1"
        title="Click to open URL in new tab"
      >
        🔗
      </span>
    </span>
  );
};

export default UrlLink;
