import React, { useState, useRef } from 'react';
import { UploadCloud, Globe, Play, FileCode, ShieldAlert, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { TlsHandshakeViz } from './TlsHandshakeViz';
import { LiveTerminal } from './LiveTerminal';
import { StaticScanResult, DynamicScanResult } from '../../types/scan';
import { scanCodebaseZip, scanLiveUrl, fetchDemoDataset } from '../../services/api';

interface ScanHubProps {
  onStaticScanComplete: (result: StaticScanResult) => void;
  onDynamicScanComplete: (result: DynamicScanResult) => void;
  activeTab: 'code' | 'url';
  onTabChange: (tab: 'code' | 'url') => void;
}

export const ScanHub: React.FC<ScanHubProps> = ({
  onStaticScanComplete,
  onDynamicScanComplete,
  activeTab,
  onTabChange,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [targetUrl, setTargetUrl] = useState('https://secure.bank-portal.com');
  const [targetPort, setTargetPort] = useState(443);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [scanLogs, setScanLogs] = useState<string[]>([]);
  const [handshakeStepIdx, setHandshakeStepIdx] = useState<number>(-1);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Handle Drag and Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      await executeCodebaseScan(file);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      await executeCodebaseScan(file);
    }
  };

  const executeCodebaseScan = async (file: File) => {
    setSelectedFileName(file.name);
    setIsScanning(true);
    setScanLogs([
      `[00:00.05] ▶ Uploaded codebase archive: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`,
      `[00:00.15] ▶ Decompressing archive into isolated sandbox memory...`,
      `[00:00.32] ▶ Initializing AST Parser & Regex Heuristics for Python, JavaScript, Java, Go...`
    ]);

    try {
      const result = await scanCodebaseZip(file);
      // Append backend logs
      if (result.scan_logs && result.scan_logs.length > 0) {
        setScanLogs(result.scan_logs);
      }
      setTimeout(() => {
        setIsScanning(false);
        onStaticScanComplete(result);
      }, 800);
    } catch (err) {
      setIsScanning(false);
      setScanLogs((prev) => [...prev, `🔴 Scan Error: ${String(err)}`]);
    }
  };

  const executeDemoScan = async (demoId: string, label: string) => {
    setSelectedFileName(label);
    setIsScanning(true);
    setScanLogs([
      `[00:00.05] ▶ Loading pre-packaged dataset: ${label}...`,
      `[00:00.20] ▶ Triggering AST Parser on cryptographic primitives...`
    ]);

    try {
      const result = await fetchDemoDataset(demoId);
      if (result.scan_logs) {
        setScanLogs(result.scan_logs);
      }
      setTimeout(() => {
        setIsScanning(false);
        onStaticScanComplete(result);
      }, 1000);
    } catch (err) {
      setIsScanning(false);
    }
  };

  const executeUrlScan = async () => {
    if (!targetUrl.trim()) return;
    setIsScanning(true);
    setHandshakeStepIdx(0);
    setScanLogs([
      `[00:00.08] ▶ Resolving endpoint hostname: ${targetUrl}:${targetPort}...`,
      `[00:00.22] ▶ Step 1: Sending TLS ClientHello with supported cryptographic suites...`
    ]);

    // Animate Handshake steps
    const stepInterval = setInterval(() => {
      setHandshakeStepIdx((prev) => {
        if (prev < 4) {
          const next = prev + 1;
          const stepNames = ["ServerHello", "Certificate", "Key Exchange", "Finished"];
          setScanLogs((logs) => [
            ...logs,
            `[00:00.${(next * 25).toString().padStart(2, '0')}] ▶ Step ${next + 1}: Received ${stepNames[next - 1]} from target server...`
          ]);
          return next;
        }
        clearInterval(stepInterval);
        return prev;
      });
    }, 400);

    try {
      const result = await scanLiveUrl(targetUrl, targetPort);
      setTimeout(() => {
        clearInterval(stepInterval);
        setHandshakeStepIdx(4);
        setIsScanning(false);
        onDynamicScanComplete(result);
      }, 2000);
    } catch (err) {
      clearInterval(stepInterval);
      setIsScanning(false);
    }
  };

  return (
    <section id="scan-hub" className="max-w-7xl mx-auto px-6 py-12">
      <div className="text-center mb-10">
        <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white tracking-tight mb-3">
          Unified Cryptographic Discovery Hub
        </h2>
        <p className="text-sm sm:text-base text-white/50 max-w-xl mx-auto font-light">
          Select your scan mode to uncover hidden legacy encryption, quantum vulnerabilities, and generate instant CBOMs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Interactive Scan Container (7 cols) */}
        <div className="lg:col-span-7 glass-panel p-6 sm:p-8 relative overflow-hidden">
          {/* Animated Tab Selector */}
          <div className="flex items-center gap-2 p-1.5 bg-white/[0.03] border border-white/[0.06] rounded-2xl mb-8 backdrop-blur-xl">
            <button
              onClick={() => onTabChange('code')}
              className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
                activeTab === 'code'
                  ? 'bg-white text-black shadow-lg shadow-white/10'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <FileCode className="w-4 h-4" />
              Source Codebase (.ZIP)
            </button>
            <button
              onClick={() => onTabChange('url')}
              className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
                activeTab === 'url'
                  ? 'bg-white text-black shadow-lg shadow-white/10'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Globe className="w-4 h-4" />
              Live Endpoint / URL
            </button>
          </div>

          {/* TAB A: CODEBASE SCAN */}
          {activeTab === 'code' && (
            <div className="space-y-6">
              {/* Drag and Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-500 group ${
                  isDragging
                    ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01] shadow-[0_0_30px_rgba(99,102,241,0.2)]'
                    : 'border-white/10 hover:border-indigo-400/50 bg-white/[0.01] hover:bg-white/[0.03]'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".zip,.tar,.gz"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all">
                    <UploadCloud className="w-8 h-8 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white group-hover:text-indigo-300 transition-colors">
                      {selectedFileName ? selectedFileName : 'Drop ZIP or source code archive here'}
                    </h3>
                    <p className="text-xs text-white/40 mt-1">
                      Supports Python, JavaScript, Java, Go, C/C++ • Max 50MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Pre-loaded Demo Buttons */}
              <div>
                <div className="text-[11px] font-mono uppercase text-white/40 mb-3 tracking-wider flex items-center gap-2">
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  Or Try Pre-Loaded Vulnerable Datasets:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Demo 1: Vulnerable Bank App */}
                  <button
                    onClick={() => executeDemoScan('bank-app', 'Vulnerable Core Banking (Python)')}
                    disabled={isScanning}
                    className="p-3.5 rounded-xl bg-white/[0.02] hover:bg-red-500/10 border border-white/[0.06] hover:border-red-500/40 text-left transition-all group flex flex-col justify-between"
                  >
                    <div className="flex items-center gap-2 text-xs font-semibold text-white group-hover:text-red-400">
                      <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ff0040]" />
                      Banking App
                    </div>
                    <span className="text-[10px] text-white/40 mt-2 font-mono">
                      RSA-2048, MD5, DES
                    </span>
                  </button>

                  {/* Demo 2: Node Crypto */}
                  <button
                    onClick={() => executeDemoScan('node-crypto', 'Legacy E-Commerce (Node.js)')}
                    disabled={isScanning}
                    className="p-3.5 rounded-xl bg-white/[0.02] hover:bg-amber-500/10 border border-white/[0.06] hover:border-amber-500/40 text-left transition-all group flex flex-col justify-between"
                  >
                    <div className="flex items-center gap-2 text-xs font-semibold text-white group-hover:text-amber-400">
                      <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#ffaa00]" />
                      Node.js Auth
                    </div>
                    <span className="text-[10px] text-white/40 mt-2 font-mono">
                      3DES, MD5, AES-ECB
                    </span>
                  </button>

                  {/* Demo 3: Secure Reference */}
                  <button
                    onClick={() => executeDemoScan('secure-ref', 'Post-Quantum Reference Stack')}
                    disabled={isScanning}
                    className="p-3.5 rounded-xl bg-white/[0.02] hover:bg-emerald-500/10 border border-white/[0.06] hover:border-emerald-500/40 text-left transition-all group flex flex-col justify-between"
                  >
                    <div className="flex items-center gap-2 text-xs font-semibold text-white group-hover:text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#00ff88]" />
                      Quantum Safe
                    </div>
                    <span className="text-[10px] text-white/40 mt-2 font-mono">
                      ML-KEM, ML-DSA, SHA3
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB B: LIVE URL SCAN */}
          {activeTab === 'url' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                {/* URL Input */}
                <div className="relative flex-1 w-full">
                  <Globe className="w-4 h-4 text-white/40 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full pl-11 pr-4 py-3.5 bg-white/[0.03] border border-white/[0.08] focus:border-indigo-400 rounded-xl text-sm font-mono text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>

                {/* Port Input */}
                <div className="w-full sm:w-28">
                  <input
                    type="number"
                    value={targetPort}
                    onChange={(e) => setTargetPort(Number(e.target.value))}
                    placeholder="443"
                    className="w-full px-3 py-3.5 bg-white/[0.03] border border-white/[0.08] focus:border-indigo-400 rounded-xl text-sm font-mono text-center text-white focus:outline-none transition-all"
                  />
                </div>

                {/* Scan Button */}
                <button
                  onClick={executeUrlScan}
                  disabled={isScanning}
                  className="w-full sm:w-auto px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  {isScanning ? 'Probing...' : 'Scan TLS'}
                </button>
              </div>

              {/* 5-Step Animated TLS Handshake Visualization */}
              <div className="rounded-2xl bg-white/[0.01] border border-white/[0.06] p-4">
                <div className="text-[11px] font-mono uppercase text-white/40 mb-2 tracking-wider text-center">
                  Live TLS Handshake & Cipher Suite Inspector
                </div>
                <TlsHandshakeViz steps={[]} currentStepIndex={handshakeStepIdx} />
              </div>
            </div>
          )}
        </div>

        {/* Right Live Terminal (5 cols) */}
        <div className="lg:col-span-5">
          <LiveTerminal logs={scanLogs} isScanning={isScanning} />
        </div>
      </div>
    </section>
  );
};
