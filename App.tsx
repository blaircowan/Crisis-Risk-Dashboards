
import React, { useState, useEffect } from 'react';
import { CrisisReport, Country, TacticalAnalysis } from './types';
import { fetchAndAnalyzeNews } from './geminiService';
import Dashboard from './components/Dashboard';
import CrisisDashboard from './components/CrisisDashboard';
import ArticleInput from './components/ArticleInput';
import HistoricalReports from './components/HistoricalReports';
import ImmediateCrisisOSINT from './components/ImmediateCrisisOSINT';
import { AlertCircle, History, BarChart3, Radio, ShieldAlert, Zap } from 'lucide-react';

const App: React.FC = () => {
  const [reports, setReports] = useState<CrisisReport[]>([]);
  const [currentReport, setCurrentReport] = useState<CrisisReport | null>(null);
  const [tacticalReport, setTacticalReport] = useState<TacticalAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'monitor' | 'tacticalTasking' | 'dashboard' | 'crisis' | 'history'>('monitor');
  const [selectedCountry, setSelectedCountry] = useState<Country>(Country.LIBYA);

  useEffect(() => {
    const saved = localStorage.getItem('libya_reports');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setReports(parsed);
        if (parsed.length > 0 && !currentReport) {
          setCurrentReport(parsed[0]);
        }
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('libya_reports', JSON.stringify(reports));
  }, [reports]);

  const handleScan = async () => {
    setIsLoading(true);
    try {
      const baselineReport = reports.find(r => r.country === selectedCountry) || null;
      const report = await fetchAndAnalyzeNews(selectedCountry, baselineReport);
      
      setReports(prev => [report, ...prev]);
      setCurrentReport(report);
      setActiveTab('dashboard');
    } catch (error) {
      console.error("Analysis failed", error);
      alert("Intelligence gathering failed. Target zone communication unstable.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTacticalResult = (result: TacticalAnalysis) => {
    setTacticalReport(result);
    setActiveTab('crisis');
  };

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-slate-200">
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-600 rounded flex items-center justify-center shadow-[0_0_15px_rgba(220,38,38,0.3)]">
            <AlertCircle className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight uppercase">Crisis Radar AI</h1>
            <p className="text-xs text-slate-400 font-mono">Regional OSINT Early-Warning System v7.0</p>
          </div>
        </div>

        <nav className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('monitor')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
              activeTab === 'monitor' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Radio className={`w-4 h-4 ${isLoading && activeTab === 'monitor' ? 'animate-pulse text-red-500' : ''}`} />
            <span className="text-sm font-medium uppercase tracking-wider text-[11px] font-bold">Country Tasking</span>
          </button>

          <button
            onClick={() => setActiveTab('tacticalTasking')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
              activeTab === 'tacticalTasking' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className={`w-4 h-4 ${isLoading && activeTab === 'tacticalTasking' ? 'animate-pulse text-emerald-500' : ''}`} />
            <span className="text-sm font-medium uppercase tracking-wider text-[11px] font-bold">Crisis Tasking</span>
          </button>
          
          <div className="w-px h-6 bg-slate-800 mx-2"></div>

          <button
            onClick={() => { if(currentReport) setActiveTab('dashboard') }}
            disabled={!currentReport}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
              activeTab === 'dashboard' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span className="text-sm font-medium uppercase tracking-wider text-[11px] font-bold">COUNTRY REPORT</span>
          </button>

          <button
            onClick={() => { if(tacticalReport) setActiveTab('crisis') }}
            disabled={!tacticalReport}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
              activeTab === 'crisis' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span className="text-sm font-medium uppercase tracking-wider text-[11px] font-bold">CRISIS REPORT</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
              activeTab === 'history' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-4 h-4" />
            <span className="text-sm font-medium uppercase tracking-wider text-[11px] font-bold">Archives</span>
          </button>
        </nav>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 overflow-auto">
        {activeTab === 'monitor' && (
          <div className="max-w-4xl mx-auto py-12">
            <div className="max-w-2xl mx-auto">
              <ArticleInput 
                onSubmit={handleScan} 
                isLoading={isLoading} 
                selectedCountry={selectedCountry}
                onCountryChange={setSelectedCountry}
              />
            </div>
          </div>
        )}

        {activeTab === 'tacticalTasking' && (
          <div className="max-w-4xl mx-auto">
            <ImmediateCrisisOSINT onResult={handleTacticalResult} />
          </div>
        )}

        {activeTab === 'dashboard' && currentReport && (
          <Dashboard report={currentReport} />
        )}

        {activeTab === 'crisis' && tacticalReport && (
          <CrisisDashboard report={tacticalReport} />
        )}

        {activeTab === 'history' && (
          <HistoricalReports 
            reports={reports} 
            onSelect={(r) => { setCurrentReport(r); setActiveTab('dashboard'); }} 
            onNew={() => setActiveTab('monitor')}
          />
        )}
      </main>

      <footer className="p-4 border-t border-slate-900 bg-slate-950/50 backdrop-blur-sm text-center text-[10px] text-slate-500 font-mono uppercase tracking-widest leading-relaxed">
        Regional Intelligence Environment // TARGET ZONES: GLOBAL // RESTRICTED ACCESS // OSINT PIPELINE V7.0
      </footer>
    </div>
  );
};
export default App;
