import React from 'react';
import { ShieldCheck, Code, Globe, ArrowDown, Sparkles } from 'lucide-react';

interface HeroSectionProps {
  onSelectTab: (tab: 'code' | 'url') => void;
  onScrollToScan: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onSelectTab,
  onScrollToScan,
}) => {
  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-6 pt-24 pb-16 z-10">
      {/* Post-Quantum Status Badge */}
      <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl mb-8 shadow-[0_0_30px_rgba(34,197,94,0.1)] group">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_8px_#22c55e]"></span>
        </span>
        <span className="text-xs font-mono font-medium text-white/80 tracking-wide uppercase">
          Post-Quantum Security Platform • NIST FIPS 203/204 Ready
        </span>
        <Sparkles className="w-3.5 h-3.5 text-indigo-400 opacity-80" />
      </div>

      {/* Main Title with Gradient Word */}
      <h1 className="text-5xl sm:text-7xl md:text-8xl font-heading font-extrabold tracking-tight text-white max-w-5xl leading-[1.05] mb-6 select-none">
        Discover. Analyze.{' '}
        <span className="gradient-text-fortify drop-shadow-2xl">
          Fortify.
        </span>
      </h1>

      {/* Subtitle */}
      <p className="text-base sm:text-lg md:text-xl text-white/60 max-w-2xl font-light leading-relaxed mb-10">
        Scan your software repositories and live endpoints for quantum-vulnerable cryptography.
        Generate standardized <span className="text-white/90 font-medium">CycloneDX 1.6 CBOMs</span> and
        deploy AI-synthesized <span className="text-indigo-300 font-medium">NIST Post-Quantum patches</span>.
      </p>

      {/* Hero Dual Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-16 w-full max-w-md justify-center">
        <button
          onClick={() => {
            onSelectTab('code');
            onScrollToScan();
          }}
          className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white text-black font-semibold text-sm hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_35px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2 group cursor-pointer"
        >
          <Code className="w-4 h-4 text-indigo-600 group-hover:rotate-6 transition-transform" />
          Upload Codebase (.ZIP)
        </button>

        <button
          onClick={() => {
            onSelectTab('url');
            onScrollToScan();
          }}
          className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.12] text-white font-semibold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all backdrop-blur-xl flex items-center justify-center gap-2 cursor-pointer"
        >
          <Globe className="w-4 h-4 text-purple-400" />
          Scan Live URL / TLS
        </button>
      </div>

      {/* Bottom Scroll Indicator */}
      <div
        onClick={onScrollToScan}
        className="flex flex-col items-center gap-2 text-white/30 hover:text-white/70 transition-colors cursor-pointer group"
      >
        <span className="text-[11px] font-mono tracking-[0.2em] uppercase">SCROLL TO DISCOVER</span>
        <div className="w-[1px] h-8 bg-white/20 relative overflow-hidden">
          <div className="w-full h-1/2 bg-indigo-400 animate-pulse absolute top-0" />
        </div>
      </div>
    </section>
  );
};
