
import { GoogleGenAI, Type } from "@google/genai";
import { CrisisReport, EscalationLevel, Source } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export async function fetchAndAnalyzeNews(previousReport?: CrisisReport | null): Promise<CrisisReport> {
  const model = "gemini-3-pro-preview";
  const currentDate = new Date().toISOString().split('T')[0];
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  // Construct the previous context string if available
  const previousContext = previousReport ? `
    CURRENT BASELINE INTELLIGENCE (From Report ID: ${previousReport.id}, Timestamp: ${new Date(previousReport.timestamp).toISOString()}):
    - Overall Escalation: ${previousReport.escalationLevel}
    - Scores: ${previousReport.scores.map(s => `${s.name}: ${s.score}`).join(', ')}
    - Summary of Last Brief: "${previousReport.summary.substring(0, 300)}..."
    
    CONTINUITY INSTRUCTION: You must maintain intelligence continuity. Do not change a score by more than 0.5 - 1.0 points unless there is a specific, identifiable news event in the last few hours/days that justifies a shift. If the situation is largely unchanged since the last report, maintain the scores to avoid "briefing noise."
  ` : "This is the INITIAL assessment. Establish a grounded baseline based on current OSINT.";

  const systemInstruction = `
    System Role: You are a Senior Intelligence Analyst specializing in North Africa, providing a high-level briefing for a Senior Operational UK Military Commander.
    
    Analysis Task: Use Google Search to analyze OSINT strictly from the LAST 7 DAYS regarding Libya. 
    
    ${previousContext}

    Framework Evaluation Logic:
    - 7D Score (-5 to +5): This is the TACTICAL DELTA. 
    - MANDATORY REQUIREMENT: You MUST return EXACTLY 12 indicator objects in the 'scores' array, corresponding to the framework below.
    - DO NOT omit any indicator. If an indicator is stable or has no specific news, assign a score of 0 and a severity of 1, and note "No significant change observed" in the evidence.
    - You must ensure consistency. If you provided a score of -2.5 yesterday and the news today is similar, do not return -4.0 today.
    - If a score DOES shift significantly, you must explain the specific kinetic or political catalyst in the 'appraisal' field.

    Indicator Analysis Requirements:
    - 'evidence': Single, short, high-impact tactical ground truth sentence.
    - 'appraisal': Detailed paragraph providing tactical overview and formal appraisal of impact on stability.

    Framework (Return these IDs 1-12 in order):
    1. Security Failure
    2. LNA-GNU Tension
    3. Civil Unrest
    4. Tripoli Clashes
    5. Coup Rhetoric
    6. LNA Mobilization
    7. CBL Mistrust
    8. CBL Physical Security
    9. Financial Hardship
    10. Economic Hub Seizure
    11. UN Obstruction
    12. Border Closure

    Reporting Standards:
    - Language: Professional military-grade intelligence terminology.
  `;

  const response = await ai.models.generateContent({
    model: model,
    contents: `Current Date: ${currentDate}. Perform an OSINT deep-dive for Libya. Return ALL 12 indicators from the framework in order. Every indicator must have both short 'evidence' and a deep-dive 'appraisal'.`,
    config: {
      systemInstruction: systemInstruction,
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING, description: "Intelligence picture from the last 7 days." },
          escalationLevel: { 
            type: Type.STRING, 
            enum: ["Low", "Medium", "High", "Critical"]
          },
          strategicInsight: { type: Type.STRING, description: "Strategic assessment for the commander." },
          scores: {
            type: Type.ARRAY,
            minItems: 12,
            maxItems: 12,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.INTEGER, description: "The ID from 1 to 12 as per the framework list." },
                name: { type: Type.STRING },
                score: { type: Type.NUMBER },
                averageSixMonthScore: { type: Type.NUMBER },
                historicalTrend: { 
                  type: Type.ARRAY, 
                  items: { type: Type.NUMBER }
                },
                severity: { type: Type.NUMBER },
                evidence: { type: Type.STRING },
                appraisal: { type: Type.STRING }
              },
              required: ["id", "name", "score", "averageSixMonthScore", "historicalTrend", "severity", "evidence", "appraisal"]
            }
          },
          keySources: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                uri: { type: Type.STRING }
              },
              required: ["title", "uri"]
            }
          }
        },
        required: ["summary", "escalationLevel", "strategicInsight", "scores", "keySources"]
      }
    },
  });

  const rawResult = JSON.parse(response.text);
  
  const sources: Source[] = [...(rawResult.keySources || [])];
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
    articleSnippet: `OSINT Synthesis // Period: ${sevenDaysAgo} - ${currentDate}`,
    sources: uniqueSources
  };
}
