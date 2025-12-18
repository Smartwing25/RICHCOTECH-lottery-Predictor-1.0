import { useState, useCallback } from 'react';
import Toast from '../components/Toast';
import { ToastContext } from './ToastContextInstance';

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const show = useCallback((message, type = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message, type }]);
    return id;
  }, []);

  const close = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="fixed top-4 right-4 flex flex-col gap-3 z-50">
        {toasts.map((t) => (
          <Toast key={t.id} {...t} onClose={close} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// useToast moved to a separate file to satisfy Fast Refresh rule
