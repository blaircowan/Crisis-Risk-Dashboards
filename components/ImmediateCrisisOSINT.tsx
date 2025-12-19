
import React, { useState } from 'react';
import { Terminal, Globe, Loader2, Activity, Compass, Search, Radio } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { TacticalAnalysis } from '../types';

const ALL_COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
  "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi",
  "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czechia",
  "DR Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia",
  "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
  "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Ivory Coast", "Jamaica", "Japan", "Jordan",
  "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
  "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar",
  "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman",
  "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda",
  "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria",
  "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu",
  "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

interface ImmediateCrisisOSINTProps {
  onResult: (result: TacticalAnalysis) => void;
}

const ImmediateCrisisOSINT: React.FC<ImmediateCrisisOSINTProps> = ({ onResult }) => {
  const [country, setCountry] = useState('Libya');
  const [isLoading, setIsLoading] = useState(false);

  const monitorLiveFeeds = async () => {
    setIsLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Execute a real-time OSINT sweep for ${country}. Search for the latest social media reports (Twitter/X, TikTok, Telegram) and localized news snippets from the last 24-48 hours.`,
        config: {
          systemInstruction: `You are a Tactical OSINT Intelligence Analyst supporting an operator on the ground.
          Task: Access available social media (Twitter, TikTok, Telegram) and news snippets to provide real-time situational awareness.
          
          Priority Indicators (Triage Criteria):
          - Social Unrest: Demonstrations, strikes, mass gatherings.
          - Violent Disorder: Riot police, tear gas, barricades, clashes.
          - Coups/Political Instability: Military movement, station seizures, detentions.
          - Live Combat Zones: Shelling, small arms fire, drone sightings.
          - Humanitarian Disaster: Mass displacement, infrastructure collapse, famine alerts.

          Extraction Requirements for EVERY incident:
          1. Coordinates: Estimate Latitude/Longitude based on mentioned landmarks/streets.
          2. Intensity: Scale 1-10 (1=peaceful, 10=urban warfare).
          3. Proactive Intent: Identify if Reporting an event or Planning one.
          4. OSINT Summary (Formerly Evidence Snippet): Provide a detailed, 2-3 sentence technical summary of the tactical findings. Focus on descriptive ground truth that an operator needs for immediate situational understanding.
          
          Provide a JSON response following the schema. Only include high-fidelity reports found via the search tool.`,
          tools: [{ googleSearch: {} }],
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              incidents: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    category: { type: Type.STRING, enum: ['Social Unrest', 'Violent Disorder', 'Coups/Political Instability', 'Live Combat Zones', 'Humanitarian Disaster', 'Other'] },
                    summary: { type: Type.STRING },
                    coordinates: {
                      type: Type.OBJECT,
                      properties: {
                        lat: { type: Type.NUMBER },
                        lng: { type: Type.NUMBER },
                        landmark: { type: Type.STRING }
                      }
                    },
                    intensity: { type: Type.NUMBER },
                    proactiveIntent: { type: Type.STRING, enum: ['Reporting', 'Planning'] },
                    evidenceSnippet: { type: Type.STRING, description: "Detailed OSINT Summary for ground operators." },
                    sourceUrl: { type: Type.STRING }
                  },
                  required: ['category', 'summary', 'coordinates', 'intensity', 'proactiveIntent', 'evidenceSnippet']
                }
              },
              overallAssessment: { type: Type.STRING }
            }
          }
        }
      });

      const data = JSON.parse(response.text || '{}');
      const tacticalReport: TacticalAnalysis = {
        ...data,
        id: `TACTICAL-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        country: country,
        timestamp: Date.now()
      };
      onResult(tacticalReport);
    } catch (err) {
      console.error(err);
      alert("Satellite Uplink Interrupted: Automated feed monitoring failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl mt-12 mb-20 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Header Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Terminal className="w-5 h-5 text-emerald-500" />
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Immediate Crisis OSINT Support</h3>
            <p className="text-[9px] text-slate-500 font-mono uppercase tracking-tighter">Tactical Field Terminal // Automated Social Monitoring</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[10px] text-slate-400 font-mono uppercase">Live Search Enabled</span>
        </div>
      </div>

      <div className="p-8 grid grid-cols-1 md:grid-cols-12 gap-10">
        {/* Control Console */}
        <div className="md:col-span-6 space-y-6">
          <div className="p-5 bg-slate-900/40 border border-slate-800 rounded-lg">
             <div className="flex items-center gap-3 mb-4">
                <Search className="w-5 h-5 text-blue-400" />
                <h4 className="text-[11px] font-bold text-slate-200 uppercase tracking-widest">Target Configuration</h4>
             </div>
             
             <div className="space-y-4">
               <div className="relative group">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Region of Operation</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-hover:text-emerald-500 transition-colors" />
                  <select 
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded text-xs text-white font-bold uppercase focus:outline-none focus:ring-1 focus:ring-emerald-500/50 appearance-none hover:border-slate-700 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {ALL_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="bg-slate-950/50 p-4 border border-slate-800/50 rounded-lg">
                <p className="text-[10px] text-slate-500 font-mono mb-2 uppercase tracking-tighter">Active Protocols:</p>
                <ul className="space-y-1.5">
                  <li className="flex items-center gap-2 text-[10px] text-slate-400">
                    <Radio className="w-3 h-3 text-blue-500" /> Twitter/X Live Pulse
                  </li>
                  <li className="flex items-center gap-2 text-[10px] text-slate-400">
                    <Radio className="w-3 h-3 text-red-500" /> TikTok Ground Feeds
                  </li>
                  <li className="flex items-center gap-2 text-[10px] text-slate-400">
                    <Radio className="w-3 h-3 text-emerald-500" /> Telegram Local Groups
                  </li>
                </ul>
              </div>

              <button
                onClick={monitorLiveFeeds}
                disabled={isLoading}
                className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 text-white text-xs font-bold uppercase tracking-[0.2em] rounded flex items-center justify-center gap-3 transition-all shadow-lg shadow-emerald-900/20 active:scale-[0.98]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Scanning Live Social Grids...
                  </>
                ) : (
                  <>
                    <Activity className="w-3.5 h-3.5" />
                    Initialize Automated Sweep
                  </>
                )}
              </button>
             </div>
          </div>
        </div>

        <div className="md:col-span-6 flex flex-col justify-center">
          <div className="p-6 bg-slate-900/50 border border-slate-800/50 rounded-xl flex gap-5 items-start">
            <Compass className="w-10 h-10 text-emerald-500 shrink-0 mt-1" />
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest">Tactical Liaison Objective</h4>
              <p className="text-xs text-slate-500 leading-relaxed italic">
                "Initiate an autonomous scan of unstructured social data. I will identify 'Ground Truth' via multi-platform triangulation, categorizing kinetic events with geospatial approximations. Once complete, a detailed Crisis Report will be compiled for your review."
              </p>
              <div className="pt-2 flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                 <span className="text-[9px] text-slate-400 font-mono uppercase">Monitoring Node Alpha Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImmediateCrisisOSINT;
