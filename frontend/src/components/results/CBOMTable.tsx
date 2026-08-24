import React, { useState } from 'react';
import {
  Search,
  Layers,
  Wand2,
  CheckSquare,
  Square,
  FileSpreadsheet
} from 'lucide-react';
import { CryptoFinding, QuantumRiskLevel } from '../../types/scan';

interface CBOMTableProps {
  findings: CryptoFinding[];
  onSelectFinding: (finding: CryptoFinding) => void;
  onOpenExport: () => void;
  targetName: string;
}

export const CBOMTable: React.FC<CBOMTableProps> = ({
  findings,
  onSelectFinding,
  onOpenExport,
  targetName,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<string>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedFindings, setSelectedFindings] = useState<string[]>([]);

  // Filter findings
  const filteredFindings = findings.filter((f) => {
    const matchesSearch =
      f.algorithm.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.file_path && f.file_path.toLowerCase().includes(searchQuery.toLowerCase())) ||
      f.nist_replacement.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.primitive.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRisk =
      selectedRiskFilter === 'ALL' ||
      (selectedRiskFilter === 'CRITICAL' && f.risk_level.includes('SHOR')) ||
      (selectedRiskFilter === 'GROVER' && f.risk_level.includes('GROVER')) ||
      (selectedRiskFilter === 'DEPRECATED' && f.risk_level.includes('DEPRECATED')) ||
      (selectedRiskFilter === 'RESISTANT' && f.risk_level.includes('RESISTANT'));

    return matchesSearch && matchesRisk;
  });

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const toggleSelect = (id: string) => {
    setSelectedFindings((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedFindings.length === filteredFindings.length) {
      setSelectedFindings([]);
    } else {
      setSelectedFindings(filteredFindings.map((f) => f.id));
    }
  };

  const getRiskBadge = (level: QuantumRiskLevel) => {
    switch (level) {
      case 'CRITICAL_SHOR':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-red-500/15 text-red-400 border border-red-500/30 glow-critical">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
            CRITICAL (Shor)
          </span>
        );
      case 'HIGH_SHOR':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-pink-500/15 text-pink-400 border border-pink-500/30">
            HIGH (Shor)
          </span>
        );
      case 'MEDIUM_GROVER':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30 glow-grover">
            MEDIUM (Grover)
          </span>
        );
      case 'DEPRECATED_CLASSICAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-zinc-500/20 text-zinc-300 border border-zinc-500/30">
            DEPRECATED
          </span>
        );
      case 'QUANTUM_RESISTANT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 glow-safe">
            QUANTUM RESISTANT
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-mono bg-white/10 text-white/70">
            {level}
          </span>
        );
    }
  };

  return (
    <section id="cbom-explorer" className="max-w-7xl mx-auto px-6 py-12">
      <div className="glass-panel p-6 sm:p-8 relative overflow-hidden">
        {/* Table Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-white/[0.06]">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              <h2 className="text-2xl font-heading font-bold text-white tracking-tight">
                Cryptography Bill of Materials (CBOM)
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-white/50 font-light mt-1">
              OWASP CycloneDX v1.6 Standard Cryptographic Asset Inventory for <span className="text-white font-medium">{targetName}</span>
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 md:w-64">
              <Search className="w-3.5 h-3.5 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search algorithm, file, PQC..."
                className="w-full pl-9 pr-3 py-2 bg-white/[0.03] border border-white/[0.08] focus:border-indigo-400 rounded-xl text-xs font-mono text-white placeholder-white/30 focus:outline-none transition-all"
              />
            </div>

            {/* Export Trigger */}
            <button
              onClick={onOpenExport}
              className="px-4 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-xs font-semibold text-indigo-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-sm"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Export CycloneDX CBOM
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 py-4 border-b border-white/[0.04] text-xs">
          <span className="text-white/40 text-[11px] font-mono mr-1">FILTER:</span>
          {[
            { key: 'ALL', label: `All (${findings.length})` },
            { key: 'CRITICAL', label: `Shor Critical (${findings.filter(f => f.risk_level.includes('SHOR')).length})` },
            { key: 'GROVER', label: `Grover (${findings.filter(f => f.risk_level.includes('GROVER')).length})` },
            { key: 'DEPRECATED', label: `Deprecated (${findings.filter(f => f.risk_level.includes('DEPRECATED')).length})` },
            { key: 'RESISTANT', label: `Quantum Resistant (${findings.filter(f => f.risk_level.includes('RESISTANT')).length})` }
          ].map((pill) => (
            <button
              key={pill.key}
              onClick={() => setSelectedRiskFilter(pill.key)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedRiskFilter === pill.key
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'bg-white/[0.03] text-white/60 hover:text-white hover:bg-white/[0.06] border border-white/[0.06]'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Findings Data Table */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-white/[0.06] text-white/40 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3 w-8">
                  <button onClick={toggleSelectAll} className="text-white/40 hover:text-white">
                    {selectedFindings.length > 0 && selectedFindings.length === filteredFindings.length ? (
                      <CheckSquare className="w-4 h-4 text-indigo-400" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-3">Cryptographic Asset</th>
                <th className="py-3 px-3">Primitive Type</th>
                <th className="py-3 px-3">Classical Security</th>
                <th className="py-3 px-3">Threat Classification</th>
                <th className="py-3 px-3">NIST PQC Replacement</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredFindings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-white/30 font-sans text-sm">
                    No cryptographic assets match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredFindings.map((f) => {
                  const isExpanded = expandedId === f.id;
                  const isSelected = selectedFindings.includes(f.id);

                  return (
                    <React.Fragment key={f.id}>
                      <tr
                        onClick={() => toggleExpand(f.id)}
                        className={`group cursor-pointer transition-all hover:bg-white/[0.03] ${
                          isSelected ? 'bg-indigo-500/[0.05]' : ''
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="py-3.5 px-3" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => toggleSelect(f.id)}
                            className="text-white/40 hover:text-white"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-indigo-400" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </td>

                        {/* Algorithm Name */}
                        <td className="py-3.5 px-3 font-semibold text-white group-hover:text-indigo-300 transition-colors">
                          <div>{f.algorithm}</div>
                          <div className="text-[10px] text-white/40 font-normal">{f.file_path || 'Endpoint'}</div>
                        </td>

                        {/* Primitive */}
                        <td className="py-3.5 px-3 text-indigo-200">
                          {f.primitive}
                        </td>

                        {/* Classical Security Strength */}
                        <td className="py-3.5 px-3 text-white/70">
                          {f.classical_security_bits ? `~${f.classical_security_bits}-bit` : 'N/A'}
                        </td>

                        {/* Risk Level Badge */}
                        <td className="py-3.5 px-3">
                          {getRiskBadge(f.risk_level)}
                        </td>

                        {/* NIST PQC Replacement */}
                        <td className="py-3.5 px-3 text-indigo-300 font-medium max-w-xs truncate">
                          {f.nist_replacement}
                        </td>

                        {/* Action CTA */}
                        <td className="py-3.5 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => onSelectFinding(f)}
                            className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-indigo-600 text-white text-xs font-semibold transition-all hover:scale-105 inline-flex items-center gap-1 shadow-sm"
                          >
                            <Wand2 className="w-3 h-3 text-indigo-400 group-hover:text-white" />
                            <span>Patch</span>
                          </button>
                        </td>
                      </tr>

                      {/* Expandable Inline Details */}
                      {isExpanded && (
                        <tr className="bg-[#050508]/80 border-y border-indigo-500/20 animate-fadeIn">
                          <td colSpan={7} className="p-5">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                              {/* Left: Code Snippet */}
                              <div className="lg:col-span-7 bg-[#0a0a10] border border-white/[0.08] rounded-xl p-4 overflow-x-auto">
                                <div className="text-[11px] font-mono text-white/40 uppercase mb-2 flex items-center justify-between">
                                  <span>DISCOVERED SOURCE CODE SNIPPET</span>
                                  <span className="text-red-400">LINE {f.line_number || 1}</span>
                                </div>
                                <pre className="text-xs text-white/90 font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap">
                                  {f.code_snippet || '# Code snippet discovered in binary/network inspection.'}
                                </pre>
                              </div>

                              {/* Right: Threat Metadata */}
                              <div className="lg:col-span-5 space-y-3 bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
                                <div>
                                  <div className="text-[11px] font-mono text-white/40 uppercase">Vulnerability Assessment</div>
                                  <p className="text-xs text-white/80 font-sans mt-1 leading-normal">
                                    {f.risk_reason}
                                  </p>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-2 border-t border-white/[0.06]">
                                  <div>
                                    <span className="text-white/40">Framework: </span>
                                    <span className="text-white">{f.framework_or_library || 'Standard'}</span>
                                  </div>
                                  <div>
                                    <span className="text-white/40">Confidence: </span>
                                    <span className="text-emerald-400">{(f.confidence * 100).toFixed(0)}%</span>
                                  </div>
                                  <div>
                                    <span className="text-white/40">NIST Security: </span>
                                    <span className="text-indigo-300">Level {f.quantum_security_level}</span>
                                  </div>
                                  <div>
                                    <span className="text-white/40">OID: </span>
                                    <span className="text-white/60">{f.oid || 'Unassigned'}</span>
                                  </div>
                                </div>

                                <button
                                  onClick={() => onSelectFinding(f)}
                                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-xs transition-all hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] flex items-center justify-center gap-2 cursor-pointer mt-3"
                                >
                                  <Wand2 className="w-3.5 h-3.5" />
                                  Synthesize NIST PQC Migration Diff
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Floating Bulk Selection Action Bar */}
        {selectedFindings.length > 0 && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 bg-[#0a0a10]/95 backdrop-blur-2xl border border-indigo-500/40 rounded-2xl px-6 py-3 shadow-[0_10px_40px_rgba(0,0,0,0.8)] flex items-center gap-4 animate-slideUp">
            <span className="text-xs font-mono text-white">
              <strong className="text-indigo-400">{selectedFindings.length}</strong> assets selected
            </span>
            <button
              onClick={() => {
                const target = findings.find((f) => f.id === selectedFindings[0]);
                if (target) onSelectFinding(target);
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Wand2 className="w-3.5 h-3.5" />
              Generate Remediation Patches
            </button>
            <button
              onClick={onOpenExport}
              className="px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-white text-xs font-semibold rounded-xl border border-white/[0.08] cursor-pointer"
            >
              Export Selected CBOM
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
