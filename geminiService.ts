
import { GoogleGenAI, Type } from "@google/genai";
import { CrisisReport, EscalationLevel, Source } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export async function fetchAndAnalyzeNews(): Promise<CrisisReport> {
  const model = "gemini-3-pro-preview";
  
  const systemInstruction = `
    System Role: You are a Senior Intelligence Analyst specializing in North Africa, providing a high-level briefing for a Senior Operational UK Military Commander focused on overseas crisis management.
    
    Analysis Task: Use Google Search to find and analyze OSINT and news strictly from the LAST 7 DAYS regarding the Libyan political and security situation. 
    
    Using the Risk Indicator Framework below, assign a score from -5 (Significant Escalation/ Crisis Risk) to +5 (Significant De-escalation/Stability) for each relevant indicator. 
    
    Trending Analysis: For each indicator, provide an estimated 6-month average score based on the historical trajectory of the Libyan conflict. This will be used to determine if current indicators are "Above", "In line with", or "Below" historical norms.

    Reporting Standards:
    - Language: Use professional military-grade intelligence terminology.
    - Summary: Provide a comprehensive paragraph (not just a sentence) summarizing key kinetic and political shifts observed in the last 7 days.
    - Strategic Insight: Provide a paragraph-length assessment of how current events impact UK/International strategic interests, focusing on the immediate and 6-month outlook.

    Special Logic for Key Indicators:
    1. CBL & Banking Indicators (CBL Mistrust, CBL Physical Security, Financial Hardship):
       Analyze social media and news sentiment for "Banking Anxiety." Look for keywords like "liquidity," "frozen," "Central Bank corruption," or "Dinar devaluation." 
       CRITICAL: Identify if the mistrust originates from the General Public, the LNA, or the GNU.
    
    2. LNA Mobilization vs Exercise:
       Review reports of LNA military activity. Differentiate between "Routine Training Exercises" and "Tactical Mobilization toward the West." 
       Look for signs: Ammunition stockpiling, transport of heavy armor, or redeployment of elite units (e.g., 106th Brigade). 
       If the identified intent is an "overthrow" or "hostile takeover," flag Escalation Level as "High" or "Critical."

    Framework:
    1. Security Failure, 2. LNA-GNU Tension, 3. Civil Unrest, 4. Tripoli Clashes, 5. Coup Rhetoric, 6. LNA Mobilization, 7. CBL Mistrust, 8. CBL Physical Security, 9. Financial Hardship, 10. Economic Hub Seizure, 11. UN Obstruction, 12. Border Closure.
  `;

  const response = await ai.models.generateContent({
    model: model,
    contents: "Scan OSINT and news from the LAST 7 DAYS for Libya. Provide a full intelligence brief for a senior military commander, including 6-month average baselines for trending. Focus specifically on CBL sentiment and LNA tactical movements.",
    config: {
      systemInstruction: systemInstruction,
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING, description: "A comprehensive paragraph summarizing the intelligence picture from the last 7 days." },
          escalationLevel: { 
            type: Type.STRING, 
            enum: ["Low", "Medium", "High", "Critical"],
            description: "Overall operational escalation level."
          },
          strategicInsight: { type: Type.STRING, description: "A paragraph-length strategic assessment for the commander (Immediate to 6-month outlook)." },
          scores: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.INTEGER },
                name: { type: Type.STRING },
                score: { type: Type.NUMBER, description: "7-day score (-5 to +5)" },
                averageSixMonthScore: { type: Type.NUMBER, description: "6-month average score (-5 to +5)" },
                severity: { type: Type.NUMBER, description: "Scale 1 to 5" },
                evidence: { type: Type.STRING, description: "Specific tactical evidence or sentiment origin." }
              },
              required: ["id", "name", "score", "averageSixMonthScore", "severity", "evidence"]
            }
          }
        },
        required: ["summary", "escalationLevel", "strategicInsight", "scores"]
      }
    },
  });

  const rawResult = JSON.parse(response.text);
  
  const sources: Source[] = [];
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (groundingChunks) {
    groundingChunks.forEach((chunk: any) => {
      if (chunk.web?.uri && chunk.web?.title) {
        sources.push({
          title: chunk.web.title,
          uri: chunk.web.uri
        });
      }
    });
  }

  const uniqueSources = Array.from(new Map(sources.map(s => [s.uri, s])).values());

  return {
    ...rawResult,
    id: Math.random().toString(36).substr(2, 9).toUpperCase(),
    timestamp: Date.now(),
    articleSnippet: "OSINT Synthesis // Operational Briefing Format",
    sources: uniqueSources
  };
}
