import React, { useState, useEffect } from 'react';
import { Shield, Sparkles, Key, Download, HelpCircle, Activity } from 'lucide-react';

interface NavbarProps {
  status: 'idle' | 'scanning' | 'complete' | 'critical';
  onOpenApiKey: () => void;
  onOpenExport: () => void;
  onOpenShortcuts: () => void;
  activeSection: string;
  onNavigate: (section: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  status,
  onOpenApiKey,
  onOpenExport,
  onOpenShortcuts,
  activeSection,
  onNavigate,
}) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getStatusOrbColor = () => {
    switch (status) {
      case 'scanning':
        return 'bg-amber-400 shadow-[0_0_12px_#ffaa00] animate-ping';
      case 'complete':
        return 'bg-emerald-400 shadow-[0_0_12px_#00ff88]';
      case 'critical':
        return 'bg-red-500 shadow-[0_0_15px_#ff0040] animate-pulse';
      default:
        return 'bg-indigo-500 shadow-[0_0_10px_#6366f1]';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'scanning':
        return 'Scanning Cryptography...';
      case 'complete':
        return 'Inventory Fortified';
      case 'critical':
        return 'Quantum Risk Detected';
      default:
        return 'Ready to Scan';
    }
  };

  const navLinks = [
    { id: 'scan-hub', label: 'Scan Hub' },
    { id: 'cbom-explorer', label: 'CBOM Explorer' },
    { id: 'threat-matrix', label: 'Threat Matrix' },
    { id: 'tls-inspector', label: 'TLS Inspector' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-[#050508]/85 backdrop-blur-2xl border-b border-white/[0.06] py-3.5 shadow-2xl'
          : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={() => onNavigate('hero')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-[1px] shadow-[0_0_20px_rgba(99,102,241,0.3)]">
            <div className="w-full h-full bg-[#050508] rounded-[11px] flex items-center justify-center group-hover:bg-opacity-80 transition-all">
              <Shield className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div>
            <div className="font-heading font-bold text-xl tracking-tight text-white flex items-center gap-2">
              AEGIS-Q
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/20">
                PQC 1.6
              </span>
            </div>
          </div>
        </div>

        {/* Center Navigation */}
        <div className="hidden md:flex items-center gap-1 bg-white/[0.03] border border-white/[0.06] rounded-full p-1.5 backdrop-blur-xl">
          {navLinks.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <button
                key={link.id}
                onClick={() => onNavigate(link.id)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 relative ${
                  isActive
                    ? 'text-white bg-white/[0.08] shadow-sm'
                    : 'text-white/60 hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[2px] bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Status Orb Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-xs font-mono">
            <span className={`w-2.5 h-2.5 rounded-full ${getStatusOrbColor()}`} />
            <span className="text-white/70">{getStatusText()}</span>
          </div>

          {/* Export Report Trigger */}
          <button
            onClick={onOpenExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-medium text-white/90 hover:text-white transition-all shadow-sm"
            title="Export CycloneDX CBOM & Audit Report"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Export CBOM</span>
          </button>

          {/* Gemini AI Key Button */}
          <button
            onClick={onOpenApiKey}
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white/70 hover:text-white transition-all"
            title="Configure Gemini API Key"
          >
            <Key className="w-4 h-4 text-purple-400" />
          </button>

          {/* Shortcuts Help */}
          <button
            onClick={onOpenShortcuts}
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white/50 hover:text-white transition-all"
            title="Keyboard Shortcuts (?)"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </nav>
  );
};
