import React, { useState, useEffect } from 'react';
import { ConstellationCanvas } from './components/background/ConstellationCanvas';
import { PerspectiveGrid } from './components/background/PerspectiveGrid';
import { ScanlineOverlay } from './components/background/ScanlineOverlay';
import { CustomCursor } from './components/background/CustomCursor';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HeroSection } from './components/scan/HeroSection';
import { ScanHub } from './components/scan/ScanHub';
import { QuantumRiskGauge } from './components/results/QuantumRiskGauge';
import { CBOMTable } from './components/results/CBOMTable';
import { ThreatMatrix } from './components/results/ThreatMatrix';
import { TlsInspector } from './components/results/TlsInspector';
import { RemediationModal } from './components/remediation/RemediationModal';
import { ExportReportModal } from './components/modals/ExportReportModal';
import { ApiKeyModal } from './components/modals/ApiKeyModal';
import { ShortcutsModal } from './components/modals/ShortcutsModal';
import { ToastContainer } from './components/modals/ToastContainer';
import { StaticScanResult, DynamicScanResult, CryptoFinding, ToastMessage } from './types/scan';
import { DEMO_BANK_APP_RESULT } from './services/demoData';

export const App: React.FC = () => {
  // Navigation & UI State
  const [activeSection, setActiveSection] = useState('hero');
  const [activeScanTab, setActiveScanTab] = useState<'code' | 'url'>('code');
  
  // Results State
  const [staticResult, setStaticResult] = useState<StaticScanResult | null>(DEMO_BANK_APP_RESULT);
  const [dynamicResult, setDynamicResult] = useState<DynamicScanResult | null>(null);
  const [selectedFindingForPatch, setSelectedFindingForPatch] = useState<CryptoFinding | null>(null);

  // Modals & Settings State
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isApiKeyOpen, setIsApiKeyOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState<string>(() => localStorage.getItem('AEGIS_GEMINI_KEY') || '');
  
  // Toast Notification System
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'info' | 'warning' | 'error', title: string, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev.slice(-2), { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSaveApiKey = (key: string) => {
    setGeminiApiKey(key);
    localStorage.setItem('AEGIS_GEMINI_KEY', key);
    addToast('success', 'Gemini API Key Saved', 'AI Remediation engine connected to Google AI Studio.');
  };

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        scrollToSection('scan-hub');
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        setIsExportOpen(true);
      } else if (e.key === '?' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsExportOpen(false);
        setIsApiKeyOpen(false);
        setIsShortcutsOpen(false);
        setSelectedFindingForPatch(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    if (sectionId === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Handlers for Scans
  const handleStaticScanComplete = (res: StaticScanResult) => {
    setStaticResult(res);
    setDynamicResult(null);
    addToast('success', 'Codebase Scan Finished', `Discovered ${res.total_crypto_assets} cryptographic assets across ${res.total_files_scanned} files.`);
    setTimeout(() => scrollToSection('cbom-explorer'), 400);
  };

  const handleDynamicScanComplete = (res: DynamicScanResult) => {
    setDynamicResult(res);
    addToast('success', 'Live TLS Inspection Complete', `Negotiated ${res.tls_version} with cipher ${res.cipher_info.cipher_suite}`);
    setTimeout(() => scrollToSection('tls-inspector'), 400);
  };

  // Active dataset for visualizers
  const currentFindings = dynamicResult ? dynamicResult.findings : (staticResult?.findings || []);
  const currentScore = dynamicResult ? dynamicResult.quantum_readiness_score : (staticResult?.quantum_readiness_score || 0);
  const currentTargetName = dynamicResult ? dynamicResult.target_host : (staticResult?.target_name || 'Codebase');
  const currentHndlRating = dynamicResult ? dynamicResult.hndl_exposure_rating : (staticResult?.hndl_exposure_rating || 'HIGH');

  const shorCount = currentFindings.filter((f) => f.risk_level.includes('SHOR')).length;
  const groverCount = currentFindings.filter((f) => f.risk_level.includes('GROVER')).length;
  const classicalCount = currentFindings.filter((f) => f.risk_level.includes('DEPRECATED')).length;
  const safeCount = currentFindings.filter((f) => f.risk_level.includes('SAFE')).length;

  const currentStatus = shorCount > 0 ? 'critical' : currentFindings.length > 0 ? 'complete' : 'idle';

  return (
    <div className="relative min-h-screen bg-[#050508] text-white selection:bg-indigo-500 selection:text-white">
      {/* Background Physics & Visual Layers */}
      <ConstellationCanvas />
      <PerspectiveGrid />
      <ScanlineOverlay />
      <CustomCursor />

      {/* Fixed Top Navbar */}
      <Navbar
        status={currentStatus}
        onOpenApiKey={() => setIsApiKeyOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        activeSection={activeSection}
        onNavigate={scrollToSection}
      />

      {/* Main Content Sections */}
      <main className="relative z-10 space-y-12 pb-16">
        {/* 1. Hero Landing */}
        <HeroSection
          onSelectTab={(tab) => setActiveScanTab(tab)}
          onScrollToScan={() => scrollToSection('scan-hub')}
        />

        {/* 2. Scan Hub Container */}
        <ScanHub
          activeTab={activeScanTab}
          onTabChange={setActiveScanTab}
          onStaticScanComplete={handleStaticScanComplete}
          onDynamicScanComplete={handleDynamicScanComplete}
        />

        {/* 3. Quantum Risk Radial Gauge */}
        {currentFindings.length > 0 && (
          <div className="max-w-7xl mx-auto px-6">
            <QuantumRiskGauge
              score={currentScore}
              shorCount={shorCount}
              groverCount={groverCount}
              classicalCount={classicalCount}
              safeCount={safeCount}
              hndlRating={currentHndlRating}
            />
          </div>
        )}

        {/* 4. Live TLS Inspector (If dynamic scan active) */}
        {dynamicResult && (
          <TlsInspector result={dynamicResult} />
        )}

        {/* 5. Interactive CycloneDX CBOM Table */}
        {currentFindings.length > 0 && (
          <CBOMTable
            findings={currentFindings}
            targetName={currentTargetName}
            onSelectFinding={(f) => setSelectedFindingForPatch(f)}
            onOpenExport={() => setIsExportOpen(true)}
          />
        )}

        {/* 6. Threat Matrix & Radar */}
        {currentFindings.length > 0 && (
          <ThreatMatrix findings={currentFindings} score={currentScore} />
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Modals & Overlays */}
      <RemediationModal
        finding={selectedFindingForPatch}
        onClose={() => setSelectedFindingForPatch(null)}
        userApiKey={geminiApiKey}
        onShowToast={addToast}
      />

      <ExportReportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        targetName={currentTargetName}
        findings={currentFindings}
        score={currentScore}
        onShowToast={addToast}
      />

      <ApiKeyModal
        isOpen={isApiKeyOpen}
        onClose={() => setIsApiKeyOpen(false)}
        apiKey={geminiApiKey}
        onSaveApiKey={handleSaveApiKey}
      />

      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
};
