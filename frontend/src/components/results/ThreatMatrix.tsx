import React from 'react';
import { ShieldAlert, GitBranch, Cpu, Lock, CheckCircle2, AlertTriangle, Key } from 'lucide-react';
import { CryptoFinding } from '../../types/scan';

interface ThreatMatrixProps {
  findings: CryptoFinding[];
  score: number;
}

export const ThreatMatrix: React.FC<ThreatMatrixProps> = ({ findings, score }) => {
  // Compute metrics for 6-axis Radar
  const shorCount = findings.filter((f) => f.risk_level.includes('SHOR')).length;
  const groverCount = findings.filter((f) => f.risk_level.includes('GROVER')).length;
  const deprecatedCount = findings.filter((f) => f.risk_level.includes('DEPRECATED')).length;

  const shorAxis = Math.min(100, Math.max(15, shorCount * 40));
  const groverAxis = Math.min(100, Math.max(20, groverCount * 35));
  const classicalAxis = Math.min(100, Math.max(10, deprecatedCount * 30));
  const entropyAxis = findings.some((f) => f.algorithm.includes('56') || f.algorithm.includes('MD5')) ? 25 : 85;
  const protocolAgeAxis = findings.some((f) => f.algorithm.includes('DES') || f.algorithm.includes('SHA-1')) ? 20 : 80;
  const pkiResilienceAxis = score;

  // Radar points on a 200x200 canvas
  const center = 100;
  const radius = 75;

  const getCoordinates = (value: number, angleIndex: number, totalAxes: number) => {
    const angle = (Math.PI * 2 / totalAxes) * angleIndex - Math.PI / 2;
    const r = (value / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  const axes = [
    { label: "Shor Exposure", value: shorAxis },
    { label: "Grover Degradation", value: groverAxis },
    { label: "Classical Insecurity", value: classicalAxis },
    { label: "Key Entropy", value: entropyAxis },
    { label: "Protocol Modernity", value: protocolAgeAxis },
    { label: "PQC Resilience", value: pkiResilienceAxis },
  ];

  const polygonPoints = axes
    .map((axis, i) => {
      const { x, y } = getCoordinates(axis.value, i, axes.length);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <section id="threat-matrix" className="max-w-7xl mx-auto px-6 py-12">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-heading font-bold text-white tracking-tight mb-2">
          Multidimensional Cryptographic Threat Matrix
        </h2>
        <p className="text-xs sm:text-sm text-white/50 font-light max-w-xl mx-auto">
          Comprehensive posture evaluation encompassing Shor/Grover quantum vulnerabilities, key entropy, and certificate chain trust.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left: 6-Axis Radar Spider Chart (6 cols) */}
        <div className="lg:col-span-6 glass-panel p-6 sm:p-8 flex flex-col items-center justify-between">
          <div className="w-full flex items-center justify-between border-b border-white/[0.06] pb-4 mb-4">
            <span className="text-xs font-mono uppercase text-white/70 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-400" />
              Cryptographic Threat Radar
            </span>
            <span className="text-[11px] font-mono text-indigo-300">6-Dimensional Analysis</span>
          </div>

          {/* SVG Radar Chart */}
          <div className="relative w-72 h-72 my-2">
            <svg viewBox="0 0 200 200" className="w-full h-full">
              {/* Concentric Grid Polygons */}
              {[0.25, 0.5, 0.75, 1.0].map((level, lIdx) => {
                const gridPoints = axes
                  .map((_, i) => {
                    const { x, y } = getCoordinates(level * 100, i, axes.length);
                    return `${x},${y}`;
                  })
                  .join(' ');
                return (
                  <polygon
                    key={lIdx}
                    points={gridPoints}
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.08)"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Axis Spoke Lines */}
              {axes.map((_, i) => {
                const { x, y } = getCoordinates(100, i, axes.length);
                return (
                  <line
                    key={i}
                    x1={center}
                    y1={center}
                    x2={x}
                    y2={y}
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Filled Threat Area */}
              <polygon
                points={polygonPoints}
                fill="url(#radarGradient)"
                stroke="#6366f1"
                strokeWidth="2"
                className="transition-all duration-1000"
                style={{ filter: 'drop-shadow(0 0 10px rgba(99, 102, 241, 0.5))' }}
              />

              {/* Data Point Dots */}
              {axes.map((axis, i) => {
                const { x, y } = getCoordinates(axis.value, i, axes.length);
                return (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r="3.5"
                    className="fill-white stroke-indigo-400 stroke-2"
                  />
                );
              })}

              {/* Gradient Definition */}
              <defs>
                <radialGradient id="radarGradient" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(255, 0, 64, 0.5)" />
                  <stop offset="60%" stopColor="rgba(99, 102, 241, 0.4)" />
                  <stop offset="100%" stopColor="rgba(0, 255, 136, 0.15)" />
                </radialGradient>
              </defs>
            </svg>
          </div>

          {/* Radar Legend */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full pt-4 border-t border-white/[0.06] text-[11px] font-mono">
            {axes.map((a, i) => (
              <div key={i} className="flex flex-col">
                <span className="text-white/40">{a.label}</span>
                <span className={`font-bold ${a.value > 60 ? 'text-indigo-300' : 'text-amber-400'}`}>
                  {Math.round(a.value)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Certificate Chain & PKI Hierarchy Tree (6 cols) */}
        <div className="lg:col-span-6 glass-panel p-6 sm:p-8 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-4 mb-4">
            <span className="text-xs font-mono uppercase text-white/70 flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-purple-400" />
              PKI Certificate Trust Tree
            </span>
            <span className="text-[11px] font-mono text-purple-300">X.509 Hierarchy</span>
          </div>

          <div className="space-y-3 my-auto">
            {/* Root CA Node */}
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Root Certificate Authority</div>
                  <div className="text-[11px] font-mono text-white/50">DigiCert / ISRG Root X1 (RSA-4096)</div>
                </div>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                TRUSTED
              </span>
            </div>

            {/* Connecting Vertical Line */}
            <div className="w-[2px] h-4 bg-white/20 ml-6" />

            {/* Intermediate CA Node */}
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Intermediate Issuing CA</div>
                  <div className="text-[11px] font-mono text-white/50">R3 / Global TLS CA (RSA-2048)</div>
                </div>
              </div>
              <span className="text-[10px] font-mono text-amber-400 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20">
                SHOR VULNERABLE
              </span>
            </div>

            {/* Connecting Vertical Line */}
            <div className="w-[2px] h-4 bg-white/20 ml-6" />

            {/* Leaf Server Certificate */}
            <div className="p-3.5 rounded-xl bg-red-500/5 border border-red-500/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/10 text-red-400">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">End-Entity Leaf Certificate</div>
                  <div className="text-[11px] font-mono text-red-300">Target Server (RSA-2048 / SHA256withRSA)</div>
                </div>
              </div>
              <span className="text-[10px] font-mono text-red-400 px-2 py-0.5 rounded-md bg-red-500/10 border border-red-500/30 glow-critical">
                MIGRATE TO ML-DSA
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-white/[0.06] text-xs text-white/50 font-sans">
            💡 <strong className="text-white/80">Recommendation:</strong> Transition PKI leaf certs to hybrid X25519+ML-KEM and dual-sign using NIST FIPS 204 (ML-DSA) to protect against future retroactive eavesdropping.
          </div>
        </div>
      </div>
    </section>
  );
};
