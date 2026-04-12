import { createContext, useCallback, useContext, useState } from 'react';
import {
  RiCloseLine,
  RiCheckLine,
  RiErrorWarningLine,
  RiInformationLine,
} from '@remixicon/react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let nextId = 0;

function removeToast(
  id: string,
  setter: React.Dispatch<React.SetStateAction<Toast[]>>
) {
  setter((prev) => prev.filter((t) => t.id !== id));
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = String(++nextId);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => removeToast(id, setToasts), 4000);
  }, []);

  const dismiss = useCallback((id: string) => {
    removeToast(id, setToasts);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded shadow-lg text-xs font-medium animate-slide-up
              ${t.type === 'success' ? 'bg-emerald-600 text-white' : ''}
              ${t.type === 'error' ? 'bg-red-500 text-white' : ''}
              ${t.type === 'info' ? 'bg-[#1c1e2a] text-white' : ''}
            `}
          >
            {t.type === 'success' && <RiCheckLine size={16} />}
            {t.type === 'error' && <RiErrorWarningLine size={16} />}
            {t.type === 'info' && <RiInformationLine size={16} />}
            <span className="flex-1">{t.message}</span>
            <button
              onClick={() => dismiss(t.id)}
              className="p-0.5 rounded hover:bg-white/20 transition-colors"
            >
              <RiCloseLine size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
