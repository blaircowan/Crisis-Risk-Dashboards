
import React, { useState } from 'react';
import { CrisisReport, EscalationLevel } from '../types';
import { Archive, ArrowRight, Clock, ShieldAlert, FileText, ChevronDown, ChevronUp, TrendingUp } from 'lucide-react';

interface HistoricalReportsProps {
  reports: CrisisReport[];
  onSelect: (report: CrisisReport) => void;
  onNew: () => void;
}

const ReportCard: React.FC<{ 
  report: CrisisReport; 
  onSelect: (report: CrisisReport) => void;
}> = ({ report, onSelect }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getEscalationColor = (level: EscalationLevel) => {
    switch (level) {
      case EscalationLevel.LOW: return 'bg-emerald-500';
      case EscalationLevel.MEDIUM: return 'bg-amber-500';
      case EscalationLevel.HIGH: return 'bg-orange-500';
      case EscalationLevel.CRITICAL: return 'bg-red-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div 
      className={`group bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg hover:border-slate-600 transition-all duration-300 flex flex-col ${
        isExpanded ? 'ring-2 ring-blue-500/20 shadow-2xl scale-[1.01] z-10' : 'hover:shadow-2xl'
      }`}
    >
      <div className={`h-1.5 w-full ${getEscalationColor(report.escalationLevel)}`}></div>
      <div className="p-6 flex-1 flex flex-col">
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
          <h3 className="text-white font-bold text-base leading-tight group-hover:text-blue-400 transition-colors">
            {report.summary.length > 80 && !isExpanded ? `${report.summary.substring(0, 80)}...` : report.summary}
          </h3>
        </div>
        
        <div className="relative">
          <p className={`text-slate-400 text-xs mb-4 leading-relaxed italic ${isExpanded ? '' : 'line-clamp-3'}`}>
            {report.strategicInsight}
          </p>
          
          {isExpanded && (
            <div className="mt-4 pt-4 border-t border-slate-800 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div>
                <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2">Detailed Summary</h4>
                <p className="text-slate-300 text-xs leading-relaxed">
                  {report.summary}
                </p>
              </div>
              <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                  <h4 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Strategic Assessment</h4>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">
                  {report.strategicInsight}
                </p>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-auto pt-4 flex flex-col gap-3">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="flex items-center justify-center gap-1 w-full py-2 rounded bg-slate-800/50 border border-slate-700 hover:bg-slate-800 transition-colors text-[10px] font-bold text-slate-400 uppercase tracking-widest"
          >
            {isExpanded ? (
              <><ChevronUp className="w-3 h-3" /> Minimize Brief</>
            ) : (
              <><ChevronDown className="w-3 h-3" /> Expand Dossier</>
            )}
          </button>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800/50">
            <span className="text-[10px] font-mono text-slate-600 uppercase">ASSET_ID: {report.id}</span>
            <button 
              onClick={() => onSelect(report)}
              className="text-red-500 flex items-center gap-1 text-xs font-bold uppercase tracking-wider hover:text-red-400 transition-colors group/btn"
            >
              Load Dashboard <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const HistoricalReports: React.FC<HistoricalReportsProps> = ({ reports, onSelect, onNew }) => {
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
        <div className="flex flex-col items-end">
          <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">{reports.length} Reports Logged</span>
          <span className="text-[9px] text-slate-600 uppercase">Archive contains paragraph-level intelligence data</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
        {reports.map((report) => (
          <ReportCard 
            key={report.id} 
            report={report} 
            onSelect={onSelect} 
          />
        ))}
      </div>
    </div>
  );
};

export default HistoricalReports;
