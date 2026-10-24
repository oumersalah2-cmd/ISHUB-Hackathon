import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(({ title, message, type = 'info', duration = 5000 }) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    const newToast = { id, title, message, type };

    setToasts((prev) => {
      // Prevent stacking duplicate identical toasts
      if (prev.some((t) => t.title === title && t.message === message)) {
        return prev;
      }
      return [...prev, newToast];
    });

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    return id;
  }, [removeToast]);

  const success = useCallback((message, title = 'Success') => {
    return addToast({ title, message, type: 'success' });
  }, [addToast]);

  const error = useCallback((message, title = 'Error Occurred') => {
    return addToast({ title, message, type: 'error', duration: 7000 });
  }, [addToast]);

  const info = useCallback((message, title = 'Notice') => {
    return addToast({ title, message, type: 'info' });
  }, [addToast]);

  const warning = useCallback((message, title = 'Attention') => {
    return addToast({ title, message, type: 'warning', duration: 6000 });
  }, [addToast]);

  const renderIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="toast-icon" size={18} />;
      case 'error':
        return <AlertCircle className="toast-icon" size={18} />;
      case 'warning':
        return <AlertTriangle className="toast-icon" size={18} />;
      default:
        return <Info className="toast-icon" size={18} />;
    }
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast, success, error, info, warning }}>
      {children}
      <div className="toast-container" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`} role="alert">
            {renderIcon(toast.type)}
            <div className="toast-content">
              {toast.title && <div className="toast-title">{toast.title}</div>}
              <div className="toast-message">{toast.message}</div>
            </div>
            <button
              className="toast-close"
              onClick={() => removeToast(toast.id)}
              aria-label="Close notification"
            >
              <X size={15} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
