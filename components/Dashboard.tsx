import React, { useState, useRef, useEffect, useMemo } from 'react';
import { CrisisReport, EscalationLevel, IndicatorResult, Source, SourceType } from '../types';
import IndicatorChart from './IndicatorChart';
import { createChatSession } from '../geminiService';
import { GenerateContentResponse } from '@google/genai';
import { 
  LineChart, Line, ResponsiveContainer, YAxis, Tooltip 
} from 'recharts';
import { 
  ShieldAlert, Activity, 
  MapPin, Hash, ExternalLink, 
  FileText, Database, ArrowDownToLine, 
  ArrowUpToLine, HelpCircle, ChevronDown, 
  ChevronUp, Download, Loader2, ScanSearch, 
  AlertTriangle, CheckCircle2, Info, Target,
  Clock, Layers, Globe, Radio, Languages,
  MessageSquare, Send, X, Bot, Sparkles,
  Lightbulb
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface DashboardProps {
  report: CrisisReport;
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

const getRatingDescription = (rating: string): string => {
  const r = rating.toUpperCase();
  if (r.includes('A1')) return 'A1: Confirmed by multiple independent, reputable sources; ground truth confirmed.';
  if (r.includes('B2')) return 'B2: Reliable source; probable truth corroborated by secondary regional signals.';
  if (r.includes('C3')) return 'C3: Fairly reliable source; possible truth but lacks high-fidelity corroboration.';
  if (r.includes('D4')) return 'D4: Not usually reliable; doubtful credibility; requires tactical verification.';
  return `${r}: Intelligence grade based on Admiralty scale (Reliability A-F / Credibility 1-6).`;
};

const Sparkline: React.FC<{ data: number[] }> = ({ data }) => {
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentMonth = new Date().getMonth();
  const chartData = data.map((val, i) => {
    const monthIdx = (currentMonth - (5 - i) + 12) % 12;
    return { val, month: monthNames[monthIdx], i };
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
          <Line type="monotone" dataKey="val" stroke={isNegativeTrend ? '#ef4444' : '#10b981'} strokeWidth={2} dot={false} isAnimationActive={true} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ report }) => {
  const [expandedIndicators, setExpandedIndicators] = useState<Set<number>>(new Set());
  const [isExporting, setIsExporting] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);

  // Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [chatSession, setChatSession] = useState<any>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const sortedScores = [...report.scores].sort((a, b) => a.id - b.id);

  // Refined context-aware dynamic suggestions
  const suggestions = useMemo(() => {
    const indicators = [...report.scores].sort((a, b) => b.severity - a.severity);
    const dynamicS: string[] = [];

    if (indicators.length > 0) {
      // 1. Primary drivers for highest severity/score
      const top = indicators[0];
      dynamicS.push(`What are the primary drivers of the high score for ${top.name}?`);
      
      // 2. Momentum vs Historical Average for significant indicator
      if (indicators.length > 1) {
        const second = indicators[1];
        dynamicS.push(`How does the '7 Day Momentum' for ${second.name} compare to the 6-month average?`);
      }
      
      // 3. Elaborating on specific risk evidence
      if (indicators.length > 2) {
        const third = indicators[2];
        dynamicS.push(`Can you elaborate on the 'increasingRiskEvidence' for ${third.name}?`);
      }
    }

    // Baseline fallback questions
    const baseline = [
      "Analyze the highest risk vector.",
      "Identify de-escalation markers.",
    ];

    if (report.unverifiedEvents.length > 0) {
      baseline.push("Detail the unverified signals.");
    }

    return [...dynamicS, ...baseline].slice(0, 5);
  }, [report]);

  // Auto-scroll chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  // Initial welcome message
  useEffect(() => {
    if (isChatOpen && messages.length === 0) {
      setMessages([{ 
        role: 'model', 
        text: `Intel Analyst standing by for Report ${report.id}. I have indexed the tactical analysis for ${report.country}. How can I assist with your situational awareness?` 
      }]);
    }
  }, [isChatOpen, report.id, report.country]);

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
    try {
      const element = dashboardRef.current;
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#0f172a' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [canvas.width / 2, canvas.height / 2] });
      pdf.addImage(imgData, 'PNG', 0, 0, pdf.internal.pageSize.getWidth(), (canvas.height * pdf.internal.pageSize.getWidth() / canvas.width));
      pdf.save(`${report.country.toUpperCase()}_INTEL_V5_${report.id}.pdf`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleSendMessage = async (text?: string, e?: React.FormEvent) => {
    e?.preventDefault();
    const userMsg = text || inputMessage;
    if (!userMsg.trim() || isThinking) return;

    setInputMessage('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsThinking(true);

    try {
      let session = chatSession;
      if (!session) {
        session = await createChatSession(report);
        setChatSession(session);
      }

      const stream = await session.sendMessageStream({ message: userMsg });
      
      let fullModelText = '';
      setMessages(prev => [...prev, { role: 'model', text: '' }]);

      for await (const chunk of stream) {
        const chunkResponse = chunk as GenerateContentResponse;
        const textChunk = chunkResponse.text || '';
        fullModelText += textChunk;
        
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'model', text: fullModelText };
          return updated;
        });
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages(prev => [...prev, { role: 'model', text: "ERROR: Secure uplink interrupted. Please try again." }]);
    } finally {
      setIsThinking(false);
    }
  };

  // Group sources by type
  const groupedSources = report.sources.reduce((acc, source) => {
    const type = source.type || 'International';
    if (!acc[type]) acc[type] = [];
    acc[type].push(source);
    return acc;
  }, {} as Record<SourceType, Source[]>);

  const typeOrder: SourceType[] = ['Local', 'Regional', 'International'];

  return (
    <div ref={dashboardRef} className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 px-1 relative">
      
      {/* Floating Chat UI */}
      <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-4 pointer-events-none">
        {isChatOpen && (
          <div className="w-[380px] h-[550px] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 duration-300 pointer-events-auto">
            {/* Chat Header */}
            <div className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">AI Intel Assistant</h4>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[9px] text-slate-400 font-mono uppercase">Secure Link Active</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages Area */}
            <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-950/50">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'
                  }`}>
                    {msg.text || (isThinking && idx === messages.length - 1 ? (
                      <div className="flex gap-1 py-1">
                        <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce"></div>
                        <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce delay-100"></div>
                        <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce delay-200"></div>
                      </div>
                    ) : null)}
                  </div>
                </div>
              ))}
            </div>

            {/* Suggestions & Input Area */}
            <div className="p-3 bg-slate-900 border-t border-slate-800 space-y-3">
              {/* Suggestion Chips */}
              <div className="flex flex-wrap gap-2 overflow-x-auto pb-1 no-scrollbar">
                {suggestions.map((suggestion, i) => (
                  <button
                    key={i}
                    disabled={isThinking}
                    onClick={() => handleSendMessage(suggestion)}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-[10px] text-slate-400 hover:text-blue-400 hover:border-blue-500/50 transition-all whitespace-nowrap disabled:opacity-50"
                  >
                    <Lightbulb className="w-3 h-3 text-amber-500" />
                    {suggestion}
                  </button>
                ))}
              </div>

              <form onSubmit={(e) => handleSendMessage(undefined, e)} className="relative">
                <input 
                  type="text" 
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask for deeper analysis..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-4 pr-12 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
                />
                <button 
                  type="submit" 
                  disabled={isThinking || !inputMessage.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-md bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 disabled:bg-slate-800 transition-all shadow-lg"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Toggle Button */}
        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95 pointer-events-auto ${
            isChatOpen ? 'bg-slate-800 text-slate-300' : 'bg-red-600 text-white'
          }`}
        >
          {isChatOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
          {!isChatOpen && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full border-2 border-slate-950 flex items-center justify-center animate-bounce">
              <Sparkles className="w-2.5 h-2.5 text-white" />
            </div>
          )}
        </button>
      </div>

      {/* Header Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
            <p className="text-xs font-mono uppercase text-slate-500 mb-1">Escalation Status</p>
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-bold uppercase tracking-wide ${getEscalationColor(report.escalationLevel)}`}>
               <ShieldAlert className="w-3.5 h-3.5" />
               {report.escalationLevel}
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
            <p className="text-xs font-mono uppercase text-slate-500 mb-1">Target Area</p>
            <div className="flex items-center gap-2 text-white">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span className="text-lg font-semibold">{report.country}</span>
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
            <p className="text-xs font-mono uppercase text-slate-500 mb-1">Intelligence ID</p>
            <div className="flex items-center gap-2 text-white font-mono">
              <Hash className="w-4 h-4 text-slate-400" />
              <span className="text-lg font-semibold uppercase">{report.id}</span>
            </div>
          </div>
        </div>
        <button onClick={handleExportPDF} disabled={isExporting} className="shrink-0 flex items-center justify-center gap-2 px-6 py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-white font-bold text-xs uppercase transition-all shadow-xl disabled:opacity-50">
          {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          Export Dossier
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        <div className="lg:col-span-2 space-y-6">
          {/* Executive Summary & ACH Narrative - EXPANDED TO FULL HEIGHT */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-600"></div>
            <div className="flex items-center gap-2 mb-6">
              <FileText className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-bold text-white uppercase">Executive Intel Briefing</h3>
            </div>
            <div className="text-slate-200 text-lg leading-relaxed font-medium">
              {report.summary}
            </div>
            
            <div className="mt-8 pt-8 border-t border-slate-800">
              <div className="flex items-center gap-2 mb-4">
                <ScanSearch className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white uppercase tracking-tight">Strategic Vector Analysis</h3>
              </div>
              <p className="text-slate-300 italic border-l-4 border-emerald-500/50 pl-6 py-2 bg-emerald-500/5 rounded-r-lg">
                {report.strategicInsight}
              </p>
            </div>
          </div>

          {/* Indicator Scoreboard */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-red-500" />
                <h3 className="text-lg font-bold text-white uppercase">Intelligence Scoreboard</h3>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 bg-slate-800 px-3 py-1 rounded border border-slate-700">
                <Info className="w-3 h-3" /> ADMIRALTY CODE VETTED
              </div>
            </div>
            <div className="space-y-4">
              {sortedScores.map((indicator) => {
                const isExpanded = expandedIndicators.has(indicator.id);
                return (
                  <div key={indicator.id} className="p-4 rounded-lg border border-slate-700 bg-slate-950/50 transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 pr-4">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-bold text-slate-200 text-sm">{indicator.id}. {indicator.name}</h4>
                          <Sparkline data={indicator.historicalTrend} />
                        </div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="flex items-center gap-1 text-[10px] font-bold text-blue-400 bg-blue-900/20 px-2 py-0.5 rounded border border-blue-800">
                            Grade: {indicator.reliability}{indicator.credibility}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-mono leading-relaxed border-l-2 border-slate-700 pl-3 italic">"{indicator.evidence}"</p>
                        <button onClick={() => toggleIndicator(indicator.id)} className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-blue-400">
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          ACH Breakdown
                        </button>
                      </div>
                      <div className="flex flex-col gap-2 items-end shrink-0">
                        {/* Event Cluster Confirmed Badge */}
                        {indicator.isCorroborated && (
                          <div className="flex items-center gap-1 text-[8px] font-bold text-cyan-400 bg-cyan-900/20 px-2 py-0.5 rounded border border-cyan-800/50 uppercase tracking-tighter animate-pulse mb-1 shadow-[0_0_10px_rgba(34,211,238,0.1)]">
                            <Layers className="w-2.5 h-2.5" />
                            Cluster Confirmed
                          </div>
                        )}
                        <div className={`px-2 py-1 rounded text-[10px] font-mono font-bold border ${indicator.score < 0 ? 'bg-red-900/20 border-red-800 text-red-400' : 'bg-emerald-900/20 border-emerald-800 text-emerald-400'}`}>
                          7 Day Momentum: {indicator.score > 0 ? '+' : ''}{indicator.score}
                        </div>
                        <span className="text-[9px] font-mono text-slate-600 uppercase">Severity: {indicator.severity}/5</span>
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="mt-4 p-4 bg-slate-900 rounded-lg border border-slate-800 animate-in slide-in-from-top-2 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <h5 className="text-[9px] font-bold text-red-400 uppercase tracking-widest flex items-center gap-1">
                              <ArrowUpToLine className="w-3 h-3" /> Increasing Risk Hypotheses
                            </h5>
                            <p className="text-[10px] text-slate-300 leading-relaxed bg-red-900/10 p-2 rounded border border-red-900/20">{indicator.increasingRiskEvidence}</p>
                          </div>
                          <div className="space-y-2">
                            <h5 className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                              <ArrowDownToLine className="w-3 h-3" /> Stabilizing Hypotheses
                            </h5>
                            <p className="text-[10px] text-slate-300 leading-relaxed bg-emerald-900/10 p-2 rounded border border-emerald-900/20">{indicator.stabilizingRiskEvidence}</p>
                          </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-800">
                          <p className="text-[10px] text-slate-400 italic">
                            <span className="text-blue-400 font-bold uppercase mr-1">Appraisal:</span> {indicator.appraisal}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl sticky top-24">
            <h3 className="text-md font-bold text-white mb-6 uppercase tracking-wider text-center flex items-center justify-center gap-2">
               <Activity className="w-4 h-4 text-red-500" /> Vector Intensity
            </h3>
            <IndicatorChart data={report.scores} />

            {/* Unverified Signals */}
            <div className="mt-8 pt-8 border-t border-slate-800">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-white uppercase tracking-tight">Unverified Signals</h3>
              </div>
              <div className="space-y-2">
                {report.unverifiedEvents.length > 0 ? report.unverifiedEvents.map((ev, i) => (
                  <div key={i} className="p-3 bg-slate-950 border border-slate-800 rounded">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-slate-300 truncate pr-2">{ev.title}</span>
                      <span className="text-[9px] font-mono text-amber-500 bg-amber-500/10 px-1 rounded">{ev.sourceGrade}</span>
                    </div>
                    <p className="text-[9px] text-slate-600 leading-tight italic">{ev.reason}</p>
                  </div>
                )) : <p className="text-[10px] text-slate-600 italic">No low-credibility signals detected.</p>}
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-800">
               <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-400" />
                  <h3 className="text-sm font-bold text-white uppercase">Verified Sourcing</h3>
                </div>
                <span className="text-[10px] bg-blue-900/30 text-blue-400 px-2 py-0.5 rounded-full border border-blue-800 font-mono">{report.sources.length}</span>
              </div>
              
              <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {typeOrder.map(type => {
                  const sourcesOfType = groupedSources[type] || [];
                  if (sourcesOfType.length === 0) return null;
                  
                  return (
                    <div key={type} className="space-y-2">
                      <div className="flex items-center gap-2 px-1 mb-2">
                        {type === 'Local' && <Radio className="w-3 h-3 text-red-500" />}
                        {type === 'Regional' && <Languages className="w-3 h-3 text-amber-500" />}
                        {type === 'International' && <Globe className="w-3 h-3 text-blue-500" />}
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">{type} Nodes</h4>
                      </div>
                      {sourcesOfType.map((src, idx) => (
                        <a key={idx} href={src.uri} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2 p-3 rounded bg-slate-950 border border-slate-800 hover:border-blue-500/50 transition-all group">
                          <ExternalLink className="w-3 h-3 text-slate-600 group-hover:text-blue-400 mt-1 shrink-0" />
                          <div className="flex-1 overflow-hidden">
                            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                              {/* Admiralty Rating Tooltip Container */}
                              <div className="relative group/rating shrink-0">
                                <span className="text-[8px] font-bold bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700 font-mono group-hover/rating:border-blue-500/50 group-hover/rating:text-blue-400 transition-colors uppercase cursor-help">
                                  {src.rating || 'A1'}
                                </span>
                                <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-slate-800 border border-slate-700 rounded shadow-2xl text-[9px] text-slate-300 leading-tight hidden group-hover/rating:block z-50 animate-in fade-in slide-in-from-bottom-1 duration-150 pointer-events-none">
                                  {getRatingDescription(src.rating || 'A1')}
                                </div>
                              </div>
                              <span className="text-[10px] text-slate-200 font-bold block line-clamp-2 group-hover:text-white transition-colors leading-tight">
                                {src.title}
                              </span>
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RENAME BOX TO: 7 Day Momentum */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 mt-12">
        <div className="bg-slate-800/50 px-8 py-4 border-b border-slate-700/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <HelpCircle className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-bold text-white uppercase tracking-tight">7 Day Momentum</h3>
          </div>
          <span className="text-[10px] font-mono text-slate-500 uppercase">INTEL-D01-V5</span>
        </div>
        
        <div className="p-8 grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-4 space-y-6">
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                7 Day Momentum Temporal Delta
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                The <strong>7 Day Momentum Score</strong> is a tactical measure of momentum. Intelligence is constrained via <code>after:YYYY-MM-DD</code> filters to isolate developments from the baseline. <strong>If an indicator is not mentioned in the window, it is scored 0.</strong>
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Admiralty Grading
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Source Reliability (A-F) and Credibility (1-6). <strong>Only grade B2 or higher</strong> contributes to current Risk Scores. Lower grades are flagged as unverified noise.
              </p>
            </div>

            <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
              <p className="text-[10px] font-mono text-slate-500 uppercase mb-2">Weighting Protocol</p>
              <p className="text-[10px] text-slate-300 italic font-medium">
                "Corroborated events (3+ sources) receive 2x weight. Single-source reports are discounted by 50% according to AOR rules."
              </p>
            </div>
          </div>

          <div className="md:col-span-8">
            <h4 className="text-sm font-bold text-slate-200 uppercase tracking-widest mb-6 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-500" />
              Indicator Scale: -5 to +5
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
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
                  <span className="text-[10px] text-slate-500 leading-tight uppercase font-bold">Significant Escalation / Crisis Risk</span>
                </div>
              </div>

              <div className="space-y-3 bg-slate-800/20 p-4 rounded-xl border border-slate-700/30">
                <div className="flex items-center justify-center mb-1">
                  <span className="text-slate-500 font-bold text-xs font-mono uppercase">Baseline</span>
                </div>
                <div className="h-2 w-full bg-slate-700 rounded-full flex justify-center">
                   <div className="h-full w-1 bg-slate-400"></div>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xl font-bold text-slate-200 font-mono">0</span>
                  <span className="text-[10px] text-slate-500 leading-tight uppercase font-bold text-center">No Change / Status Quo</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-500 font-bold text-xs font-mono uppercase">Accord</span>
                  <ArrowUpToLine className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                   <div className="h-full w-full bg-emerald-600/50"></div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-emerald-400 font-mono">+5</span>
                  <span className="text-[10px] text-slate-500 leading-tight uppercase font-bold">Significant De-escalation / Stability</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-6">
               <div className="flex gap-3 items-start">
                  <div className="w-6 h-6 rounded bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/30">
                     <Target className="w-3 h-3 text-blue-400" />
                  </div>
                  <div>
                    <h5 className="text-[11px] font-bold text-slate-300 uppercase">ACH Framework</h5>
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      "Analysis of Competing Hypotheses" weighs Deterioration narratives against Stabilization narratives to derive the net delta.
                    </p>
                  </div>
               </div>
               <div className="flex gap-3 items-start">
                  <div className="w-6 h-6 rounded bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/30">
                     <AlertTriangle className="w-3 h-3 text-amber-400" />
                  </div>
                  <div>
                    <h5 className="text-[11px] font-bold text-slate-300 uppercase">Ground Truth</h5>
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      Kinetic markers must be geolocated via Liveuamap.com or cross-referenced with wire services (Reuters/AP) to meet the B2 threshold.
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