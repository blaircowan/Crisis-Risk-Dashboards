
import React from 'react';
import { CrisisReport, EscalationLevel } from '../types';
import { Archive, ArrowRight, Clock, ShieldAlert, FileText } from 'lucide-react';

interface HistoricalReportsProps {
  reports: CrisisReport[];
  onSelect: (report: CrisisReport) => void;
  onNew: () => void;
}

const HistoricalReports: React.FC<HistoricalReportsProps> = ({ reports, onSelect, onNew }) => {
  const getEscalationColor = (level: EscalationLevel) => {
    switch (level) {
      case EscalationLevel.LOW: return 'bg-emerald-500';
      case EscalationLevel.MEDIUM: return 'bg-amber-500';
      case EscalationLevel.HIGH: return 'bg-orange-500';
      case EscalationLevel.CRITICAL: return 'bg-red-500';
      default: return 'bg-slate-500';
    }
  };

  if (reports.length === 0) {
    return (
      <div className="text-center py-20 bg-slate-900 rounded-xl border border-slate-800 border-dashed">
        <Archive className="w-12 h-12 text-slate-700 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Intelligence Archives Empty</h2>
        <p className="text-slate-400 mb-6">No previous analysis reports found in local storage.</p>
        <button 
          onClick={onNew}
          className="px-6 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-500 transition-colors"
        >
          Initialize New OSINT Scan
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Archive className="text-red-500 w-6 h-6" />
          <h2 className="text-2xl font-bold text-white tracking-tight underline decoration-red-600/30 decoration-4 underline-offset-8">Intelligence Archives</h2>
        </div>
        <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">{reports.length} Reports Logged</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => (
          <div 
            key={report.id}
            onClick={() => onSelect(report)}
            className="group cursor-pointer bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg hover:border-slate-600 transition-all hover:shadow-2xl hover:-translate-y-1"
          >
            <div className={`h-1.5 w-full ${getEscalationColor(report.escalationLevel)}`}></div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-mono text-slate-500 uppercase flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(report.timestamp).toLocaleDateString()}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                  report.escalationLevel === EscalationLevel.CRITICAL ? 'bg-red-900/20 border-red-800 text-red-500' : 
                  'bg-slate-800 border-slate-700 text-slate-400'
                }`}>
                  {report.escalationLevel}
                </span>
              </div>
              
              <div className="flex items-start gap-2 mb-3">
                <FileText className="w-4 h-4 text-blue-500 shrink-0 mt-1" />
                <h3 className="text-white font-bold text-base line-clamp-2 leading-tight group-hover:text-blue-400 transition-colors">
                  {report.summary}
                </h3>
              </div>
              
              <p className="text-slate-400 text-xs mb-6 line-clamp-4 leading-relaxed italic">
                {report.strategicInsight}
              </p>
              
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-800/50">
                <span className="text-[10px] font-mono text-slate-600 uppercase">ASSET_ID: {report.id}</span>
                <div className="text-red-500 flex items-center gap-1 text-xs font-bold uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                  View Dossier <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoricalReports;
