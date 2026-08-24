import React, { useState, useEffect } from 'react';
import {
  X,
  Wand2,
  Copy,
  Download,
  Check,
  ExternalLink,
  ShieldAlert,
  Sparkles,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { CryptoFinding, RemediationResponse } from '../../types/scan';
import { generateRemediationPatch } from '../../services/api';
import { DiffViewer } from './DiffViewer';

interface RemediationModalProps {
  finding: CryptoFinding | null;
  onClose: () => void;
  userApiKey?: string;
  onShowToast: (type: 'success' | 'info' | 'warning', title: string, msg: string) => void;
}

export const RemediationModal: React.FC<RemediationModalProps> = ({
  finding,
  onClose,
  userApiKey,
  onShowToast,
}) => {
  const [loading, setLoading] = useState(true);
  const [remediation, setRemediation] = useState<RemediationResponse | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedDiff, setCopiedDiff] = useState(false);

  useEffect(() => {
    if (!finding) return;

    setLoading(true);
    generateRemediationPatch(finding, userApiKey)
      .then((data) => {
        setRemediation(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [finding, userApiKey]);

  if (!finding) return null;

  const handleCopyPatchedCode = () => {
    if (!remediation) return;
    navigator.clipboard.writeText(remediation.patched_code);
    setCopiedCode(true);
    onShowToast('success', 'Code Copied', 'Post-Quantum code patch copied to clipboard.');
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleCopyDiff = () => {
    if (!remediation) return;
    navigator.clipboard.writeText(remediation.unified_diff);
    setCopiedDiff(true);
    onShowToast('success', 'Diff Copied', 'Unified git diff copied to clipboard.');
    setTimeout(() => setCopiedDiff(false), 2500);
  };

  const handleDownloadPatch = () => {
    if (!remediation) return;
    const blob = new Blob([remediation.unified_diff], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pqc_migration_${finding.algorithm.toLowerCase().replace(/[^a-z0-9]/g, '_')}.patch`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast('success', 'Patch Downloaded', 'Git patch file generated successfully.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xl animate-fadeIn">
      {/* Modal Container */}
      <div className="glass-panel w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden border border-white/[0.12] shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-heading font-bold text-white tracking-tight">
                  PQC Migration Studio
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {remediation?.target_fips || 'NIST FIPS 203'}
                </span>
              </div>
              <p className="text-xs text-white/50 font-mono mt-0.5">
                Target: {finding.algorithm} ({finding.primitive}) • {finding.file_path || 'Network Cryptography'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/50 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Validation Notice Banner */}
        <div className="px-6 py-2.5 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between text-xs font-mono text-amber-300">
          <span className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            AI-assisted migration patch suggestion — developer validation and unit testing required.
          </span>
          {remediation?.ai_confidence_estimate && (
            <span className="text-amber-200/60 text-[11px]">
              Est. Model Confidence: {remediation.ai_confidence_estimate}
            </span>
          )}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="h-96 flex flex-col items-center justify-center gap-4 text-white/60">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
              <span className="font-mono text-xs">Synthesizing NIST PQC Diff with Gemini Engine...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left 8 cols: Side-by-Side Diff Viewer */}
              <div className="lg:col-span-8 space-y-4">
                <DiffViewer
                  originalCode={remediation?.original_code || finding.code_snippet || ''}
                  patchedCode={remediation?.patched_code || ''}
                  diffText={remediation?.unified_diff || ''}
                />

                {/* What Changed Bullets */}
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                  <div className="text-xs font-mono font-semibold text-white/80 uppercase tracking-wider">
                    Migration Transformations
                  </div>
                  <ul className="space-y-1.5 text-xs text-white/70 font-sans list-disc list-inside">
                    {remediation?.what_changed.map((change, i) => (
                      <li key={i}>{change}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right 4 cols: Threat Reasoning & Actions */}
              <div className="lg:col-span-4 space-y-4">
                {/* Vulnerability Card */}
                <div className="p-4 rounded-xl bg-red-500/[0.05] border border-red-500/20 space-y-2">
                  <div className="text-xs font-mono font-semibold text-red-400 uppercase flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Why This is Vulnerable
                  </div>
                  <p className="text-xs text-white/80 font-sans leading-relaxed">
                    {remediation?.why_vulnerable}
                  </p>
                </div>

                {/* NIST Standard Reference Card */}
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                  <div className="text-xs font-mono font-semibold text-white/80 uppercase">
                    Official NIST Standard
                  </div>
                  <div className="text-xs text-indigo-300 font-mono font-bold">
                    {remediation?.target_fips}
                  </div>
                  <a
                    href={remediation?.nist_link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-white/50 hover:text-white inline-flex items-center gap-1 mt-1 transition-colors"
                  >
                    View Official NIST Specification <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2.5 pt-2">
                  <button
                    onClick={handleCopyPatchedCode}
                    className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-[0_0_20px_rgba(0,255,136,0.3)] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copiedCode ? 'Copied to Clipboard!' : 'Copy Patched Code'}
                  </button>

                  <button
                    onClick={handleCopyDiff}
                    className="w-full py-2.5 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {copiedDiff ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    Copy Unified Diff
                  </button>

                  <button
                    onClick={handleDownloadPatch}
                    className="w-full py-2.5 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-indigo-400" />
                    Download .patch File
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
