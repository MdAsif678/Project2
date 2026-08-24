import React from 'react';
import { Check, Loader2, AlertCircle } from 'lucide-react';
import { TlsHandshakeStep } from '../../types/scan';

interface TlsHandshakeVizProps {
  steps: TlsHandshakeStep[];
  currentStepIndex: number;
}

export const TlsHandshakeViz: React.FC<TlsHandshakeVizProps> = ({
  steps,
  currentStepIndex,
}) => {
  const defaultSteps = [
    { step_number: 1, name: "ClientHello", detail: "Proposing TLS 1.3 / 1.2 Cipher Suites" },
    { step_number: 2, name: "ServerHello", detail: "Negotiating Protocol & Selected Cipher" },
    { step_number: 3, name: "Certificate", detail: "Validating X.509 Chain & Public Key Size" },
    { step_number: 4, name: "Key Exchange", detail: "Evaluating Asymmetric Shor Vulnerability" },
    { step_number: 5, name: "Finished", detail: "Cryptographic Analysis Complete" }
  ];

  return (
    <div className="w-full py-6 px-4">
      <div className="flex items-center justify-between relative max-w-2xl mx-auto">
        {/* Connecting Progress Line */}
        <div className="absolute top-5 left-6 right-6 h-[2px] bg-white/[0.08] -z-0">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 transition-all duration-700"
            style={{
              width: `${Math.min(100, Math.max(0, (currentStepIndex / 4) * 100))}%`
            }}
          />
        </div>

        {/* Step Nodes */}
        {defaultSteps.map((step, idx) => {
          const isCompleted = idx < currentStepIndex;
          const isActive = idx === currentStepIndex;
          const isPending = idx > currentStepIndex;

          return (
            <div key={step.step_number} className="flex flex-col items-center relative z-10">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-mono text-xs font-semibold transition-all duration-500 backdrop-blur-xl border ${
                  isCompleted
                    ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-400 shadow-[0_0_15px_rgba(0,255,136,0.3)]'
                    : isActive
                    ? 'bg-indigo-600/30 border-indigo-400 text-white shadow-[0_0_20px_rgba(99,102,241,0.5)] scale-110'
                    : 'bg-[#0a0a10]/80 border-white/[0.08] text-white/40'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : isActive ? (
                  <Loader2 className="w-4 h-4 text-indigo-300 animate-spin" />
                ) : (
                  step.step_number
                )}
              </div>

              {/* Step Title */}
              <span
                className={`mt-2 text-xs font-mono font-medium transition-colors ${
                  isActive ? 'text-indigo-300' : isCompleted ? 'text-white/80' : 'text-white/30'
                }`}
              >
                {step.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* Active Step Live Detail Bar */}
      {currentStepIndex >= 0 && currentStepIndex < defaultSteps.length && (
        <div className="mt-4 text-center">
          <span className="text-xs font-mono text-white/60 bg-white/[0.02] border border-white/[0.06] px-3 py-1 rounded-full">
            ▶ {defaultSteps[currentStepIndex].detail}
          </span>
        </div>
      )}
    </div>
  );
};
