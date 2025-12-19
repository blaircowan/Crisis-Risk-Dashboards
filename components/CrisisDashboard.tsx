import React, { useState, useRef, useEffect, useMemo } from 'react';
import { TacticalAnalysis } from '../types';
import { 
  Terminal, MapPin, Activity, 
  Target, Globe, ShieldAlert, 
  Users, Flame, AlertCircle, Info,
  ExternalLink, Map as MapIcon,
  Download, Loader2, MessageSquare, 
  Send, X, Bot, Sparkles, Lightbulb
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { createTacticalChatSession } from '../geminiService';
import { GenerateContentResponse } from '@google/genai';

interface CrisisDashboardProps {
  report: TacticalAnalysis;
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

const CrisisDashboard: React.FC<CrisisDashboardProps> = ({ report }) => {
  const [isExporting, setIsExporting] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);

  // Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [chatSession, setChatSession] = useState<any>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Dynamic tactical suggestions
  const suggestions = useMemo(() => {
    const s: string[] = [
      "Assess immediate movement risks.",
      "Summarize the most intense incidents.",
      "Identify areas to avoid.",
      "What is the overall tactical trend?"
    ];
    if (report.incidents.length > 0) {
      s.unshift(`Detail incident at ${report.incidents[0].coordinates.landmark}.`);
    }
    return s.slice(0, 4);
  }, [report.incidents]);

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
        text: `Tactical Liaison active for ${report.country}. I have indexed the ground-truth incidents from the OSINT sweep. Standing by for specific field queries.` 
      }]);
    }
  }, [isChatOpen, report.country]);

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
        session = await createTacticalChatSession(report);
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
      console.error("Tactical chat error:", err);
      setMessages(prev => [...prev, { role: 'model', text: "ERROR: Secure field link interrupted. Retry transmission." }]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleExportPDF = async () => {
    if (!dashboardRef.current) return;
    setIsExporting(true);
    try {
      const element = dashboardRef.current;
      const canvas = await html2canvas(element, { 
        scale: 2, 
        useCORS: true, 
        backgroundColor: '#020617', 
        logging: false 
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ 
        orientation: 'portrait', 
        unit: 'px', 
        format: [canvas.width / 2, canvas.height / 2] 
      });
      pdf.addImage(imgData, 'PNG', 0, 0, pdf.internal.pageSize.getWidth(), (canvas.height * pdf.internal.pageSize.getWidth() / canvas.width));
      pdf.save(`CRISIS_REPORT_${report.country.toUpperCase()}_${report.id}.pdf`);
    } catch (error) {
      console.error("Export failed", error);
      alert("Intelligence extraction failed: PDF generation interrupted.");
    } finally {
      setIsExporting(false);
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Social Unrest': return <Users className="w-5 h-5 text-blue-400" />;
      case 'Violent Disorder': return <Flame className="w-5 h-5 text-orange-500" />;
      case 'Coups/Political Instability': return <ShieldAlert className="w-5 h-5 text-red-500" />;
      case 'Live Combat Zones': return <Target className="w-5 h-5 text-red-600 animate-pulse" />;
      case 'Humanitarian Disaster': return <AlertCircle className="w-5 h-5 text-emerald-400" />;
      default: return <Info className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div ref={dashboardRef} className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 px-4">
      
      {/* Floating Tactical Chat UI */}
      <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-4 pointer-events-none">
        {isChatOpen && (
          <div className="w-[380px] h-[550px] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 duration-300 pointer-events-auto">
            {/* Chat Header */}
            <div className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Tactical Field Assistant</h4>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[9px] text-slate-400 font-mono uppercase tracking-tighter">Encrypted Link Active</span>
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
                      ? 'bg-emerald-600 text-white rounded-tr-none' 
                      : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'
                  }`}>
                    {msg.text || (isThinking && idx === messages.length - 1 ? (
                      <div className="flex gap-1 py-1">
                        <div className="w-1 h-1 bg-emerald-400 rounded-full animate-bounce"></div>
                        <div className="w-1 h-1 bg-emerald-400 rounded-full animate-bounce delay-100"></div>
                        <div className="w-1 h-1 bg-emerald-400 rounded-full animate-bounce delay-200"></div>
                      </div>
                    ) : null)}
                  </div>
                </div>
              ))}
            </div>

            {/* Suggestions & Input Area */}
            <div className="p-3 bg-slate-900 border-t border-slate-800 space-y-3">
              <div className="flex flex-wrap gap-2 overflow-x-auto pb-1 no-scrollbar">
                {suggestions.map((suggestion, i) => (
                  <button
                    key={i}
                    disabled={isThinking}
                    onClick={() => handleSendMessage(suggestion)}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-[10px] text-slate-400 hover:text-emerald-400 hover:border-emerald-500/50 transition-all whitespace-nowrap disabled:opacity-50"
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
                  placeholder="Query ground truth..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-4 pr-12 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all"
                />
                <button 
                  type="submit" 
                  disabled={isThinking || !inputMessage.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-md bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50 disabled:bg-slate-800 transition-all shadow-lg"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Tactical Toggle Button */}
        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95 pointer-events-auto relative ${
            isChatOpen ? 'bg-slate-800 text-slate-300' : 'bg-emerald-600 text-white'
          }`}
        >
          {isChatOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
          {!isChatOpen && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-slate-950 flex items-center justify-center animate-bounce">
              <Sparkles className="w-2.5 h-2.5 text-white" />
            </div>
          )}
        </button>
      </div>

      {/* Tactical Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-600/20 border border-emerald-500/30 rounded-lg flex items-center justify-center">
            <Terminal className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white uppercase tracking-tight">Tactical OSINT Dossier</h2>
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase">
              <span className="text-emerald-500">AOR: {report.country}</span>
              <span className="opacity-30">|</span>
              <span>ID: {report.id}</span>
              <span className="opacity-30">|</span>
              <span>VETTED AT: {new Date(report.timestamp).toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="hidden sm:block px-4 py-2 bg-slate-950 border border-slate-800 rounded text-center">
              <p className="text-[9px] text-slate-500 uppercase font-mono mb-0.5">Incident Count</p>
              <p className="text-lg font-bold text-white">{report.incidents.length}</p>
           </div>
           <div className="hidden sm:block px-4 py-2 bg-slate-950 border border-slate-800 rounded text-center">
              <p className="text-[9px] text-slate-500 uppercase font-mono mb-0.5">Data Integrity</p>
              <p className="text-lg font-bold text-emerald-500 uppercase">B2-VETTED</p>
           </div>
           <button 
             onClick={handleExportPDF} 
             disabled={isExporting} 
             className="shrink-0 flex items-center justify-center gap-2 px-6 py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-white font-bold text-xs uppercase transition-all shadow-xl disabled:opacity-50"
           >
             {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
             Export Dossier
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Assessment */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden h-full">
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-600"></div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" /> Situational Assessment
            </h3>
            <div className="space-y-4">
              <p className="text-slate-300 text-sm leading-relaxed font-medium bg-slate-950/40 p-4 rounded border border-slate-800/50">
                {report.overallAssessment}
              </p>
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-800">
               <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Protocol Reference</h4>
               <div className="space-y-3">
                  <div className="flex items-start gap-3">
                     <div className="w-5 h-5 rounded bg-blue-500/10 border border-blue-500/30 flex items-center justify-center shrink-0">
                        <Users className="w-3 h-3 text-blue-400" />
                     </div>
                     <p className="text-[10px] text-slate-500 italic">"Incidents categorized by kinetic signature and social mobilization patterns."</p>
                  </div>
                  <div className="flex items-start gap-3">
                     <div className="w-5 h-5 rounded bg-red-500/10 border border-red-500/30 flex items-center justify-center shrink-0">
                        <Target className="w-3 h-3 text-red-400" />
                     </div>
                     <p className="text-[10px] text-slate-500 italic">"Geospatial markers derived from landmark triangulation; ±200m accuracy threshold."</p>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Right: Incidents */}
        <div className="lg:col-span-8 space-y-6">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-2">
            <ShieldAlert className="w-4 h-4 text-orange-500" /> Ground Truth Extractions
          </h3>
          
          <div className="grid gap-6">
            {report.incidents.length > 0 ? report.incidents.map((incident, idx) => (
              <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex shadow-2xl transition-all hover:border-slate-700 group">
                <div className={`w-2 shrink-0 ${
                  incident.intensity >= 8 ? 'bg-red-600' : 
                  incident.intensity >= 5 ? 'bg-orange-500' : 'bg-blue-500'
                }`}></div>
                <div className="p-6 flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 group-hover:bg-slate-800 transition-colors shadow-inner">
                         {getCategoryIcon(incident.category)}
                      </div>
                      <div>
                        <span className="text-sm font-bold text-white uppercase tracking-tight block">{incident.category}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                            incident.proactiveIntent === 'Planning' ? 'bg-purple-900/20 border-purple-800 text-purple-400' : 'bg-slate-800 border-slate-700 text-slate-500'
                          } uppercase tracking-tighter`}>
                            {incident.proactiveIntent}
                          </span>
                          <span className="text-[9px] font-mono text-slate-600">ID: INC-{idx + 101}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 bg-slate-950/60 px-4 py-2 rounded-full border border-slate-800">
                        <div className="flex flex-col items-center">
                           <span className="text-[8px] text-slate-500 font-mono uppercase">Intensity</span>
                           <span className="text-xs font-bold text-white">{incident.intensity}/10</span>
                        </div>
                        <div className="w-px h-6 bg-slate-800"></div>
                        <div className="flex items-center gap-1">
                           {[...Array(10)].map((_, i) => (
                             <div key={i} className={`w-1.5 h-3 rounded-full ${i < incident.intensity ? (incident.intensity >= 7 ? 'bg-red-500' : 'bg-orange-500') : 'bg-slate-800'}`}></div>
                           ))}
                        </div>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Incident Title</h4>
                    <p className="text-base text-slate-100 font-bold leading-snug">{incident.summary}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-6 border-t border-slate-800/50">
                    <div className="md:col-span-5 space-y-4">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-[9px] text-slate-500 uppercase font-mono mb-1 tracking-wider">GEOSPATIAL MARKER</p>
                          <p className="text-xs text-slate-200 font-bold uppercase leading-tight">{incident.coordinates.landmark}</p>
                          <p className="text-[10px] text-slate-500 font-mono mt-0.5">{incident.coordinates.lat.toFixed(6)}, {incident.coordinates.lng.toFixed(6)}</p>
                          
                          <div className="mt-3 w-full h-32 rounded-lg bg-slate-950 border border-slate-800 overflow-hidden relative group/map">
                            <iframe 
                              title={`Map for ${incident.coordinates.landmark}`}
                              width="100%" 
                              height="100%" 
                              frameBorder="0" 
                              scrolling="no" 
                              marginHeight={0} 
                              marginWidth={0} 
                              src={`https://www.google.com/maps?q=${incident.coordinates.lat},${incident.coordinates.lng}&hl=en&z=14&output=embed`}
                              className="grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
                            ></iframe>
                            <div className="absolute inset-0 pointer-events-none border border-slate-800/50 rounded-lg"></div>
                            <a 
                              href={`https://www.google.com/maps/search/?api=1&query=${incident.coordinates.lat},${incident.coordinates.lng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="absolute bottom-2 right-2 p-1.5 bg-slate-900/80 backdrop-blur-sm rounded border border-slate-700 text-slate-400 hover:text-white transition-colors"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-7">
                      <div className="flex items-start gap-3 bg-slate-950/40 p-4 rounded-xl border border-slate-800/50 h-full">
                        <Terminal className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-[9px] text-slate-400 font-bold uppercase mb-2 tracking-widest flex items-center gap-1.5">
                            <MapIcon className="w-3 h-3" /> OSINT SUMMARY
                          </p>
                          <p className="text-sm text-slate-300 italic leading-relaxed font-medium">
                            {incident.evidenceSnippet}
                          </p>
                          
                          {incident.sourceUrl && (
                            <div className="mt-4">
                               <a 
                                href={incident.sourceUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="inline-flex items-center gap-2 px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-[10px] font-bold text-emerald-500 hover:text-emerald-400 transition-all uppercase shadow-lg"
                               >
                                  <Globe className="w-3.5 h-3.5" /> Source Intel Feed
                               </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="p-12 text-center border border-slate-800 border-dashed rounded-xl bg-slate-900/40">
                 <AlertCircle className="w-10 h-10 text-slate-700 mx-auto mb-4" />
                 <p className="text-sm text-slate-500 italic">No significant tactical events identified in current monitoring window.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrisisDashboard;