import React from 'react';
import { Shield, ExternalLink, Github, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="relative z-10 border-t border-white/[0.06] bg-[#050508]/80 backdrop-blur-2xl mt-24 py-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        {/* Brand Column */}
        <div className="md:col-span-1 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-[1px]">
              <div className="w-full h-full bg-[#050508] rounded-[11px] flex items-center justify-center">
                <Shield className="w-4 h-4 text-indigo-400" />
              </div>
            </div>
            <span className="font-heading font-bold text-lg text-white">AEGIS-Q</span>
          </div>
          <p className="text-xs text-white/50 font-light leading-relaxed">
            Post-Quantum Cryptographic Discovery, Automated CycloneDX v1.6 CBOM Generation & NIST PQC Migration Platform.
          </p>
          <div className="text-[11px] font-mono text-indigo-300">
            Smart India Hackathon 2024–2026 (SIH26164)
          </div>
        </div>

        {/* NIST Standards */}
        <div className="space-y-2.5">
          <div className="text-xs font-mono font-semibold uppercase text-white/80 tracking-wider">
            NIST PQC Standards
          </div>
          <ul className="space-y-1.5 text-xs text-white/50 font-sans">
            <li><a href="https://csrc.nist.gov/pubs/fips/203/final" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">FIPS 203: ML-KEM (Kyber)</a></li>
            <li><a href="https://csrc.nist.gov/pubs/fips/204/final" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">FIPS 204: ML-DSA (Dilithium)</a></li>
            <li><a href="https://csrc.nist.gov/pubs/fips/205/final" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">FIPS 205: SLH-DSA (SPHINCS+)</a></li>
            <li><a href="https://csrc.nist.gov/pubs/fips/197/final" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">FIPS 197: AES-256 (Grover Safe)</a></li>
          </ul>
        </div>

        {/* Core Capabilities */}
        <div className="space-y-2.5">
          <div className="text-xs font-mono font-semibold uppercase text-white/80 tracking-wider">
            Core Modules
          </div>
          <ul className="space-y-1.5 text-xs text-white/50 font-sans">
            <li>AST Multi-Language Scanner</li>
            <li>Live SSL/TLS Socket Inspector</li>
            <li>CycloneDX 1.6 CBOM Generator</li>
            <li>Gemini 1.5/2.0 Diff Engine</li>
          </ul>
        </div>

        {/* Free Cloud Tier */}
        <div className="space-y-2.5">
          <div className="text-xs font-mono font-semibold uppercase text-white/80 tracking-wider">
            Architecture
          </div>
          <p className="text-xs text-white/50 font-sans leading-relaxed">
            100% Free-Tier Compliant. Designed to deploy on Vercel / Cloudflare Pages + Render / Koyeb with Google AI Studio free tier.
          </p>
          <div className="pt-1 text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" />
            <span>Zero Infrastructure Cost</span>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto pt-8 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between text-xs text-white/40 font-mono">
        <div>© 2026 Aegis-Q Security Research Team. Open Quantum Safe Compliant.</div>
        <div className="mt-2 sm:mt-0 flex items-center gap-4">
          <span>CycloneDX 1.6</span>
          <span>NIST PQC Ready</span>
          <span>FIPS 203/204</span>
        </div>
      </div>
    </footer>
  );
};
