import React from 'react';
import { ShieldCheck, ShieldAlert, Globe, Lock, ArrowRight, Clock, Key, Check } from 'lucide-react';
import { DynamicScanResult } from '../../types/scan';

interface TlsInspectorProps {
  result: DynamicScanResult;
}

export const TlsInspector: React.FC<TlsInspectorProps> = ({ result }) => {
  const { cipher_info, certificate, handshake_steps, target_host, target_port, tls_version } = result;

  const isTls13 = tls_version.includes('1.3');

  return (
    <section id="tls-inspector" className="max-w-7xl mx-auto px-6 py-12">
      <div className="glass-panel p-6 sm:p-8 relative overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-heading font-bold text-white tracking-tight">
                  Dynamic TLS & Endpoint Inspector
                </h2>
                <span
                  className={`px-3 py-0.5 rounded-full text-xs font-mono font-semibold border ${
                    isTls13
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 glow-safe'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  }`}
                >
                  {tls_version}
                </span>
              </div>
              <p className="text-xs text-white/50 font-mono mt-0.5">
                Target: {target_host}:{target_port} ({result.resolved_ip || 'Resolved'})
              </p>
            </div>
          </div>

          {/* Overall Readiness Pill */}
          <div className="px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-right">
            <div className="text-[10px] font-mono text-white/40 uppercase">Endpoint Readiness</div>
            <div className="text-xl font-heading font-bold text-white">
              {result.quantum_readiness_score}%
            </div>
          </div>
        </div>

        {/* Cipher Suite Chain Blocks */}
        <div className="py-8 border-b border-white/[0.06]">
          <div className="text-xs font-mono uppercase text-white/40 mb-4 tracking-wider">
            Negotiated Cryptographic Flow
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative items-center">
            {/* Block 1: Client Proposes */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <div className="text-[11px] font-mono text-white/40 uppercase mb-1">1. Client Proposes</div>
              <div className="text-xs font-mono text-white/90">
                TLS 1.3 / 1.2 Cipher Suites
              </div>
              <div className="text-[10px] text-white/40 mt-2 font-mono">
                ECDHE-RSA, AES-GCM, CHACHA20
              </div>
            </div>

            {/* Block 2: Server Selects */}
            <div className="p-4 rounded-xl bg-indigo-500/[0.05] border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.1)]">
              <div className="text-[11px] font-mono text-indigo-300 uppercase mb-1">2. Server Negotiates</div>
              <div className="text-xs font-mono font-bold text-white break-all">
                {cipher_info.cipher_suite}
              </div>
              <div className="text-[10px] text-indigo-400 mt-2 font-mono">
                Key Exchange: {cipher_info.key_exchange}
              </div>
            </div>

            {/* Block 3: Quantum Vulnerability */}
            <div className="p-4 rounded-xl bg-red-500/[0.05] border border-red-500/20">
              <div className="text-[11px] font-mono text-red-400 uppercase mb-1">3. Post-Quantum Risk</div>
              <div className="text-xs font-mono font-semibold text-red-300">
                Shor Vulnerable Key Exchange
              </div>
              <div className="text-[10px] text-white/40 mt-2 font-mono">
                Recommend: Hybrid X25519 + ML-KEM-768
              </div>
            </div>
          </div>
        </div>

        {/* Certificate Card & Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8">
          {/* Certificate Card (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="text-xs font-mono uppercase text-white/40 tracking-wider flex items-center gap-2">
              <Key className="w-3.5 h-3.5 text-indigo-400" />
              X.509 Peer Certificate Metadata
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3 font-mono text-xs">
              <div className="flex justify-between items-start">
                <span className="text-white/40">Subject CN:</span>
                <span className="text-white font-bold text-right">{certificate.subject.CN || target_host}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-white/40">Issuer:</span>
                <span className="text-white/80 text-right">{certificate.issuer.O || 'Certificate Authority'}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-white/40">Signature Algorithm:</span>
                <span className="text-amber-400 text-right">{certificate.signature_algorithm}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-white/40">Public Key:</span>
                <span className="text-red-400 font-bold text-right">
                  {certificate.public_key_type} {certificate.public_key_bits ? `(${certificate.public_key_bits}-bit)` : ''}
                </span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-white/40">Validity Window:</span>
                <span className="text-emerald-400 text-right">
                  {certificate.days_remaining ? `${certificate.days_remaining} Days Remaining` : 'Valid'}
                </span>
              </div>

              {/* SANs */}
              {certificate.subject_alt_names.length > 0 && (
                <div className="pt-2 border-t border-white/[0.06]">
                  <span className="text-white/40 text-[11px]">Subject Alternative Names:</span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {certificate.subject_alt_names.slice(0, 5).map((san, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-white/[0.04] text-[10px] text-white/70">
                        {san}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Handshake Step Log (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="text-xs font-mono uppercase text-white/40 tracking-wider flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-purple-400" />
              Handshake Step Telemetry
            </div>

            <div className="space-y-2 font-mono text-xs">
              {handshake_steps.map((step) => (
                <div
                  key={step.step_number}
                  className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">
                      <Check className="w-3 h-3" />
                    </span>
                    <span className="text-white font-medium">{step.name}</span>
                  </div>
                  <span className="text-white/40 text-[11px]">{step.timestamp_ms.toFixed(1)} ms</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
