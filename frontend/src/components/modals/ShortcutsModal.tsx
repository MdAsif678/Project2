import React from 'react';
import { X, Command, HelpCircle } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Ctrl / Cmd + K', action: 'Focus Quick Scan Hub' },
    { key: 'Ctrl / Cmd + E', action: 'Open Export CBOM Modal' },
    { key: 'Esc', action: 'Close any active modal overlay' },
    { key: '?', action: 'Toggle this keyboard shortcuts dialog' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fadeIn">
      <div className="glass-panel w-full max-w-sm p-6 relative border border-white/[0.12] shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <Command className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-heading font-bold text-white uppercase tracking-wider">
              Keyboard Shortcuts
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-white/40 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 my-5">
          {shortcuts.map((sc, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <span className="text-white/60">{sc.action}</span>
              <kbd className="px-2 py-1 rounded bg-white/[0.06] border border-white/[0.1] font-mono text-[10px] text-indigo-300">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-mono text-white/70 hover:text-white transition-all"
        >
          Got it
        </button>
      </div>
    </div>
  );
};
