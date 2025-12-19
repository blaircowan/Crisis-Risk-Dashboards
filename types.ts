
export enum EscalationLevel {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical'
}

export enum Country {
  ARMENIA = 'Armenia',
  BANGLADESH = 'Bangladesh',
  BIH = 'Bosnia and Herzegovina',
  CAMEROON = 'Cameroon',
  CHAD = 'Chad',
  DRC = 'DRC',
  ERITREA = 'Eritrea',
  ETHIOPIA = 'Ethiopia',
  GEORGIA = 'Georgia',
  GUYANA = 'Guyana',
  INDONESIA = 'Indonesia',
  IRAQ = 'Iraq',
  EGYPT = 'Egypt',
  ISRAEL = 'Israel',
  LEBANON = 'Lebanon',
  LIBYA = 'Libya',
  MALI = 'Mali',
  MOLDOVA = 'Moldova',
  MYANMAR = 'Myanmar',
  NEPAL = 'Nepal',
  NIGER = 'Niger',
  NIGERIA = 'Nigeria',
  PAKISTAN = 'Pakistan',
  PALESTINE = 'Palestine',
  SOMALIA = 'Somalia',
  SOUTH_SUDAN = 'South Sudan',
  TCI = 'Turks and Caicos Islands',
  UKRAINE = 'Ukraine',
  VENEZUELA = 'Venezuela'
}

export type SourceType = 'Local' | 'Regional' | 'International';

export interface UnverifiedEvent {
  title: string;
  uri: string;
  reason: string;
  sourceGrade: string; // e.g., "C3"
}

export interface IndicatorResult {
  id: number;
  name: string;
  score: number; // -5 to +5
  severity: number; // 1 to 5
  evidence: string; // Short single-line tactical evidence
  appraisal: string; // Detailed overview and intelligence appraisal
  averageSixMonthScore: number;
  historicalTrend: number[];
  
  // Intelligence Grading
  reliability: string; // A-F
  credibility: number; // 1-6
  confidenceLevel: number; // 0-100
  isCorroborated: boolean; // True if 3+ independent sources confirm the event
  
  // ACH Framework
  increasingRiskEvidence: string; // Evidence for deterioration
  stabilizingRiskEvidence: string; // Evidence for de-escalation
}

export interface Source {
  title: string;
  uri: string;
  rating?: string; // e.g. "A1"
  type?: SourceType;
}

export interface CrisisReport {
  id: string;
  country: Country;
  timestamp: number;
  summary: string;
  escalationLevel: EscalationLevel;
  strategicInsight: string;
  scores: IndicatorResult[];
  articleSnippet: string;
  sources: Source[];
  unverifiedEvents: UnverifiedEvent[];
}

export interface TacticalIncident {
  category: 'Social Unrest' | 'Violent Disorder' | 'Coups/Political Instability' | 'Live Combat Zones' | 'Humanitarian Disaster' | 'Other';
  summary: string;
  coordinates: { lat: number; lng: number; landmark: string };
  intensity: number; // 1-10
  proactiveIntent: 'Reporting' | 'Planning';
  evidenceSnippet: string;
  sourceUrl?: string;
}

export interface TacticalAnalysis {
  id: string;
  country: string;
  timestamp: number;
  incidents: TacticalIncident[];
  overallAssessment: string;
}

