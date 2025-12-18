
import React from 'react';
import { Loader2, Radio, Zap, ShieldCheck } from 'lucide-react';

interface ArticleInputProps {
  onSubmit: () => void;
  isLoading: boolean;
}

const ArticleInput: React.FC<ArticleInputProps> = ({ onSubmit, isLoading }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-red-900/10 blur-[100px] pointer-events-none"></div>
      
      <div className="relative z-10 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center border border-red-500/30 animate-pulse">
            <Radio className="text-red-500 w-8 h-8" />
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-white tracking-tight mb-4 uppercase">Live OSINT Scanner</h2>
        
        <p className="text-slate-400 text-base mb-8 leading-relaxed max-w-lg mx-auto">
          Automated collection of open-source intelligence from international news outlets, local Libyan reports, and social feeds. 
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 text-left max-w-md mx-auto">
          <div className="flex items-start gap-3 p-3 bg-slate-950/50 rounded-lg border border-slate-800">
            <Zap className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase">Real-time</h4>
              <p className="text-[10px] text-slate-500">Scans sources from the last 72 hours.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-slate-950/50 rounded-lg border border-slate-800">
            <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase">Grounding</h4>
              <p className="text-[10px] text-slate-500">Includes direct citations to news articles.</p>
            </div>
          </div>
        </div>

        <button
          onClick={onSubmit}
          disabled={isLoading}
          className={`w-full py-5 rounded-lg font-bold uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-3 transition-all ${
            isLoading
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-red-600 text-white hover:bg-red-500 shadow-xl shadow-red-900/20 active:scale-[0.98]'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Scanning Information Feeds...
            </>
          ) : (
            <>
              Initialize Intelligence Scan
            </>
          )}
        </button>
      </div>

      <div className="mt-12 pt-6 border-t border-slate-800 grid grid-cols-3 gap-2 text-[9px] text-slate-600 uppercase font-mono tracking-tighter">
        <div className="flex items-center gap-1">
          <div className="w-1 h-1 rounded-full bg-red-500"></div>
          Signal: Active
        </div>
        <div className="flex items-center gap-1">
          <div className="w-1 h-1 rounded-full bg-red-500"></div>
          Nodes: Global
        </div>
        <div className="flex items-center gap-1">
          <div className="w-1 h-1 rounded-full bg-red-500"></div>
          Source: Grounded
        </div>
      </div>
    </div>
  );
};

export default ArticleInput;
