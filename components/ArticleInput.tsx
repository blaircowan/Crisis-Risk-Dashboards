
import React from 'react';
import { Loader2, Radio, Map, ChevronDown, Target, ShieldCheck, Shield, UserCircle2, Terminal } from 'lucide-react';
import { Country } from '../types';

interface ArticleInputProps {
  onSubmit: () => void;
  isLoading: boolean;
  selectedCountry: Country;
  onCountryChange: (country: Country) => void;
}

const ArticleInput: React.FC<ArticleInputProps> = ({ onSubmit, isLoading, selectedCountry, onCountryChange }) => {
  // Region-based UI elements for thematic context
  let accentColor = 'text-red-500';
  let bgColor = 'bg-red-900/10';
  let borderColor = 'border-red-500/30';

  const africaRegion = [
    Country.LIBYA, Country.EGYPT, Country.NIGERIA, Country.NIGER, 
    Country.MALI, Country.CHAD, Country.CAMEROON, Country.SOMALIA, 
    Country.SOUTH_SUDAN, Country.ETHIOPIA, Country.ERITREA, Country.DRC
  ];
  const middleEastRegion = [
    Country.LEBANON, Country.ISRAEL, Country.PALESTINE, 
    Country.IRAQ, Country.ARMENIA, Country.GEORGIA
  ];
  const asiaRegion = [
    Country.PAKISTAN, Country.BANGLADESH, Country.NEPAL, 
    Country.MYANMAR, Country.INDONESIA
  ];
  const europeAmericasRegion = [
    Country.BIH, Country.MOLDOVA, Country.UKRAINE, 
    Country.GUYANA, Country.VENEZUELA, Country.TCI
  ];

  if (africaRegion.includes(selectedCountry)) {
    accentColor = 'text-emerald-500';
    bgColor = 'bg-emerald-900/10';
    borderColor = 'border-emerald-500/30';
  } else if (middleEastRegion.includes(selectedCountry)) {
    accentColor = 'text-amber-500';
    bgColor = 'bg-amber-900/10';
    borderColor = 'border-amber-500/30';
  } else if (asiaRegion.includes(selectedCountry)) {
    accentColor = 'text-blue-500';
    bgColor = 'bg-blue-900/10';
    borderColor = 'border-blue-500/30';
  } else if (europeAmericasRegion.includes(selectedCountry)) {
    accentColor = 'text-purple-500';
    bgColor = 'bg-purple-900/10';
    borderColor = 'border-purple-500/30';
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl relative overflow-hidden transition-all duration-500">
      <div className={`absolute top-0 right-0 w-64 h-64 ${bgColor} blur-[100px] pointer-events-none transition-colors duration-700`}></div>
      
      <div className="relative z-10 text-center">
        <div className="flex justify-center mb-6">
          <div className={`w-16 h-16 ${bgColor} rounded-full flex items-center justify-center border ${borderColor} animate-pulse transition-all duration-700`}>
            <Radio className={`${accentColor} w-8 h-8 transition-colors duration-700`} />
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-white tracking-tight mb-2 uppercase">AI-ENABLED OSINT ANALYST</h2>
        <p className="text-slate-500 text-[10px] font-mono mb-6 tracking-[0.3em] uppercase">Regional OSINT Scanner</p>

        {/* Analyst Introduction Briefing */}
        <div className="max-w-xl mx-auto mb-10 text-left bg-slate-950/40 border-l-2 border-red-600 rounded-r-lg p-5 animate-in fade-in slide-in-from-top-2 duration-700">
          <div className="flex items-center gap-2 mb-3">
            <UserCircle2 className="w-4 h-4 text-red-500" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lead Analyst Briefing</span>
          </div>
          <p className="text-slate-200 text-xs leading-relaxed font-medium">
            Welcome to <span className="text-white font-bold">Crisis Radar AI</span>. I am your Lead Analyst. When you are ready for your country assessment, select a <span className="text-white font-bold">'Region of Interest'</span> from the menu below. If you need immediate tactical support click the <span className="text-white font-bold">Crisis Tasking tab</span>.
          </p>
          <div className="mt-4 flex items-start gap-2 pt-3 border-t border-slate-800/50">
            <Terminal className="w-3 h-3 text-slate-600 mt-1 shrink-0" />
            <p className="text-[10px] text-slate-400 leading-normal italic">
              Once initialized, I will execute a multi-source OSINT sweep - cross referencing international and regional news, and ground-truth mapping. I will then apply the Admiralty Code for source verification, and produce a high-precision report of crisis vectors, and their momentum in the last 7 days. You can ask me questions in the chat if you have any follow-ups.
            </p>
          </div>
        </div>

        {/* Tactical Country Selector */}
        <div className="max-w-sm mx-auto mb-10 group">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest text-left">SELECT REGION OF INTEREST</label>
            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded border ${borderColor} ${bgColor} transition-all duration-700`}>
              <div className={`w-1.5 h-1.5 rounded-full ${accentColor.replace('text', 'bg')} animate-pulse`}></div>
              <span className={`text-[8px] font-bold uppercase ${accentColor}`}>{selectedCountry} ACTIVE</span>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Map className={`h-4 w-4 ${accentColor} opacity-50 transition-colors duration-700`} />
            </div>
            <select
              value={selectedCountry}
              onChange={(e) => onCountryChange(e.target.value as Country)}
              disabled={isLoading}
              className="block w-full pl-10 pr-10 py-4 bg-slate-950 border border-slate-800 rounded-lg text-white font-bold uppercase text-sm tracking-widest appearance-none focus:outline-none focus:ring-2 focus:ring-slate-700 transition-all cursor-pointer disabled:opacity-50 hover:border-slate-600"
            >
              <optgroup label="AOR: Africa (North, West, Central, Horn)" className="bg-slate-900 text-slate-400 font-mono text-[10px] uppercase">
                <option value={Country.LIBYA}>Libya</option>
                <option value={Country.EGYPT}>Egypt</option>
                <option value={Country.NIGERIA}>Nigeria</option>
                <option value={Country.NIGER}>Niger</option>
                <option value={Country.MALI}>Mali</option>
                <option value={Country.CHAD}>Chad</option>
                <option value={Country.CAMEROON}>Cameroon</option>
                <option value={Country.SOMALIA}>Somalia</option>
                <option value={Country.SOUTH_SUDAN}>South Sudan</option>
                <option value={Country.ETHIOPIA}>Ethiopia</option>
                <option value={Country.ERITREA}>Eritrea</option>
                <option value={Country.DRC}>DR Congo</option>
              </optgroup>
              <optgroup label="AOR: Middle East & Caucasus" className="bg-slate-900 text-slate-400 font-mono text-[10px] uppercase">
                <option value={Country.LEBANON}>Lebanon</option>
                <option value={Country.ISRAEL}>Israel</option>
                <option value={Country.PALESTINE}>Palestine</option>
                <option value={Country.IRAQ}>Iraq</option>
                <option value={Country.ARMENIA}>Armenia</option>
                <option value={Country.GEORGIA}>Georgia</option>
              </optgroup>
              <optgroup label="AOR: South & Southeast Asia" className="bg-slate-900 text-slate-400 font-mono text-[10px] uppercase">
                <option value={Country.PAKISTAN}>Pakistan</option>
                <option value={Country.BANGLADESH}>Bangladesh</option>
                <option value={Country.NEPAL}>Nepal</option>
                <option value={Country.MYANMAR}>Myanmar</option>
                <option value={Country.INDONESIA}>Indonesia</option>
              </optgroup>
              <optgroup label="AOR: Europe & Americas" className="bg-slate-900 text-slate-400 font-mono text-[10px] uppercase">
                <option value={Country.BIH}>Bosnia & Herzegovina</option>
                <option value={Country.MOLDOVA}>Moldova</option>
                <option value={Country.UKRAINE}>Ukraine</option>
                <option value={Country.GUYANA}>Guyana</option>
                <option value={Country.VENEZUELA}>Venezuela</option>
                <option value={Country.TCI}>Turks and Caicos Islands</option>
              </optgroup>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <ChevronDown className="h-4 w-4 text-slate-600" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 text-left max-w-md mx-auto">
          <div className="flex items-start gap-3 p-3 bg-slate-950/50 rounded-lg border border-slate-800 group hover:border-slate-600 transition-colors">
            <Target className="w-5 h-5 text-amber-500 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase">Framework V7</h4>
              <p className="text-[10px] text-slate-500">Regional indicators optimized for {selectedCountry}.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-slate-950/50 rounded-lg border border-slate-800 group hover:border-slate-600 transition-colors">
            <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase">Verification</h4>
              <p className="text-[10px] text-slate-500">Admiralty Scale cross-referencing enabled.</p>
            </div>
          </div>
        </div>

        <button
          onClick={onSubmit}
          disabled={isLoading}
          className={`w-full py-5 rounded-lg font-bold uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-3 transition-all ${
            isLoading
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
              : 'bg-red-600 text-white hover:bg-red-500 shadow-xl shadow-red-900/20 active:scale-[0.98]'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Scanning {selectedCountry} Intel Nodes...
            </>
          ) : (
            <>
              <Shield className="w-4 h-4" />
              Initialize {selectedCountry} OSINT Scan
            </>
          )}
        </button>
      </div>

      <div className="mt-12 pt-6 border-t border-slate-800 grid grid-cols-3 gap-2 text-[9px] text-slate-600 uppercase font-mono tracking-tighter">
        <div className="flex items-center gap-1">
          <div className={`w-1.5 h-1.5 rounded-full ${accentColor.replace('text', 'bg')}`}></div>
          ZONE: {selectedCountry}
        </div>
        <div className="flex items-center gap-1">
          <div className={`w-1.5 h-1.5 rounded-full ${accentColor.replace('text', 'bg')}`}></div>
          STATUS: READY
        </div>
        <div className="flex items-center gap-1">
          <div className={`w-1.5 h-1.5 rounded-full ${accentColor.replace('text', 'bg')}`}></div>
          TEMPORAL: 7 Day Momentum DELTA
        </div>
      </div>
    </div>
  );
};

export default ArticleInput;