export const COUNTRY_CONFIGS: Record<Country, string[]> = {
  [Country.ARMENIA]: [
    "Kremlin Disinformation: Anti-Armenia rhetoric from Russian state media targeting 'pivot to the West.'",
    "Civil-Political Volatility: Escalation of anti-government protests in Yerevan.",
    "Baku Rhetorical Aggression: Maximalist language from Azerbaijani leadership regarding 'Western Azerbaijan.'",
    "Peace Negotiation Pivot: Breakdown in the August 2025 Washington Peace Declaration or TRIPP.",
    "Border Logistics Buildup: Movement of military supply chains or field hospitals near border.",
    "Mobilization Triggers: Activation of reserve units or snap exercises near corridors.",
    "Kinetic Shaping Operations: Skirmishes, shelling, or drone activity along border.",
    "Democratic Resilience: Foreign electoral interference signs ahead of June 2026 elections.",
    "Institutional Sentiment: Sentiment toward Western-leaning security (Stability Score -5 to +5)"
  ],
  [Country.BANGLADESH]: [
    "Hasina/Indo-Dhaka Friction: Movement/statements from deposed PM triggering anti-India sentiment.",
    "Electoral Integrity: Challenges to Feb 12, 2026, General Election timeline.",
    "Martyrdom Mobilization: Protests triggered by targeting of pro-democracy figures.",
    "Interim-Opposition Tension: Breakdowns between Yunus government and BNP/Islamist factions.",
    "Infrastructure & CNI Failure: Systematic disruptions to internet, power, or essential commodities.",
    "Quota & Labor Volatility: Rhetorical shifts on merit-based service or manufacturing unrest.",
    "Rohingya Humanitarian Stress: Cuts to international aid for Cox’s Bazar camps.",
    "Minority Security: Targeted violence/threats against religious minorities.",
    "Narrative Score: Sentiment toward 'New Bangladesh' transition (Stability Score -5 to +5)"
  ],
  [Country.BIH]: [
    "RS Institutional Secession: Moves by RS Government to withdraw from federal institutions.",
    "Annexation Rhetoric: Calls from Dodik/SNSD advocating for RS annexation by Serbia.",
    "Demographic Engineering: Verified attempts at ethnic relocation for 'security' reorganization.",
    "RS Sovereign Insolvency: Failure to secure credit for the 2026 debt repayment cycle.",
    "Provocation Framing: Mass casualty event framed as religiously or ethnically motivated.",
    "Security Force Posture Change: Non-standard deployments by RS MUP paramilitary units.",
    "High Representative Friction: Physical obstruction or banning of OHR from RS territory.",
    "Narrative Score: Discourse regarding survival of the state vs dissolution (Stability Score -5 to +5)"
  ],
  [Country.CAMEROON]: [
    "Biya Vitality/Status: Reports of President Paul Biya's (aged 92) health or censorship.",
    "Succession Vacuum: Lack of formal successor triggers internal CPDM fracturing.",
    "Post-Election Repression: Targeting of journalists/opposition challenging Oct 2025 results.",
    "Fiscal Reserve Erosion: BEAC reports of reserves falling below 4 months of import cover.",
    "Boko Haram Inefficacy: Successful Jihadist operations demonstrating military inability in Far North.",
    "Anglophone Kinetic Shift: Increased lethality of Ambazonian separatist attacks in NWSW.",
    "Subsidy De-stabilization: Fuel/electricity subsidy cuts triggering cost of living riots.",
    "Logistical Strangulation: Denied movement on Yaoundé-Douala supply corridor.",
    "Narrative Score: Forced stability vs imminent break with status quo (Stability Score -5 to +5)"
  ],
  [Country.CHAD]: [
    "Dynastic Fragility: Threats to Mahamat Déby or coup attempts within Presidential Guard.",
    "N'Djamena Civil Unrest: Spontaneous protest movements bypassing traditional opposition.",
    "Zaghawa Fragmentation: Defections or open dissent among the Zaghawa military elite.",
    "Sudan Border Contagion: Cross-border incursions by RSF or SAF into Eastern Chad.",
    "Jihadist Operational Expansion: Step-change in Boko Haram/ISWAP lethality in Lake Chad Basin.",
    "Northern Insurgent Re-activation: CCMSR or FACT rebels mobilizing in Southern Libya.",
    "Fiscal/Reserve Exhaustion: Sudden cuts to military pay or collapse in oil-backed loans.",
    "Religious/Ethnic Polarization: Mass violence between Zaghawa and Arab-identifying groups.",
    "Narrative Score: Sovereignty vs Stability; Pan-African bastion vs collapse (Stability Score -5 to +5)"
  ],
  [Country.DRC]: [
    "Anti-Western Escalation: Rhetoric accusing Western powers of complicity with Rwanda.",
    "Unified Opposition ('Save the DRC'): Consolidation of Katumbi/Fayulu/Kabila against Tshisekedi.",
    "Security Force Attrition: Failure of FARDC to contain protests or desertion to Wazalendo.",
    "Great Lakes Conflagration: Kinetic exchanges between Rwandan and Congolese forces.",
    "Washington/Doha Failure: Violation of Dec 2025 Washington Accords regarding M23/FDLR.",
    "M23 Strategic Expansion: Gains beyond current lines toward Bukavu or Uvira.",
    "Tshisekedi-Kabila Flashpoint: Verbal escalations following death sentence against Kabila.",
    "CNI & Mine Sabotage: Targeted attacks on mining infrastructure in Katanga or Kivus.",
    "Narrative Score: National sovereignty vs terminal collapse (Stability Score -5 to +5)"
  ],
  [Country.ERITREA]: [
    "Abiy Red Sea Rhetoric: Statements by PM Abiy Ahmed on Red Sea access as existential right.",
    "Tigray-Afar Border Buildup: ENDF moving heavy weaponry into northern Tigray or eastern Afar.",
    "Infrastructure Pre-emption: Ethiopian strikes targeting Eritrean CNI or Asmara Airport.",
    "Eritrean General Mobilization: Nationwide directives for reservists to report for active duty.",
    "Afar Front Suitability: Seasonal conditions becoming favorable for mechanized operations.",
    "Ethiopian Proxy Activation: Funding of Ethiopia-based Eritrean opposition militias.",
    "Assab Strategic Isolation: Maneuvers signaling intent to annex or blockade Assab.",
    "Sudan-Egypt Alignment: Eritrean diplomacy shifts toward Egypt against Ethiopian pressure.",
    "Narrative Score: Defensive vigilance vs preparation for total war (Stability Score -5 to +5)"
  ],
  [Country.ETHIOPIA]: [
    "Insurgency Strategic Reach: Fano/OLA operations reaching outskirts of Addis Ababa.",
    "Pretoria Agreement Collapse: TPLF re-arming or federal re-annexation of Western Tigray.",
    "Amhara 'Fracture' Peace: Holdout Fano factions increasing attacks to discredit Dec 2025 deal.",
    "Red Sea Proxy Axis: Intelligence coordination between Egypt, Eritrea, Somalia vs GERD.",
    "GERD Hydropolitics: Kinetic threats or cyber-sabotage targeting the Dam after full capacity.",
    "Somalia Security Vacuum: ENDF withdrawal resulting in Al-Shabaab seizing border towns.",
    "Operational Pivot: Draw-down in Amhara/Oromia coinciding with movement toward corridors.",
    "Zaghawa/RSF Spillover: Combatants using Benishangul-Gumuz for training/logistics.",
    "Narrative Score: Internal development vs External Enemy mobilization (Stability Score -5 to +5)"
  ],
  [Country.GEORGIA]: [
    "EU Accession Freeze: Implementation of decision to suspend EU negotiations until 2028.",
    "Economic Sanction Threshold: Asset freezes on Bidzina Ivanishvili or systemic banking sanctions.",
    "Georgian Dream Fragmentation: High-level resignations challenging GD 'authoritarian overreach'.",
    "Protest Escalation: Use of non-standard chemical agents or military deployment against protesters.",
    "Presidential De-legitimization: Moves to ignore Salome Zourabichvili or inauguration of successor.",
    "Sovereignty Erasure: Russian military buildup or formal abolishment of administrative boundaries.",
    "Opposition Decapitation: Sentencing or physical relocation of major opposition leaders.",
    "Electoral Boycott Fallout: Failure of local elections resulting in total GD municipal control.",
    "Narrative Score: 'Peace-keeping' against Western agitation vs domestic anger (Stability Score -5 to +5)"
  ],
  [Country.GUYANA]: [
    "Brazilian Defensive Pivot: Brazilian military deployment of armored vehicles to Roraima border.",
    "FANB Border Build-up: Venezuelan construction of runways, tank bases, or ferries in Tumeremo.",
    "Argyle Declaration Breach: Venezuelan Coast Guard incursions into Guyanese waters.",
    "Sovereignty Erasure (Illegal Elections): Caracas holding 'local elections' for Guayana Esequiba.",
    "Maritime Blockade Rhetoric: Threats from Caracas targeting Stabroek Block operations.",
    "International Law Defiance: Venezuela rejecting ICJ 2025 proceedings or 1899 Arbitral Award.",
    "US Military Counter-Posture: US carrier strike group exercises in Guyanese waters.",
    "Narrative Score: 'Patriotic Reclamation' vs Limited Kinetic Operation (Stability Score -5 to +5)"
  ],
  [Country.INDONESIA]: [
    "Social Media Mobilization: Escalation of #IndonesiaGelap or #OnePieceIndonesia hashtags.",
    "The 'Jolly Roger' Proxy: Public display of One Piece flag viewed as 'symbolic treason'.",
    "State Reaction/Overreach: Police raids on flag-makers or arrests for flag desecration.",
    "Prabowo Administration Friction: Statements labeling protesters as foreign/corruptor-funded agents.",
    "Geographic Contagion: Protests spreading beyond Java to Bali and Lombok hubs.",
    "Demographic Widening: Shift in protest base to include ojol drivers and labor unions.",
    "Police Reform Tension: Escalation of anti-police sentiment following kinetic incidents.",
    "Narrative Score: Gen-Z digital subversion vs return to authoritarianism (Stability Score -5 to +5)"
  ],
  [Country.IRAQ]: [
    "Embassy Kinetic Targeting: Rocket or drone strikes targeting missions in Green Zone.",
    "Sovereignty Erosion: Unauthorized militia convoys or extra-legal checkpoints in Baghdad.",
    "Militia 'Facade' Resurgence: Resumption of attacks on foreign military facilities by 'facade' groups.",
    "Withdrawal Timeline Volatility: Leaked changes to the September 2026 total exit deadline.",
    "Israel-Iran Spillover: Kinetic exchanges utilizing Iraqi airspace or retaliatory strikes on Iraqi soil.",
    "Diplomatic Security Posture: Unannounced changes in security footprint of US Embassy.",
    "Syrian Frontier Contagion: Transit of militants (ISIS/HTS) across Anbar/Nineveh borders.",
    "Institutional Militia Integration: Administrative moves to integrate militias without DDR.",
    "Narrative Score: Independent broker vs partitioned state (Stability Score -5 to +5)"
  ],
  [Country.EGYPT]: [
    "Urban Mobilization: Widespread protest activity or civil unrest in Cairo.",
    "Maritime Access: Denial/restriction of Suez Canal access or maritime infrastructure targeting.",
    "Civil-Military Rift: Degradation of relationship between Presidency and EAF leadership.",
    "Institutional Targeting: Successful VEO operations against military installations.",
    "Tourist Attrition: VEO targeting of western-affiliated tourist destinations in Sinai.",
    "Sinai Militarization: Rapid surge in military deployments beyond counter-insurgency rotations.",
    "Sovereign Fiscal Stress: Foreign exchange shortages triggering local subsidy cuts.",
    "Narrative Control: Presidency’s Social Pact; stable provider vs extractive state (Stability Score -5 to +5)"
  ],
  [Country.ISRAEL]: [
    "Axis Coordination Surge: Increased operational synchronization between IRGC, Hezbollah, Houthis.",
    "Al-Ghadir Missile Posture: Movement of solid-fuel ballistic missiles out of storage complexes.",
    "Diplomatic Target Profiling: Threat reporting against Israeli Embassies in neutral states.",
    "Iranian Red-Line Rhetoric: Official statements regarding 'Strategic Patience' reaching end.",
    "PMG Internal Lethality: Coordinated IEDs and small-arms ambushes in major urban hubs.",
    "West Bank Leadership Consolidation: Hard evidence of PMG centralizing command over Jenin brigades.",
    "Hezbollah Reconstitution: Breach of ceasefire through military infrastructure south of Litani.",
    "Maritime Interest Targeting: Houthi/IRGC activity targeting Israeli commercial vessels.",
    "Narrative Score: Existential deterrence vs leaking security umbrella (Stability Score -5 to +5)"
  ],
  [Country.LEBANON]: [
    "LAF Capability: Reduction in funding, desertion rates, or lack of international support.",
    "Civilian/Narrative Violence: Localized clashes spread via social media polarizing the public.",
    "Economic Integrity: Reports of corruption, fraud, or FATF 'Black List' status.",
    "Infrastructure Targeting: IAF strikes on non-military targets (Airports, Ports, Power Plants).",
    "IDF Border Posture: Buildup of divisions or activation of reserves at the Northern Border.",
    "Diplomatic Red-Lines: Messaging from Israel to US/UN on end of tolerance for Hezbollah.",
    "Litani Buffer Zone: Reports of Hezbollah personnel or infrastructure detected below Litani.",
    "LAF Sentiment: Narratives portraying LAF as protectors vs failing institution (Narrative Score -5 to +5)"
  ],
  [Country.LIBYA]: [
    "Security Failure: GNU forces unable to maintain order or ceasing to function.",
    "LNA-GNU Tension: Verbal escalations or diplomatic breakdowns between Haftar and Dbeibah.",
    "Civil Unrest: Protests, riots, or mass strikes.",
    "Tripoli Clashes: Active kinetic exchanges between militias within the capital.",
    "Coup Rhetoric: LNA discussing or planning the overthrow of the GNU.",
    "LNA Mobilization: Physical troop/equipment movement in Eastern Libya.",
    "CBL Mistrust: Statements questioning the GNU/LNA management of bank funds.",
    "CBL Physical Security: Seizure or guarding of Central Bank buildings by armed forces.",
    "Financial Hardship: Public reports of frozen bank accounts or lack of liquidity.",
    "Economic Hub Seizure: Security forces taking control of oil fields, ports, or airports.",
    "UN Obstruction: Denial of movement or access to UNSMIL personnel.",
    "Border Closure: Prolonged shutdown of the Ras Jidir (Tunisia) crossing."
  ],
  [Country.MALI]: [
    "Bamako Encirclement / Fuel Blockade: Systematic attacks on fuel tankers and supply convoys.",
    "Multiparty Dissolution: Decree dissolving political parties and arrest of opposition figures.",
    "Junta Schism: Power struggles between Assimi Goïta and Ministry of Defense leaders.",
    "Transitional Delay: Official announcement extending transition beyond 2027.",
    "Urban Kinetic Shift: VEO operations inside Bamako limits targeting gendarmerie/airport.",
    "VEO Intent Shift (Civilians/Infrastructure): Targeting mining sites and foreign factories.",
    "Diplomatic Abandonment: Departure of non-emergency personnel from Western Embassies.",
    "Zaghawa/Northern Contagion: Spillover from Chad conflict creating security vacuums.",
    "Narrative Score: Sovereign resistance vs regime inability to provide basic security (Stability Score -5 to +5)"
  ],
  [Country.MOLDOVA]: [
    "Hybrid Lab Operations: Surge in deepfake-driven disinformation and AI bot networks.",
    "Oligarch Proxy Mobilization: Illicit financing of rallies by Shor/Plahotniuc networks.",
    "Chisinau Law & Order Strain: Emergence of paramilitary provocateurs trained abroad.",
    "Transnistria Military Uplift: Russian attempts to modernization equipment in Cobasna depot.",
    "Separatist Mobilization: Unusual reservist call-ups by Transnistrian formations.",
    "Southern Ukraine Contagion: Russian advances toward Mykolaiv district.",
    "Energy Blackmail Redux: Re-imposition of gas supply halts by Gazprom.",
    "Narrative Score: Democratic tenacity vs color-coordinated coup (Stability Score -5 to +5)"
  ],
  [Country.MYANMAR]: [
    "Urban Containment Breach: Rebel offensives targeting Naypyidaw, Mandalay, or Yangon.",
    "Electoral Delegitimation: 'Silent Strikes' and boycotts during Jan 2026 elections.",
    "Emergency Extension/Sham Transition: Delays in ending National State of Emergency.",
    "Ethnic Attrition & Exclusion: Targeting of marginalized groups and forced conscription.",
    "Humanitarian Strangulation: Denial of aid access to conflict zones (medicine/fuel/food).",
    "Logistical Disruption: Attacks on CNI or closure of Mae Sot/Thailand corridor.",
    "Air Power Escalation: Indiscriminate airstrikes on civilian infrastructure (schools/hospitals).",
    "Institutional Defection: High-ranking Tatmadaw officers leaking strategic intelligence.",
    "Narrative Score: 'Law and Order' elections vs terminal collapse (Stability Score -5 to +5)"
  ],
  [Country.NEPAL]: [
    "Digital Mobilization: Protest coordination on Discord/TikTok using #NepoBaby hashtags.",
    "Anti-Censorship Backlash: Government attempts to ban WhatsApp/YouTube/Instagram.",
    "Maitighar Mandala Contagion: Protests in Kathmandu spreading toward Federal Parliament.",
    "Aviation & Transit Lockdowns: Closure of TIA or regional hubs due to security threats.",
    "Interim Leadership Vacuum: Sudden changes in status of Interim PM Sushila Karki.",
    "Election Timeline Slippage: Delays in the March 5, 2026, General Elections.",
    "Militarized Policing: Deployment of Nepal Army to supplement police for crowd control.",
    "Prisoner/Fugitive Instability: Unrest involving inmates from September 2025 mass breaks.",
    "Narrative Score: Gen-Z democratic transformation vs security-led vacuum (Stability Score -5 to +5)"
  ],
  [Country.NIGER]: [
    "Niamey Protest Pulse: Spontaneous anti-government demonstrations triggered by distress.",
    "Transitional Stagnation: Official announcements indefinitely delaying elections.",
    "Opposition Re-emergence: Pro-Bazoum faction activity or rifts within CNSP military elite.",
    "Niamey Kinetic Threat: Direct terrorist attacks (IEDs/ambushes) within city limits.",
    "VEO Target Evolution: JNIM/IS-Sahel shifting focus to civilian infrastructure/convoys.",
    "Russian Military Footprint: Expanded 'Africa Corps' (Wagner) training base activities.",
    "Liptako-Gourma Sovereignty: Loss of state control over strategic Tillabéri districts.",
    "Infrastructure & Resource Sabotage: Attacks on Niger-Benin oil pipeline or Agadez mines.",
    "Narrative Score: 'Sovereignty vs Security'; Sahel-exit rhetoric appeal (Stability Score -5 to +5)"
  ],
  [Country.NIGERIA]: [
    "VEO Kinetic Intensity: Tactical sophisticated attacks by ISWAP/Boko Haram using drones.",
    "Geographic Diffusion: Expansion of operations into Northwest/North-central.",
    "Urban Unrest (Abuja/Lagos): Scale of nationwide strikes led by NLC (Dec 17, 2025).",
    "Economic Redlines: Poverty rate exceeding 52% or inflation sustained above 30%.",
    "Youth Mobilization Hubs: Decentralized youth uprisings coordinated via encrypted platforms.",
    "National Protest Momentum: Transition of 'one-day' protests into sustained movements.",
    "Institutional Security Strain: Capacity of forces to manage multiple fronts (separatism/banditry).",
    "Jihadi 'Inter-Group' Conflict: Internal turf wars between ISWAP and JAS factions.",
    "Narrative Score: Successful fiscal reform vs terminal cycle of inflation (Stability Score -5 to +5)"
  ],
  [Country.PAKISTAN]: [
    "PTI Street Power: Calls for nationwide protests/Long Marches by Imran Khan.",
    "State Suppression Tactics: Mass detentions under ATA and internet blackouts.",
    "Western Frontier Kineticism: Cross-border skirmishes with Taliban-led Afghanistan.",
    "Indo-Pak Border Parity: Deterioration of the 2021 ceasefire along the LoC.",
    "TTP/BLA Lethality: Scale of insurgent operations in KPK and Balochistan.",
    "Military Attrition Rhetoric: Security forces overstretched by internal/external commitments.",
    "Establishment Cohesion: Friction between high command and civilian government.",
    "Narrative Score: 'Final Battle against Terrorism' vs fragmented nation (Stability Score -5 to +5)"
  ],
  [Country.PALESTINE]: [
    "PA Security Fragmentation: PA security units undermining ISF or participating in resistance.",
    "Armed Group Political Hegemony: Surge in political influence of Hamas/Jenin Brigades in West Bank.",
    "Internal Leadership Assassinations: Assassination attempts targeting PA leadership/officials.",
    "West Bank Economic Collapse: GDP drop and social unrest due to revenue withholding.",
    "'Iron Wall' Operational Scope: Escalation of Israeli military operations and permanent stationing.",
    "Hard-line Policy Shift: Creeping annexation or dismantling of PA with US support.",
    "Settler-Palestinian Kineticism: Frequency of clashes between Palestinians and settlers.",
    "Strategic Settlement Expansion: Approval of plans physically bisecting the West Bank.",
    "Gaza Ceasefire Erosion: Breaches of the October 13, 2025, Gaza ceasefire agreement.",
    "Narrative Score: Statehood vs. Enclaves; Balkanization into militarized zones (Stability Score -5 to +5)"
  ],
  [Country.SOMALIA]: [
    "Mission Transition Integrity: AUSSOM status; funding-driven paralysis or SNA transfer failures.",
    "US Kinetic Escalation: Increase in AFRICOM airstrikes or withdrawal of Danab training.",
    "Federal Fragmentation: Political/military friction between FGS and Member States (Jubaland).",
    "Clan-Counter-Insurgency Friction: Inter-clan violence diverting Ma’awisley from Al-Shabaab.",
    "MIA Siege Posture: Precision fire targeting Mogadishu International Airport (MIA).",
    "Mogadishu Ground Offensive: Al-Shabaab movement into urban districts or large VBIED attacks.",
    "Electoral Timeline Crisis: Delays to May 2026 election or 'one-person, one-vote' consensus.",
    "Sharia Governance Expansion: Formal implementation of Al-Shabaab 'Alternative State' infrastructure.",
    "Narrative Score: National Transformation vs. Collapse (Stability Score -5 to +5)"
  ],
  [Country.SOUTH_SUDAN]: [
    "UPDF Intervention Integrity: Ugandan military deployment status and arms embargo status.",
    "Ethnic Rhetoric & Juba Siege Mentality: Escalation of Dinka vs. Nuer rhetoric in Juba.",
    "Kiir Public Absence: President Salva Kiir failing to appear for over 72 hours.",
    "SPLM-IO Nasir Front Offensives: Gains by opposition toward Juba or critical Bor/Bentiu hubs.",
    "UNMISS Attrition: TCC withdrawal announcements or forced closure of UN bases.",
    "Executive Flight Risk: Preparations of presidential flight or relocation of senior cabinet.",
    "Machar Verdict Reaction: Treason trial outcome for Riek Machar triggering civil war.",
    "Oil Artery Strangulation: Force Majeure at Heglig processing facility; cessation of exports.",
    "Electoral Abrogation: Legislative moves to delink 2026 elections from the constitution.",
    "Narrative Score: Justice vs. Political Cleansing (Stability Score -5 to +5)"
  ],
  [Country.TCI]: [
    "Maritime Sieve Effect: Trafficking networks evading coastal sensors in archipelagic waters.",
    "Haitian Shoreline Staging: Build-up of makeshift vessels on Haiti’s northern coast.",
    "Repatriation Gridlock: Inability to execute repatriation due to gang control in Haiti.",
    "Gangland Recruitment: OCGs recruiting newly arrived migrants for enforcement.",
    "Enforcement Antagonism: Kinetic resistance during maritime interceptions by Border Force.",
    "Luxury Tourism Deterioration: Quantitative decline in bookings or Level 3 advisories.",
    "Resource Overmatch: RTCIPF 'critical exhaustion'; withdrawal of UK-funded security assets.",
    "Shadow Economy Expansion: Increase in unlicensed hubs for smuggling coordination.",
    "Narrative Score: Safe Haven vs. Transit Hub for transnational crime (Stability Score -5 to +5)"
  ],
  [Country.UKRAINE]: [
    "Embassy Kinetic Violations: Damage to Western diplomatic missions in Kyiv via hypersonics.",
    "Northern Frontier Posturing: Russian/Belarusian military buildup in Gomel/Brest regions.",
    "Dnipro River Crossings: Russian establishment of bridgehead on the western (right) bank.",
    "Ceasefire Narrative Pivot: Official shifts in rhetoric regarding territorial compromises.",
    "US Strategic Decoupling: Funding freezes or implementation of PURL requirements.",
    "Donbas 'Fortress Belt' Integrity: Rate of Russian advance in Pokrovsk/Kramatorsk sectors.",
    "NDAA Compliance Monitoring: Monitoring of U.S. troop levels in Europe below 76,000.",
    "Energy Grid Survivability: Strikes on nuclear-adjacent switching stations; blackout duration.",
    "Narrative Score: Inevitable Victory vs. Managed Defeat (Stability Score -5 to +5)"
  ],
  [Country.VENEZUELA]: [
    "Knock-Knock Suppression Pulse: Intensity of Operación Tun Tun and prisoner surges.",
    "Monroe Interdiction Activity: U.S. Fourth Fleet boarding operations or full blockade.",
    "Essequibo Annexation Escalation: disregard for Argyle Declaration; deployment near Guyana.",
    "Neighboring Buffer Zones: Brazilian/Colombian armored asset deployment to border states.",
    "Institutional Defection Signals: Senior level officers defecting or refusing Tun Tun orders.",
    "Sovereign Debt/Oil Sequestration: Secondary sanctions on China/Russia/Iran oil purchases.",
    "Paramilitary/GTO Convergence: Coordination between regime and Tren de Aragua/ELN.",
    "Recognition Standoff: Official declarations recognizing Edmundo González Urrutia.",
    "Narrative Score: National Dignity vs. Humanitarian Rescue (Stability Score -5 to +5)"
  ]
};
