
import React, { useState, useEffect } from 'react';
import { CrisisReport } from './types';
import { fetchAndAnalyzeNews } from './geminiService';
import Dashboard from './components/Dashboard';
import ArticleInput from './components/ArticleInput';
import HistoricalReports from './components/HistoricalReports';
import { AlertCircle, History, BarChart3, Radio } from 'lucide-react';

const App: React.FC = () => {
  const [reports, setReports] = useState<CrisisReport[]>([]);
  const [currentReport, setCurrentReport] = useState<CrisisReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'monitor' | 'dashboard' | 'history'>('monitor');

  useEffect(() => {
    const saved = localStorage.getItem('libya_reports');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setReports(parsed);
        // If there are reports, default the "current" one to the most recent in history
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
      // Pass the most recent report as a baseline context
      const baselineReport = reports.length > 0 ? reports[0] : null;
      const report = await fetchAndAnalyzeNews(baselineReport);
      
      setReports(prev => [report, ...prev]);
      setCurrentReport(report);
      setActiveTab('dashboard');
    } catch (error) {
      console.error("Analysis failed", error);
      alert("Intelligence gathering failed. The service might be temporarily unavailable.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectReport = (report: CrisisReport) => {
    setCurrentReport(report);
    setActiveTab('dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-200">
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-600 rounded flex items-center justify-center">
            <AlertCircle className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight uppercase">Libya Crisis Risk Dashboard</h1>
            <p className="text-xs text-slate-400 font-mono">Real-time OSINT Monitoring System v4.0</p>
          </div>
        </div>

        <nav className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('monitor')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
              activeTab === 'monitor' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Radio className={`w-4 h-4 ${isLoading ? 'animate-pulse text-red-500' : ''}`} />
            <span className="text-sm font-medium">OSINT Monitor</span>
          </button>
          <button
            onClick={() => { if(currentReport) setActiveTab('dashboard') }}
            disabled={!currentReport}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
              activeTab === 'dashboard' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span className="text-sm font-medium">Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
              activeTab === 'history' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-4 h-4" />
            <span className="text-sm font-medium">Archives</span>
          </button>
        </nav>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 overflow-auto">
        {activeTab === 'monitor' && (
          <div className="max-w-2xl mx-auto mt-12">
            <ArticleInput onSubmit={handleScan} isLoading={isLoading} />
          </div>
        )}

        {activeTab === 'dashboard' && currentReport && (
          <Dashboard report={currentReport} />
        )}

        {activeTab === 'history' && (
          <HistoricalReports 
            reports={reports} 
            onSelect={handleSelectReport} 
            onNew={() => setActiveTab('monitor')}
          />
        )}
      </main>

      <footer className="p-4 border-t border-slate-900 bg-slate-950 text-center text-[10px] text-slate-500 font-mono uppercase tracking-widest">
        Proprietary Intelligence Environment // RESTRICTED ACCESS // LIVE OSINT SYNTHESIS
      </footer>
    </div>
  );
};

export default App;
