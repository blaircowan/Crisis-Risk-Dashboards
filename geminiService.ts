import { GoogleGenAI, Type } from "@google/genai";
import { CrisisReport, EscalationLevel, Source, Country, COUNTRY_CONFIGS, TacticalAnalysis } from "./types";

export async function fetchAndAnalyzeNews(country: Country, previousReport?: CrisisReport | null): Promise<CrisisReport> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-3-pro-preview";
  
  const now = new Date();
  const currentDate = now.toISOString().split('T')[0];
  const dateMinus7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const framework = COUNTRY_CONFIGS[country];
  const indicatorCount = framework.length;
  
  const previousContext = previousReport ? `
    PREVIOUS BASELINE (Report ID: ${previousReport.id}):
    - Escalation: ${previousReport.escalationLevel}
    - Scores: ${previousReport.scores.map(s => `${s.name}: ${s.score}`).join(', ')}
  ` : `Initial baseline required for ${country}.`;

  const systemInstruction = `
    System Role: Senior OSINT Analyst specializing in geopolitical risk.
    Objective: Produce high-fidelity, reproducible risk scores based strictly on a 7-day temporal window.
    AOR: ${country} (National)
    Reporting Window: ${dateMinus7} to ${currentDate}

    CORE LOGIC: THE 7 Day Momentum TEMPORAL DELTA
    1. Strict Filtering: Analyze ONLY events occurring within the last 168 hours (7 days).
    2. BASELINE ZERO: If a specific Risk Factor has NO new developments in the 7-day window, its score MUST be 0.
    3. Momentum Tracking: The score represents CHANGE in risk (7 Day Momentum), not the total state.

    SCORING PROTOCOL: THE ADMIRALTY CODE
    - Grade B2 or Higher (Verified): Contributes 100% to the score.
    - Lower than B2 (Unverified/Noise): DO NOT include in numerical score. List under 'unverifiedEvents'.
    - Weighting: 3+ independent sources = 2x weight (Mark as 'isCorroborated: true'). Single-source = 50% discount.

    STRICT REQUIREMENT FOR 'EVIDENCE' FIELD:
    - Short, snappy tactical précis (5-10 words). State the ground event.
    
    SOURCE CATEGORIZATION:
    - Categorize every source in 'keySources' as 'Local', 'Regional', or 'International'.

    ${previousContext}

    FRAMEWORK:
    ${framework.map((name, i) => `${i + 1}. ${name}`).join('\n')}
  `;

  const response = await ai.models.generateContent({
    model: model,
    contents: `Today is ${currentDate}. Perform high-precision OSINT for ${country}. Cross-reference Liveuamap, regional feeds, and international wires. Apply the Risk Indicator Framework and Admiralty Code for all indicators.`,
    config: {
      systemInstruction: systemInstruction,
      tools: [{ googleSearch: {} }],
      temperature: 0.1,
      topP: 0.1,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          escalationLevel: { type: Type.STRING, enum: ["Low", "Medium", "High", "Critical"] },
          strategicInsight: { type: Type.STRING },
          unverifiedEvents: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                uri: { type: Type.STRING },
                reason: { type: Type.STRING },
                sourceGrade: { type: Type.STRING }
              }
            }
          },
          scores: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.INTEGER },
                name: { type: Type.STRING },
                score: { type: Type.NUMBER },
                averageSixMonthScore: { type: Type.NUMBER },
                historicalTrend: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                severity: { type: Type.NUMBER },
                evidence: { type: Type.STRING },
                appraisal: { type: Type.STRING },
                reliability: { type: Type.STRING },
                credibility: { type: Type.INTEGER },
                confidenceLevel: { type: Type.NUMBER },
                isCorroborated: { type: Type.BOOLEAN },
                increasingRiskEvidence: { type: Type.STRING },
                stabilizingRiskEvidence: { type: Type.STRING }
              }
            }
          },
          keySources: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                uri: { type: Type.STRING },
                rating: { type: Type.STRING },
                type: { type: Type.STRING, enum: ["Local", "Regional", "International"] }
              }
            }
          }
        }
      }
    },
  });

  const rawResult = JSON.parse(response.text || '{}');
  const sources: Source[] = [...(rawResult.keySources || [])];
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (groundingChunks) {
    groundingChunks.forEach((chunk: any) => {
      if (chunk.web?.uri && chunk.web?.title) {
        sources.push({ title: chunk.web.title, uri: chunk.web.uri, type: 'International' });
      }
    });
  }

  return {
    ...rawResult,
    id: Math.random().toString(36).substr(2, 9).toUpperCase(),
    country,
    timestamp: Date.now(),
    articleSnippet: `Intelligence Dossier // AOR: ${country} // PERIOD: ${dateMinus7} - ${currentDate}`,
    sources: Array.from(new Map(sources.map(s => [s.uri, s])).values())
  };
}

export async function createChatSession(report: CrisisReport) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-3-pro-preview";

  return ai.chats.create({
    model: model,
    config: {
      systemInstruction: `You are an AI Geopolitical Intel Assistant. 
      You are discussing the following Country Report for ${report.country} (ID: ${report.id}).
      
      REPORT SUMMARY: ${report.summary}
      ESCALATION LEVEL: ${report.escalationLevel}
      STRATEGIC INSIGHT: ${report.strategicInsight}
      
      DETAILED SCORES:
      ${report.scores.map(s => `- ${s.name}: Score ${s.score}, Severity ${s.severity}/5. Appraisal: ${s.appraisal}`).join('\n')}
      
      Instructions:
      1. Act as a senior intelligence analyst.
      2. Answer questions specifically based on the provided report data.
      3. Use professional, objective, and concise language.`,
      thinkingConfig: { thinkingBudget: 2000 }
    }
  });
}

export async function createTacticalChatSession(report: TacticalAnalysis) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-3-pro-preview";

  return ai.chats.create({
    model: model,
    config: {
      systemInstruction: `You are a Tactical OSINT Liaison supporting an operator on the ground.
      You are discussing a real-time Tactical OSINT Dossier for ${report.country} (ID: ${report.id}).
      
      OVERALL ASSESSMENT: ${report.overallAssessment}
      
      EXTRACTED INCIDENTS:
      ${report.incidents.map((inc, i) => `
      INCIDENT ${i+1}:
      - Category: ${inc.category}
      - Summary: ${inc.summary}
      - Location: ${inc.coordinates.landmark} (${inc.coordinates.lat}, ${inc.coordinates.lng})
      - Intensity: ${inc.intensity}/10
      - Intent: ${inc.proactiveIntent}
      - OSINT Summary: ${inc.evidenceSnippet}
      `).join('\n')}
      
      Instructions:
      1. Act as a tactical field analyst. Be brief, professional, and mission-focused.
      2. Provide immediate situational awareness based on the report.
      3. If asked about safety or movement, refer to the intensities and categories listed.
      4. Do not speculate beyond the OSINT ground-truth provided.`,
      thinkingConfig: { thinkingBudget: 2000 }
    }
  });
}