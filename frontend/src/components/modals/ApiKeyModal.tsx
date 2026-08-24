import React, { useState } from 'react';
import { X, Key, Shield, Sparkles, Check, Eye, EyeOff } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  onSaveApiKey,
}) => {
  const [inputKey, setInputKey] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveApiKey(inputKey.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fadeIn">
      <div className="glass-panel w-full max-w-md p-6 relative border border-white/[0.12] shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Key className="w-4 h-4" />
            </div>
            <h3 className="text-base font-heading font-bold text-white tracking-tight">
              Google Gemini API Configuration
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/[0.04] text-white/50 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="my-5 space-y-4">
          <p className="text-xs text-white/60 font-sans leading-relaxed">
            Configure your free Google AI Studio API key to enable dynamic Gemini 1.5/2.0 Flash remediation. If left empty, Aegis-Q automatically utilizes verified deterministic Post-Quantum templates.
          </p>

          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full pl-3.5 pr-10 py-2.5 bg-white/[0.03] border border-white/[0.08] focus:border-purple-400 rounded-xl text-xs font-mono text-white placeholder-white/30 focus:outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/20 text-[11px] text-purple-300 flex items-start gap-2">
            <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Get a free tier API key instantly at{' '}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-white"
              >
                aistudio.google.com
              </a>
            </span>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] flex items-center justify-center gap-2 cursor-pointer"
        >
          <Check className="w-4 h-4" />
          Save Key & Activate AI
        </button>
      </div>
    </div>
  );
};
