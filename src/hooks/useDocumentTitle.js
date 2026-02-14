import { useEffect } from 'react';

export function useDocumentTitle(title) {
  useEffect(() => {
    const prev = document.title;
    document.title = title ? `${title} | Stingr` : 'Stingr - Free Private Developer Tools';
    return () => { document.title = prev; };
  }, [title]);
}
