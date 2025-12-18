
export enum EscalationLevel {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical'
}

export interface IndicatorResult {
  id: number;
  name: string;
  score: number; // -5 to +5
  severity: number; // 1 to 5
  evidence: string; // Short single-line tactical evidence
  appraisal: string; // Detailed overview and intelligence appraisal
  averageSixMonthScore: number; // Synthetic average for trending logic
  historicalTrend: number[]; // 6 values representing the last 6 months (one per month)
}

export interface Source {
  title: string;
  uri: string;
}

export interface CrisisReport {
  id: string;
  timestamp: number;
  summary: string;
  escalationLevel: EscalationLevel;
  strategicInsight: string;
  scores: IndicatorResult[];
  articleSnippet: string;
  sources: Source[];
}

export const INDICATOR_FRAMEWORK = [
  "Security Failure",
  "LNA-GNU Tension",
  "Civil Unrest",
  "Tripoli Clashes",
  "Coup Rhetoric",
  "LNA Mobilization",
  "CBL Mistrust",
  "CBL Physical Security",
  "Financial Hardship",
  "Economic Hub Seizure",
  "UN Obstruction",
  "Border Closure"
];
