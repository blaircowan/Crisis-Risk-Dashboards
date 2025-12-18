
import React from 'react';
import { CrisisReport, EscalationLevel } from '../types';
import IndicatorChart from './IndicatorChart';
import { 
  ShieldAlert, TrendingUp, Info, Activity, 
  Calendar, MapPin, Hash, ExternalLink, 
  Link as LinkIcon, ArrowUpRight, ArrowDownRight, Minus, FileText
} from 'lucide-react';

interface DashboardProps {
  report: CrisisReport;
}

const Dashboard: React.FC<DashboardProps> = ({ report }) => {
  const getEscalationColor = (level: EscalationLevel) => {
    switch (level) {
      case EscalationLevel.LOW: return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case EscalationLevel.MEDIUM: return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case EscalationLevel.HIGH: return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      case EscalationLevel.CRITICAL: return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  const getTrendingStatus = (current: number, average: number) => {
    const diff = current - average;
    if (Math.abs(diff) < 0.5) return { label: 'In line with', icon: Minus, color: 'text-slate-400' };
    if (diff > 0) return { label: 'Above', icon: ArrowUpRight, color: 'text-emerald-400' };
    return { label: 'Below', icon: ArrowDownRight, color: 'text-red-400' };
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 text-slate-700 group-hover:text-red-600 transition-colors">
            <Activity className="w-8 h-8 opacity-20" />
          </div>
          <p className="text-xs font-mono uppercase text-slate-500 mb-1">Escalation Status</p>
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-bold uppercase tracking-wide ${getEscalationColor(report.escalationLevel)}`}>
             <ShieldAlert className="w-3.5 h-3.5" />
             {report.escalationLevel}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <p className="text-xs font-mono uppercase text-slate-500 mb-1">Analysis Period</p>
          <div className="flex items-center gap-2 text-white">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-lg font-semibold italic text-blue-400">Past 7 Days</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <p className="text-xs font-mono uppercase text-slate-500 mb-1">Primary Area of Responsibility</p>
          <div className="flex items-center gap-2 text-white">
            <MapPin className="w-4 h-4 text-slate-400" />
            <span className="text-lg font-semibold">Libya (National)</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <p className="text-xs font-mono uppercase text-slate-500 mb-1">Intelligence Asset ID</p>
          <div className="flex items-center gap-2 text-white font-mono">
            <Hash className="w-4 h-4 text-slate-400" />
            <span className="text-lg font-semibold uppercase">{report.id}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-xl relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-600 rounded-l-xl"></div>
            <div className="flex items-center gap-2 mb-6">
              <FileText className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-bold text-white uppercase tracking-tight">OSINT Executive Summary</h3>
            </div>
            <div className="text-slate-200 text-lg leading-relaxed mb-8 font-medium space-y-4">
              {report.summary.split('\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
            
            <div className="pt-8 border-t border-slate-800">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white uppercase tracking-tight">Strategic Assessment (6-Month Outlook)</h3>
              </div>
              <div className="text-slate-300 leading-relaxed italic border-l-4 border-emerald-500/50 pl-6 py-2 bg-emerald-500/5 rounded-r-lg">
                {report.strategicInsight.split('\n').map((para, i) => (
                  <p key={i} className="mb-2">{para}</p>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="w-5 h-5 text-red-500" />
              <h3 className="text-lg font-bold text-white uppercase tracking-tight">Intelligence Scoreboard (Delta to Baseline)</h3>
            </div>
            
            <div className="space-y-4">
              {report.scores.map((indicator) => {
                const isActive = Math.abs(indicator.score) > 0 || indicator.severity > 0;
                const trending = getTrendingStatus(indicator.score, indicator.averageSixMonthScore);
                const TrendIcon = trending.icon;

                return (
                  <div 
                    key={indicator.id} 
                    className={`p-4 rounded-lg border transition-all ${
                      isActive ? 'bg-slate-950/50 border-slate-700 shadow-inner' : 'bg-transparent border-slate-800 opacity-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 pr-4">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-slate-200 text-sm">{indicator.id}. {indicator.name}</h4>
                          <div className={`flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 ${trending.color} text-[10px] font-mono font-bold uppercase shadow-sm`}>
                            <TrendIcon className="w-3 h-3" />
                            {trending.label} 6M Avg
                          </div>
                        </div>
                        {isActive && <p className="text-xs text-slate-400 mt-2 font-mono leading-relaxed border-l border-slate-700 pl-3 italic">"{indicator.evidence}"</p>}
                      </div>
                      <div className="flex flex-col gap-2 items-end shrink-0">
                        <div className="flex gap-2">
                          <div className={`px-3 py-1 rounded text-[10px] font-mono font-bold border ${
                            indicator.score < 0 ? 'bg-red-900/20 border-red-800 text-red-400' : 
                            indicator.score > 0 ? 'bg-emerald-900/20 border-emerald-800 text-emerald-400' : 
                            'bg-slate-800 border-slate-700 text-slate-500'
                          }`}>
                            7D SCORE: {indicator.score > 0 ? `+${indicator.score}` : indicator.score}
                          </div>
                          <div className={`px-3 py-1 rounded text-[10px] font-mono font-bold border ${
                            indicator.severity >= 4 ? 'bg-red-600 text-white border-red-500' :
                            indicator.severity >= 2 ? 'bg-orange-600/50 text-white border-orange-500' :
                            'bg-slate-800 border-slate-700 text-slate-500'
                          }`}>
                            SEV: {indicator.severity}/5
                          </div>
                        </div>
                        <div className="text-[9px] font-mono text-slate-600 uppercase tracking-wider">Historical Baseline (6M): {indicator.averageSixMonthScore > 0 ? '+' : ''}{indicator.averageSixMonthScore}</div>
                      </div>
                    </div>
                    {isActive && (
                       <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
                          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-600 z-10"></div>
                          <div 
                            className={`h-full transition-all duration-1000 ${
                              indicator.score < 0 ? 'bg-red-500' : 'bg-emerald-500'
                            }`} 
                            style={{ 
                              width: `${(Math.abs(indicator.score) / 5) * 50}%`,
                              left: indicator.score < 0 ? `${50 - (Math.abs(indicator.score) / 5) * 50}%` : '50%',
                            }}
                          ></div>
                       </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl sticky top-24">
            <h3 className="text-md font-bold text-white mb-6 uppercase tracking-wider text-center flex items-center justify-center gap-2">
               <Activity className="w-4 h-4 text-red-500" />
               Threat Landscape Map
            </h3>
            <IndicatorChart data={report.scores} />
            
            <div className="mt-8 pt-8 border-t border-slate-800">
               <div className="flex items-center gap-2 mb-4">
                <LinkIcon className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-tight">Intelligence Sources (Past 7 Days)</h3>
              </div>
              <div className="space-y-2 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                {report.sources.length > 0 ? report.sources.map((src, idx) => (
                  <a 
                    key={idx} 
                    href={src.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-start gap-2 p-2 rounded bg-slate-800/50 border border-slate-700 hover:bg-slate-700 transition-colors group"
                  >
                    <ExternalLink className="w-3 h-3 text-slate-500 mt-1 shrink-0 group-hover:text-white" />
                    <span className="text-[10px] text-slate-300 font-medium line-clamp-2 leading-tight">{src.title}</span>
                  </a>
                )) : (
                  <p className="text-[10px] text-slate-600 italic text-center py-4">No direct grounding links extracted from scan.</p>
                )}
              </div>
            </div>

            <div className="mt-6 p-4 rounded-lg bg-red-950/20 border border-red-900/30 text-[11px] leading-relaxed text-red-400 font-medium">
              "OPERATIONAL NOTE: Analysis weighted towards 7-day OSINT signals. Tactical mobilization indicators should trigger immediate review of regional troop posture."
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
