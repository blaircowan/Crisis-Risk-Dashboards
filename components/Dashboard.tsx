
import React, { useState, useRef } from 'react';
import { CrisisReport, EscalationLevel, IndicatorResult } from '../types';
import IndicatorChart from './IndicatorChart';
import { 
  LineChart, Line, ResponsiveContainer, YAxis, Tooltip 
} from 'recharts';
import { 
  ShieldAlert, TrendingUp, Info, Activity, 
  Calendar, MapPin, Hash, ExternalLink, 
  Link as LinkIcon, FileText, Database,
  ArrowDownToLine, ArrowUpToLine, HelpCircle,
  ChevronDown, ChevronUp, Download, Loader2,
  ScanSearch, Target
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface DashboardProps {
  report: CrisisReport;
}

const Sparkline: React.FC<{ data: number[] }> = ({ data }) => {
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentMonth = new Date().getMonth();
  
  const chartData = data.map((val, i) => {
    const monthIdx = (currentMonth - (5 - i) + 12) % 12;
    return { 
      val, 
      month: monthNames[monthIdx],
      i 
    };
  });
  
  const isNegativeTrend = data[data.length - 1] < data[0];
  
  return (
    <div className="h-8 w-20 opacity-80 cursor-crosshair">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <YAxis domain={[-5, 5]} hide />
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const value = payload[0].value as number;
                return (
                  <div className="bg-slate-900 border border-slate-700 px-2 py-1 rounded shadow-2xl text-[9px] font-mono pointer-events-none z-50">
                    <p className="text-slate-500 uppercase leading-none mb-1">{payload[0].payload.month}</p>
                    <p className={`font-bold leading-none ${value >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {value > 0 ? '+' : ''}{value}
                    </p>
                  </div>
                );
              }
              return null;
            }}
            cursor={{ stroke: '#334155', strokeWidth: 1 }}
            isAnimationActive={false}
          />
          <Line 
            type="monotone" 
            dataKey="val" 
            stroke={isNegativeTrend ? '#ef4444' : '#10b981'} 
            strokeWidth={2} 
            dot={false}
            activeDot={{ r: 3, fill: isNegativeTrend ? '#ef4444' : '#10b981', stroke: '#0f172a', strokeWidth: 1 }}
            isAnimationActive={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ report }) => {
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
  const [isStrategicExpanded, setIsStrategicExpanded] = useState(false);
  const [expandedIndicators, setExpandedIndicators] = useState<Set<number>>(new Set());
  const [isExporting, setIsExporting] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);

  // Ensure indicators are sorted by ID for consistent display
  const sortedScores = [...report.scores].sort((a, b) => a.id - b.id);

  const toggleIndicator = (id: number) => {
    setExpandedIndicators(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getEscalationColor = (level: EscalationLevel) => {
    switch (level) {
      case EscalationLevel.LOW: return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case EscalationLevel.MEDIUM: return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case EscalationLevel.HIGH: return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      case EscalationLevel.CRITICAL: return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  const handleExportPDF = async () => {
    if (!dashboardRef.current) return;
    setIsExporting(true);

    const prevSummary = isSummaryExpanded;
    const prevStrategic = isStrategicExpanded;
    const prevIndicators = new Set(expandedIndicators);

    // Force expand all for capture
    setIsSummaryExpanded(true);
    setIsStrategicExpanded(true);
    setExpandedIndicators(new Set(report.scores.map(s => s.id)));

    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      const element = dashboardRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0f172a',
        logging: false,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2]
      });

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`LIBYA_INTEL_DOSSIER_${report.id}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('PDF Export failed:', error);
      alert('Failed to generate PDF dossier.');
    } finally {
      setIsSummaryExpanded(prevSummary);
      setIsStrategicExpanded(prevStrategic);
      setExpandedIndicators(prevIndicators);
      setIsExporting(false);
    }
  };

  const summaryParagraphs = report.summary.split('\n').filter(p => p.trim() !== '');
  const strategicParagraphs = report.strategicInsight.split('\n').filter(p => p.trim() !== '');

  return (
    <div ref={dashboardRef} className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 px-1">
      {/* Header Actions & Stat Cards */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full">
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
            <p className="text-xs font-mono uppercase text-slate-500 mb-1">Area of Responsibility</p>
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

        <button 
          onClick={handleExportPDF}
          disabled={isExporting}
          className="shrink-0 flex items-center justify-center gap-2 px-6 py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-white font-bold text-xs uppercase tracking-widest transition-all active:scale-[0.98] shadow-xl disabled:opacity-50"
        >
          {isExporting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Rendering Dossier...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Export Intelligence Dossier
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-600 rounded-l-xl"></div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-bold text-white uppercase tracking-tight">OSINT Executive Summary</h3>
              </div>
            </div>

            <div className={`text-slate-200 text-lg leading-relaxed font-medium space-y-4 transition-all duration-500 ${isSummaryExpanded ? '' : 'max-h-32 overflow-hidden'}`}>
              {summaryParagraphs.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
              {!isSummaryExpanded && summaryParagraphs.length > 1 && <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none"></div>}
            </div>
            
            <button 
              onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
              className="mt-4 flex items-center gap-2 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-widest"
            >
              {isSummaryExpanded ? (
                <><ChevronUp className="w-4 h-4" /> Show Less</>
              ) : (
                <><ChevronDown className="w-4 h-4" /> Read More Intelligence</>
              )}
            </button>
            
            <div className="pt-8 mt-8 border-t border-slate-800">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white uppercase tracking-tight">Strategic Assessment (6-Month Outlook)</h3>
              </div>
              
              <div className={`text-slate-300 leading-relaxed italic border-l-4 border-emerald-500/50 pl-6 py-2 bg-emerald-500/5 rounded-r-lg transition-all duration-500 ${isStrategicExpanded ? '' : 'max-h-24 overflow-hidden relative'}`}>
                {strategicParagraphs.map((para, i) => (
                  <p key={i} className="mb-2">{para}</p>
                ))}
                {!isStrategicExpanded && strategicParagraphs.length > 1 && <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-slate-900/50 to-transparent pointer-events-none"></div>}
              </div>

              <button 
                onClick={() => setIsStrategicExpanded(!isStrategicExpanded)}
                className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors uppercase tracking-widest"
              >
                {isStrategicExpanded ? (
                  <><ChevronUp className="w-4 h-4" /> Show Less</>
                ) : (
                  <><ChevronDown className="w-4 h-4" /> Read Full Assessment</>
                )}
              </button>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="w-5 h-5 text-red-500" />
              <h3 className="text-lg font-bold text-white uppercase tracking-tight">Intelligence Scoreboard (Tactical Delta)</h3>
            </div>
            
            <div className="space-y-4">
              {sortedScores.map((indicator) => {
                const isActive = Math.abs(indicator.score) > 0 || indicator.severity > 0;
                const isExpanded = expandedIndicators.has(indicator.id);
                
                return (
                  <div 
                    key={indicator.id} 
                    className={`p-4 rounded-lg border transition-all ${
                      isActive ? 'bg-slate-950/50 border-slate-700 shadow-inner' : 'bg-transparent border-slate-800 opacity-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 pr-4">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-bold text-slate-200 text-sm whitespace-nowrap">{indicator.id}. {indicator.name}</h4>
                          <div className="flex items-center gap-2">
                             <span className="text-[9px] font-mono text-slate-500 uppercase">6M TREND:</span>
                             <Sparkline data={indicator.historicalTrend} />
                          </div>
                        </div>
                        
                        {/* Always Visible Short Evidence */}
                        {isActive && (
                           <p className="text-xs text-slate-400 mt-2 font-mono leading-relaxed border-l border-slate-700 pl-3 italic">
                             "{indicator.evidence}"
                           </p>
                        )}

                        {isActive && (
                          <button 
                            onClick={() => toggleIndicator(indicator.id)}
                            className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-widest"
                          >
                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            {isExpanded ? 'Hide Deep-Dive' : 'Expand Detailed Appraisal'}
                          </button>
                        )}
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
                        <div className="text-[9px] font-mono text-slate-600 uppercase tracking-wider">Avg Baseline: {indicator.averageSixMonthScore > 0 ? '+' : ''}{indicator.averageSixMonthScore}</div>
                      </div>
                    </div>
                    
                    {/* Expandable Detailed Appraisal Box */}
                    {isActive && isExpanded && (
                      <div className="mt-3 mb-4 p-4 bg-slate-900 rounded-lg border border-slate-800 animate-in slide-in-from-top-2 duration-300">
                        <div className="flex items-center gap-2 mb-2">
                           <ScanSearch className="w-3 h-3 text-blue-400" />
                           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Intelligence Deep-Dive</span>
                        </div>
                        <div className="text-[11px] text-slate-200 leading-relaxed border-l-2 border-blue-500/50 pl-3">
                          {indicator.appraisal}
                        </div>
                      </div>
                    )}

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
               <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-tight">Key OSINT Sourcing</h3>
                </div>
                <span className="text-[10px] bg-blue-900/30 text-blue-400 px-2 py-0.5 rounded-full border border-blue-800 font-mono">
                  {report.sources.length} SOURCES
                </span>
              </div>
              
              <p className="text-[10px] text-slate-500 mb-3 italic leading-tight">
                Direct evidence utilized for indicator scoring and 6-month volatility assessment:
              </p>

              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {report.sources.length > 0 ? report.sources.map((src, idx) => (
                  <a 
                    key={idx} 
                    href={src.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-start gap-2 p-3 rounded bg-slate-950 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-900 transition-all group"
                  >
                    <div className="mt-0.5 shrink-0">
                      <ExternalLink className="w-3 h-3 text-slate-600 group-hover:text-blue-400" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <span className="text-[10px] text-slate-300 font-bold block mb-0.5 line-clamp-1 group-hover:text-blue-200 transition-colors">
                        {src.title}
                      </span>
                      <span className="text-[9px] text-slate-600 font-mono block truncate opacity-50 group-hover:opacity-100 transition-opacity">
                        {src.uri}
                      </span>
                    </div>
                  </a>
                )) : (
                  <div className="flex flex-col items-center justify-center py-10 opacity-30">
                    <LinkIcon className="w-8 h-8 mb-2" />
                    <p className="text-[10px] text-slate-500 italic text-center uppercase tracking-widest">No verified sources returned from this scan</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 p-4 rounded-lg bg-red-950/20 border border-red-900/30 text-[11px] leading-relaxed text-red-400 font-medium">
              "OPERATIONAL NOTE: Sources include direct grounding from LLM search and explicit key intelligence references. All scores validated against the identified OSINT cluster."
            </div>
          </div>
        </div>
      </div>

      {/* 7D Scoring Methodology Explanation Box */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
        <div className="bg-slate-800/50 px-8 py-4 border-b border-slate-700/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <HelpCircle className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-bold text-white uppercase tracking-tight">Technical Reference: 7D Intelligence Scoring</h3>
          </div>
          <span className="text-[10px] font-mono text-slate-500 uppercase">Reference Doc // INTEL-METRIC-01</span>
        </div>
        
        <div className="p-8 grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-4 space-y-4">
            <h4 className="text-sm font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-500" />
              The Metric Logic
            </h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              The <strong>7D Score</strong> (7-Day Score) is a tactical delta indicating the net momentum of an indicator over the last week. It transforms qualitative news signals into a quantitative signal for rapid commander assessment.
            </p>
            <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
              <p className="text-[11px] font-mono text-slate-500 uppercase mb-2">Primary Objective</p>
              <p className="text-xs text-slate-300 italic font-medium">
                "Differentiate tactical 'noise' from strategic escalation via real-time OSINT synthesis."
              </p>
            </div>
          </div>

          <div className="md:col-span-8">
            <h4 className="text-sm font-bold text-slate-200 uppercase tracking-widest mb-6 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-500" />
              Indicator Scale: -5 to +5
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Negative Side */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-red-500 font-bold text-xs font-mono uppercase">Escalation</span>
                  <ArrowDownToLine className="w-4 h-4 text-red-500" />
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                   <div className="h-full w-full bg-red-600/50"></div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-red-400 font-mono">-5</span>
                  <span className="text-[10px] text-slate-500 leading-tight">CRITICAL FAILURE / HOSTILE MOBILIZATION</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Scores from -1 to -5 indicate increasing kinetic or political instability.
                </p>
              </div>

              {/* Zero Baseline */}
              <div className="space-y-3 bg-slate-800/20 p-4 rounded-xl border border-slate-700/30">
                <div className="flex items-center justify-center mb-1">
                  <span className="text-slate-500 font-bold text-xs font-mono uppercase">Baseline</span>
                </div>
                <div className="h-2 w-full bg-slate-700 rounded-full flex justify-center">
                   <div className="h-full w-1 bg-slate-400"></div>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xl font-bold text-slate-200 font-mono">0</span>
                  <span className="text-[10px] text-slate-500 leading-tight uppercase font-bold">Static / No Change</span>
                </div>
                <p className="text-[11px] text-slate-500 text-center">
                  The situation is in line with the 6-month historical baseline.
                </p>
              </div>

              {/* Positive Side */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-500 font-bold text-xs font-mono uppercase">Stabilization</span>
                  <ArrowUpToLine className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                   <div className="h-full w-full bg-emerald-600/50"></div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-emerald-400 font-mono">+5</span>
                  <span className="text-[10px] text-slate-500 leading-tight">FORMAL ACCORD / DE-ESCALATION</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Scores from +1 to +5 indicate measurable improvements in stability.
                </p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="flex gap-3 items-start">
                  <div className="w-6 h-6 rounded bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/30">
                     <TrendingUp className="w-3 h-3 text-blue-400" />
                  </div>
                  <div>
                    <h5 className="text-[11px] font-bold text-slate-300 uppercase">Contextual Sparklines</h5>
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      Sparklines visualize the 6-month historical volatility, allowing you to identify if a current 7D Score is a "spike" or a persistent trend.
                    </p>
                  </div>
               </div>
               <div className="flex gap-3 items-start">
                  <div className="w-6 h-6 rounded bg-red-500/10 flex items-center justify-center shrink-0 border border-red-500/30">
                     <ShieldAlert className="w-3 h-3 text-red-400" />
                  </div>
                  <div>
                    <h5 className="text-[11px] font-bold text-slate-300 uppercase">Severity Weighting</h5>
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      High-severity (SEV 4/5) indicators trigger immediate escalation alerts, even if the 7D score is low, to account for low-probability high-impact events.
                    </p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
