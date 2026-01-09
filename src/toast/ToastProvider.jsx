import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((toast) => {
    const id = ++idCounter;
    setToasts((prev) => [...prev, { id, ...toast }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, toast.duration || 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={
              'rounded-md px-4 py-2 text-sm shadow-lg border ' +
              (t.type === 'error'
                ? 'bg-red-600/90 text-white border-red-500'
                : t.type === 'success'
                ? 'bg-emerald-600/90 text-white border-emerald-500'
                : 'bg-slate-800/90 text-slate-50 border-slate-700')
            }
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
