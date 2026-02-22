import { createContext, useContext, useState, useCallback } from 'react';
import InternalToast from './components/InternalToast.jsx';

const TreeContext = createContext(null);

export function TreeProvider({ onNotify, onCopy, children }) {
  const [toasts, setToasts] = useState([]);

  const showNotification = useCallback((message) => {
    if (onNotify) {
      onNotify(message);
      return;
    }
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2000);
  }, [onNotify]);

  const handleCopy = useCallback((info) => {
    if (onCopy) {
      onCopy(info);
    }
  }, [onCopy]);

  return (
    <TreeContext.Provider value={{ showNotification, onCopy: handleCopy }}>
      {children}
      {!onNotify && <InternalToast toasts={toasts} />}
    </TreeContext.Provider>
  );
}

export function useTreeContext() {
  const context = useContext(TreeContext);
  if (!context) {
    throw new Error('useTreeContext must be used within a TreeProvider');
  }
  return context;
}
