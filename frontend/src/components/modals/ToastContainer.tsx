import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { ToastMessage } from '../../types/scan';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed top-6 right-6 z-[10000] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const getBorderAndIcon = () => {
          switch (toast.type) {
            case 'success':
              return { border: 'border-l-4 border-l-emerald-500', icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" /> };
            case 'warning':
              return { border: 'border-l-4 border-l-amber-500', icon: <AlertTriangle className="w-4 h-4 text-amber-400" /> };
            case 'error':
              return { border: 'border-l-4 border-l-red-500', icon: <AlertCircle className="w-4 h-4 text-red-400" /> };
            default:
              return { border: 'border-l-4 border-l-indigo-500', icon: <Info className="w-4 h-4 text-indigo-400" /> };
          }
        };

        const { border, icon } = getBorderAndIcon();

        return (
          <div
            key={toast.id}
            className={`glass-panel p-4 flex items-start gap-3 shadow-2xl border border-white/[0.08] ${border} pointer-events-auto animate-slideIn`}
          >
            <div className="mt-0.5">{icon}</div>
            <div className="flex-1">
              <div className="text-xs font-bold text-white">{toast.title}</div>
              <div className="text-[11px] text-white/60 font-sans mt-0.5">{toast.message}</div>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-white/40 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
