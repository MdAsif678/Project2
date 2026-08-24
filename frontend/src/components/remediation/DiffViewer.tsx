import React from 'react';

interface DiffViewerProps {
  originalCode: string;
  patchedCode: string;
  diffText: string;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({
  originalCode,
  patchedCode,
}) => {
  const origLines = originalCode.split('\n');
  const patchLines = patchedCode.split('\n');
  const maxLines = Math.max(origLines.length, patchLines.length);

  return (
    <div className="w-full bg-[#050508]/90 border border-white/[0.08] rounded-2xl overflow-hidden font-mono text-xs shadow-2xl">
      {/* Diff Headers */}
      <div className="grid grid-cols-2 bg-white/[0.03] border-b border-white/[0.06] text-xs font-semibold py-2.5 px-4 select-none">
        <div className="flex items-center gap-2 text-red-400">
          <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ff0040]" />
          <span>Legacy / Quantum-Vulnerable</span>
        </div>
        <div className="flex items-center gap-2 text-emerald-400 pl-4 border-l border-white/[0.06]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#00ff88]" />
          <span>Post-Quantum Remediated (NIST FIPS)</span>
        </div>
      </div>

      {/* Side-by-Side Diff Content */}
      <div className="grid grid-cols-2 divide-x divide-white/[0.06] max-h-[420px] overflow-y-auto p-2">
        {/* Left: Original Code */}
        <div className="space-y-1 pr-2">
          {origLines.map((line, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 py-0.5 px-2 rounded bg-red-500/[0.04] text-red-300 hover:bg-red-500/[0.08] transition-colors"
            >
              <span className="text-white/20 select-none w-6 text-right">{idx + 1}</span>
              <span className="flex-1 whitespace-pre-wrap break-all">{line || ' '}</span>
            </div>
          ))}
        </div>

        {/* Right: Patched Code */}
        <div className="space-y-1 pl-2">
          {patchLines.map((line, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 py-0.5 px-2 rounded bg-emerald-500/[0.06] text-emerald-300 hover:bg-emerald-500/[0.1] transition-colors"
            >
              <span className="text-white/20 select-none w-6 text-right">{idx + 1}</span>
              <span className="flex-1 whitespace-pre-wrap break-all">{line || ' '}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
