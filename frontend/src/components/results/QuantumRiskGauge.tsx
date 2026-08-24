import React, { useEffect, useState } from 'react';
import { ShieldAlert, ShieldCheck, Hourglass, AlertTriangle } from 'lucide-react';

interface QuantumRiskGaugeProps {
  score: number;
  shorCount: number;
  groverCount: number;
  classicalCount: number;
  safeCount: number;
  hndlRating: string;
}

export const QuantumRiskGauge: React.FC<QuantumRiskGaugeProps> = ({
  score,
  shorCount,
  groverCount,
  classicalCount,
  safeCount,
  hndlRating,
}) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1200;
    const stepTime = 20;
    const totalSteps = duration / stepTime;
    const increment = score / totalSteps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= score) {
        setAnimatedScore(score);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [score]);

  // Circumference calculation for radial gauge
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (animatedScore / 100) * circumference;

  const getThreatBadge = () => {
    if (score < 40) {
      return {
        label: 'CRITICAL — Immediate PQC Action Required',
        color: 'bg-red-500/10 border-red-500/30 text-red-400 glow-critical',
        icon: <ShieldAlert className="w-4 h-4 text-red-400" />
      };
    } else if (score < 75) {
      return {
        label: 'ELEVATED — Upgrade 128-bit & Deprecated Primitives',
        color: 'bg-amber-500/10 border-amber-500/30 text-amber-400 glow-grover',
        icon: <AlertTriangle className="w-4 h-4 text-amber-400" />
      };
    } else {
      return {
        label: 'QUANTUM-RESISTANT — NIST PQC Standards Compliant',
        color: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 glow-safe',
        icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />
      };
    }
  };

  const badge = getThreatBadge();

  return (
    <div className="glass-panel p-6 sm:p-8 relative overflow-hidden">
      {/* Background Accent Ambient Glow */}
      <div
        className={`absolute top-0 right-0 w-80 h-80 rounded-full blur-[100px] opacity-20 pointer-events-none ${
          score < 50 ? 'bg-red-600' : 'bg-emerald-500'
        }`}
      />

      <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
        {/* Left: SVG Radial Gauge */}
        <div className="flex flex-col items-center text-center">
          <div className="relative w-52 h-52 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
              {/* Background Ring */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                className="text-white/[0.06]"
                strokeWidth="14"
                stroke="currentColor"
                fill="transparent"
              />
              {/* Animated Value Ring */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                strokeWidth="14"
                strokeDasharray={circumference}
                strokeDashoffset={strokeOffset}
                strokeLinecap="round"
                stroke={score < 40 ? '#ff0040' : score < 75 ? '#ffaa00' : '#00ff88'}
                fill="transparent"
                className="transition-all duration-1000 ease-out"
                style={{
                  filter: `drop-shadow(0 0 12px ${
                    score < 40 ? 'rgba(255, 0, 64, 0.6)' : score < 75 ? 'rgba(255, 170, 0, 0.5)' : 'rgba(0, 255, 136, 0.5)'
                  })`
                }}
              />
            </svg>

            {/* Centered Score */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-5xl font-heading font-extrabold text-white tracking-tight">
                {animatedScore}%
              </span>
              <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest mt-1">
                Readiness Index
              </span>
            </div>
          </div>

          <div className="text-[11px] text-white/40 font-mono mt-1 text-center max-w-[220px]">
            Heuristic score based on discovered cryptographic assets and assigned risk categories.
          </div>

          {/* Threat Level Badge */}
          <div className={`mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-semibold ${badge.color}`}>
            {badge.icon}
            <span>{badge.label}</span>
          </div>
        </div>

        {/* Right: Quantum Breakdown Bars & HNDL Timeline */}
        <div className="flex-1 w-full space-y-4">
          <h3 className="text-sm font-heading font-semibold text-white/90 uppercase tracking-wider mb-2">
            Threat & Quantum Vulnerability Spectrum
          </h3>

          {/* Shor's Impact Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-red-400 flex items-center gap-1.5 font-semibold">
                <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ff0040]" />
                Shor's Algorithm (Public Key Factorization / Discrete Log):
              </span>
              <span className="text-white font-bold">{shorCount} Asset{shorCount !== 1 ? 's' : ''}</span>
            </div>
            <div className="h-2 w-full bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-500 to-pink-500 transition-all duration-1000 shadow-[0_0_10px_#ff0040]"
                style={{ width: `${Math.min(100, (shorCount / Math.max(1, shorCount + groverCount + safeCount + classicalCount)) * 100)}%` }}
              />
            </div>
          </div>

          {/* Grover's Impact Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-amber-400 flex items-center gap-1.5 font-semibold">
                <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#ffaa00]" />
                Grover's Search (128-bit Symmetric / Preimage Reduction):
              </span>
              <span className="text-white font-bold">{groverCount} Asset{groverCount !== 1 ? 's' : ''}</span>
            </div>
            <div className="h-2 w-full bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-1000 shadow-[0_0_10px_#ffaa00]"
                style={{ width: `${Math.min(100, (groverCount / Math.max(1, shorCount + groverCount + safeCount + classicalCount)) * 100)}%` }}
              />
            </div>
          </div>

          {/* Classical Deprecated */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-zinc-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-zinc-500" />
                Classical Deprecated (MD5 / SHA-1 / DES / ECB):
              </span>
              <span className="text-white font-bold">{classicalCount} Asset{classicalCount !== 1 ? 's' : ''}</span>
            </div>
            <div className="h-2 w-full bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full bg-zinc-400 transition-all duration-1000"
                style={{ width: `${Math.min(100, (classicalCount / Math.max(1, shorCount + groverCount + safeCount + classicalCount)) * 100)}%` }}
              />
            </div>
          </div>

          {/* Quantum Resistant */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#00ff88]" />
                Quantum-Resistant (ML-KEM / ML-DSA / AES-256 / SHA-512):
              </span>
              <span className="text-white font-bold">{safeCount} Asset{safeCount !== 1 ? 's' : ''}</span>
            </div>
            <div className="h-2 w-full bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-400 transition-all duration-1000 shadow-[0_0_10px_#00ff88]"
                style={{ width: `${Math.min(100, (safeCount / Math.max(1, shorCount + groverCount + safeCount + classicalCount)) * 100)}%` }}
              />
            </div>
          </div>

          {/* HNDL Exposure Card */}
          <div className="mt-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
                <Hourglass className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white">Harvest Now, Decrypt Later (HNDL) Threat Exposure</div>
                <div className="text-[11px] text-white/50 font-mono mt-0.5">{hndlRating}</div>
              </div>
            </div>
            <div className="hidden sm:block text-right">
              <div className="text-xs font-mono text-indigo-300">Q-Day Horizon</div>
              <div className="text-sm font-bold text-white">2029–2034</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
