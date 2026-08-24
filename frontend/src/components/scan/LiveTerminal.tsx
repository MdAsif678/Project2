import React, { useEffect, useRef, useState } from 'react';
import { Terminal, Clock, Activity, CheckCircle2 } from 'lucide-react';

interface LiveTerminalProps {
  logs: string[];
  isScanning: boolean;
  onClear?: () => void;
}

export const LiveTerminal: React.FC<LiveTerminalProps> = ({
  logs,
  isScanning,
}) => {
  const terminalEndRef = useRef<HTMLDivElement | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  useEffect(() => {
    let timer: any;
    if (isScanning) {
      setElapsedSeconds(0);
      timer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 0.1);
      }, 100);
    }
    return () => clearInterval(timer);
  }, [isScanning]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const formatLogLine = (line: string) => {
    if (line.includes('🔴')) {
      return <span className="text-red-400 font-semibold drop-shadow-[0_0_8px_rgba(255,0,64,0.4)]">{line}</span>;
    }
    if (line.includes('⚠️')) {
      return <span className="text-amber-400 font-medium">{line}</span>;
    }
    if (line.includes('✅')) {
      return <span className="text-emerald-400 font-medium">{line}</span>;
    }
    if (line.includes('▶')) {
      return <span className="text-indigo-300">{line}</span>;
    }
    return <span className="text-white/60">{line}</span>;
  };

  return (
    <div className="glass-panel w-full h-[360px] flex flex-col overflow-hidden font-mono text-xs border border-white/[0.08] shadow-2xl relative">
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/[0.02] border-b border-white/[0.06] select-none">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-heading font-semibold text-white/90 tracking-wider text-xs">
            AEGIS-Q DISCOVERY TERMINAL
          </span>
        </div>

        <div className="flex items-center gap-4 text-white/40">
          {/* Live Timer */}
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <Clock className="w-3 h-3 text-white/40" />
            <span>{elapsedSeconds.toFixed(1)}s</span>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isScanning
                  ? 'bg-amber-400 animate-ping shadow-[0_0_8px_#ffaa00]'
                  : logs.length > 0
                  ? 'bg-emerald-400'
                  : 'bg-indigo-400/50'
              }`}
            />
            <span className="text-[11px]">
              {isScanning ? 'STREAMING AST' : logs.length > 0 ? 'IDLE' : 'STANDBY'}
            </span>
          </div>
        </div>
      </div>

      {/* Terminal Body */}
      <div className="flex-1 p-4 overflow-y-auto space-y-1.5 font-mono leading-relaxed bg-[#050508]/60">
        {logs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-white/20 text-center gap-2">
            <Activity className="w-6 h-6 animate-pulse" />
            <p>Awaiting scan initialization...</p>
            <p className="text-[10px] text-white/10 font-sans">
              AST tokens, regex discoveries, and TLS handshake metrics will stream here in real-time.
            </p>
          </div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="flex items-start gap-2 animate-fadeIn">
              <span className="text-white/20 select-none">[{String(index + 1).padStart(2, '0')}]</span>
              <div className="flex-1 break-all">{formatLogLine(log)}</div>
            </div>
          ))
        )}
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
};
