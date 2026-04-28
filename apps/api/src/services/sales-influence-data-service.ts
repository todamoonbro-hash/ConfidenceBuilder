export type SalesDifficulty = "beginner" | "intermediate" | "advanced" | "elite";
export type PracticeMode = "guided" | "realistic" | "pressure" | "elite";

export type SalesFramework = {
  id: string;
  label: string;
  pillars: string[];
};

export type SalesPersona = {
  id: string;
  name: string;
  speakingStyle: string;
  likelyQuestions: string[];
  resistanceTriggers: string[];
  whatPersuadesThem: string[];
  whatAnnoysThem: string[];
  difficultyModifier: number;
};

export type SalesScenario = {
  id: string;
  title: string;
  category: string;
  difficultyLevel: SalesDifficulty;
  estimatedDurationMinutes: number;
  targetSkill: string;
  scenarioBrief: string;
  userRole: string;
  aiPersonaRole: string;
  aiPersonaProfile: string;
  aiPersonaMood: string;
  aiPersonaResistanceLevel: number;
  successCriteria: string[];
  scoringRubric: string[];
  suggestedFramework: string;
  unlockRequirement: string;
  xpReward: number;
  badgesAvailable: string[];
};

export const SALES_FRAMEWORKS: SalesFramework[] = [
  { id: "aida", label: "AIDA", pillars: ["Attention", "Interest", "Desire", "Action"] },
  { id: "pas", label: "PAS", pillars: ["Problem", "Agitation", "Solution"] },
  { id: "spin", label: "SPIN", pillars: ["Situation", "Problem", "Implication", "Need-payoff"] },
  { id: "challenger", label: "Challenger Sale", pillars: ["Teach", "Tailor", "Take Control"] },
  { id: "meddicc", label: "MEDDICC", pillars: ["Metrics", "Economic Buyer", "Decision Criteria", "Decision Process", "Identify Pain", "Champion", "Competition"] },
  { id: "bant", label: "BANT", pillars: ["Budget", "Authority", "Need", "Timing"] },
  { id: "sandler", label: "Sandler-style consultative selling", pillars: ["Bonding", "Pain", "Budget", "Decision", "Fulfillment"] },
  { id: "narrative_pitch", label: "Narrative pitch", pillars: ["Context", "Problem", "Stakes", "Solution", "Proof", "Ask"] },
  { id: "investor_pitch", label: "Investor pitch", pillars: ["Market", "Pain", "Solution", "Traction", "Business model", "Team", "Ask"] },
  { id: "executive_update", label: "Executive update", pillars: ["Headline", "Data", "Implication", "Recommendation", "Decision required"] }
];

export const SALES_PERSONAS: SalesPersona[] = [
  { id: "friendly_buyer", name: "Friendly buyer", speakingStyle: "Collaborative and curious", likelyQuestions: ["What outcomes can we expect in 90 days?"], resistanceTriggers: ["Unclear ROI"], whatPersuadesThem: ["Specific examples", "Clear next steps"], whatAnnoysThem: ["Rambling"], difficultyModifier: 0 },
  { id: "skeptical_buyer", name: "Skeptical buyer", speakingStyle: "Short, direct, tests assumptions", likelyQuestions: ["Why change now?", "Why are you better?"], resistanceTriggers: ["Vague claims"], whatPersuadesThem: ["Evidence", "Trade-off clarity"], whatAnnoysThem: ["Buzzwords"], difficultyModifier: 6 },
  { id: "time_poor_executive", name: "Time-poor executive", speakingStyle: "Interrupts and asks for headline", likelyQuestions: ["What decision do you need from me?"], resistanceTriggers: ["No clear ask"], whatPersuadesThem: ["Executive summary", "Decision framing"], whatAnnoysThem: ["Context dumping"], difficultyModifier: 8 },
  { id: "technical_buyer", name: "Technical buyer", speakingStyle: "Detail-oriented and risk-focused", likelyQuestions: ["How does it integrate?", "What failsafe exists?"], resistanceTriggers: ["Hand-wavy architecture"], whatPersuadesThem: ["Concrete implementation detail"], whatAnnoysThem: ["Overselling"], difficultyModifier: 5 },
  { id: "financial_buyer", name: "Financial buyer / CFO", speakingStyle: "Numbers-first, downside-focused", likelyQuestions: ["What is payback period?"], resistanceTriggers: ["No financial model"], whatPersuadesThem: ["Unit economics", "Risk mitigation"], whatAnnoysThem: ["Vanity metrics"], difficultyModifier: 9 },
  { id: "procurement_blocker", name: "Procurement blocker", speakingStyle: "Process-heavy and defensive", likelyQuestions: ["Can you meet our terms?"], resistanceTriggers: ["Ignoring process"], whatPersuadesThem: ["Compliance readiness"], whatAnnoysThem: ["Pressure tactics"], difficultyModifier: 7 },
  { id: "angry_customer", name: "Angry customer", speakingStyle: "Emotional and confrontational", likelyQuestions: ["Why should I trust you now?"], resistanceTriggers: ["Defensiveness"], whatPersuadesThem: ["Ownership", "Specific remediation"], whatAnnoysThem: ["Excuses"], difficultyModifier: 10 },
  { id: "investor_interruptor", name: "Investor who interrupts", speakingStyle: "Rapid-fire, skeptical", likelyQuestions: ["What traction is real?"], resistanceTriggers: ["No proof points"], whatPersuadesThem: ["Tight narrative + metrics"], whatAnnoysThem: ["Long answers"], difficultyModifier: 10 },
  { id: "pe_partner", name: "PE partner", speakingStyle: "Hard-nosed value and risk lens", likelyQuestions: ["Where is margin expansion?"], resistanceTriggers: ["Weak strategy"], whatPersuadesThem: ["Operational rigor"], whatAnnoysThem: ["No numbers"], difficultyModifier: 11 },
  { id: "founder_pressure", name: "Founder under pressure", speakingStyle: "Urgent and restless", likelyQuestions: ["What can we do this week?"], resistanceTriggers: ["Slow plans"], whatPersuadesThem: ["Prioritized roadmap"], whatAnnoysThem: ["Theory only"], difficultyModifier: 7 },
  { id: "underperforming_member", name: "Underperforming team member", speakingStyle: "Uncertain, guarded", likelyQuestions: ["Am I failing?"], resistanceTriggers: ["Blame"], whatPersuadesThem: ["Specific coaching"], whatAnnoysThem: ["Judgment"], difficultyModifier: 5 },
  { id: "defensive_manager", name: "Defensive manager", speakingStyle: "Protective and political", likelyQuestions: ["What are you implying?"], resistanceTriggers: ["Public criticism"], whatPersuadesThem: ["Shared goals"], whatAnnoysThem: ["Ambush feedback"], difficultyModifier: 8 },
  { id: "difficult_employee", name: "High-performing but difficult employee", speakingStyle: "Confident, challenges authority", likelyQuestions: ["Why should I change?"], resistanceTriggers: ["Vague feedback"], whatPersuadesThem: ["Impact framing"], whatAnnoysThem: ["Micromanagement"], difficultyModifier: 8 },
  { id: "board_member", name: "Board member asking hard questions", speakingStyle: "Strategic and blunt", likelyQuestions: ["What are key risks and mitigations?"], resistanceTriggers: ["No accountability"], whatPersuadesThem: ["Decision-ready synthesis"], whatAnnoysThem: ["Story without data"], difficultyModifier: 10 },
  { id: "journalist", name: "Journalist / media interviewer", speakingStyle: "Provocative and concise", likelyQuestions: ["What did you get wrong?"], resistanceTriggers: ["Evasion"], whatPersuadesThem: ["Clear accountability"], whatAnnoysThem: ["Spin"], difficultyModifier: 9 }
];

export const SALES_SCENARIOS: SalesScenario[] = [
  { id: "si_001", title: "30-second elevator pitch", category: "Sales Pitch", difficultyLevel: "beginner", estimatedDurationMinutes: 5, targetSkill: "opening_strength", scenarioBrief: "You meet a potential buyer in an elevator and have 30 seconds.", userRole: "Account Executive", aiPersonaRole: "Busy VP", aiPersonaProfile: "Time-poor executive", aiPersonaMood: "neutral", aiPersonaResistanceLevel: 4, successCriteria: ["Clear problem", "Differentiation", "Specific ask"], scoringRubric: ["clarity", "openingStrength", "conciseness", "closingNextStep"], suggestedFramework: "aida", unlockRequirement: "None", xpReward: 90, badgesAvailable: ["Clarity Machine"] },
  { id: "si_002", title: "2-minute product pitch", category: "Demo", difficultyLevel: "intermediate", estimatedDurationMinutes: 10, targetSkill: "structure", scenarioBrief: "Pitch product value to a skeptical buyer in a short meeting.", userRole: "Sales Lead", aiPersonaRole: "Skeptical buyer", aiPersonaProfile: "Skeptical buyer", aiPersonaMood: "guarded", aiPersonaResistanceLevel: 6, successCriteria: ["Problem framing", "Proof point", "Commercial model"], scoringRubric: ["problemFraming", "persuasiveness", "evidenceProofPoints", "structure"], suggestedFramework: "pas", unlockRequirement: "Level 2", xpReward: 130, badgesAvailable: ["Trusted Advisor"] },
  { id: "si_003", title: "Cold call to skeptical prospect", category: "Cold Call", difficultyLevel: "intermediate", estimatedDurationMinutes: 8, targetSkill: "call_control", scenarioBrief: "You have under 2 minutes to earn permission for discovery.", userRole: "BDR", aiPersonaRole: "Prospect", aiPersonaProfile: "Skeptical buyer", aiPersonaMood: "busy", aiPersonaResistanceLevel: 7, successCriteria: ["Permission ask", "Relevance", "Clear next step"], scoringRubric: ["openingStrength", "callControl", "adaptability", "closingNextStep"], suggestedFramework: "bant", unlockRequirement: "Level 2", xpReward: 120, badgesAvailable: ["Cold Call Survivor"] },
  { id: "si_004", title: "Discovery with busy CFO", category: "Discovery", difficultyLevel: "advanced", estimatedDurationMinutes: 12, targetSkill: "discovery_quality", scenarioBrief: "Run discovery and surface economic impact with a busy CFO.", userRole: "Enterprise AE", aiPersonaRole: "CFO", aiPersonaProfile: "Financial buyer / CFO", aiPersonaMood: "impatient", aiPersonaResistanceLevel: 8, successCriteria: ["Quantified pain", "Decision process", "Economic buyer mapping"], scoringRubric: ["discoveryQuality", "commercialAcumen", "listeningResponsiveness", "specificity"], suggestedFramework: "meddicc", unlockRequirement: "Level 3", xpReward: 180, badgesAvailable: ["Challenger"] },
  { id: "si_005", title: "Objection: price too high", category: "Objection Handling", difficultyLevel: "intermediate", estimatedDurationMinutes: 8, targetSkill: "objection_handling", scenarioBrief: "Customer says your price is too high.", userRole: "Account Executive", aiPersonaRole: "Buyer", aiPersonaProfile: "Procurement blocker", aiPersonaMood: "firm", aiPersonaResistanceLevel: 7, successCriteria: ["Acknowledge", "Reframe value", "Trade-off"], scoringRubric: ["objectionHandling", "toneWarmth", "persuasiveness", "commercialAcumen"], suggestedFramework: "sandler", unlockRequirement: "Level 2", xpReward: 125, badgesAvailable: ["Objection Killer"] },
  { id: "si_006", title: "Objection: incumbent vendor", category: "Objection Handling", difficultyLevel: "advanced", estimatedDurationMinutes: 9, targetSkill: "adaptability", scenarioBrief: "Prospect already uses a competitor and sees no reason to switch.", userRole: "AE", aiPersonaRole: "Buyer", aiPersonaProfile: "Technical buyer", aiPersonaMood: "skeptical", aiPersonaResistanceLevel: 8, successCriteria: ["Differentiate clearly", "Migration path", "Risk reduction"], scoringRubric: ["adaptability", "structure", "evidenceProofPoints", "closingNextStep"], suggestedFramework: "challenger", unlockRequirement: "Level 3", xpReward: 150, badgesAvailable: ["Trusted Advisor"] },
  { id: "si_007", title: "Objection: send me information", category: "Closing", difficultyLevel: "intermediate", estimatedDurationMinutes: 6, targetSkill: "closing", scenarioBrief: "Prospect deflects with 'send me information'.", userRole: "SDR", aiPersonaRole: "Prospect", aiPersonaProfile: "Time-poor executive", aiPersonaMood: "dismissive", aiPersonaResistanceLevel: 6, successCriteria: ["Clarify interest", "Secure calendar step", "Keep momentum"], scoringRubric: ["callControl", "closingNextStep", "conciseness", "confidence"], suggestedFramework: "aida", unlockRequirement: "Level 2", xpReward: 110, badgesAvailable: ["Closer"] },
  { id: "si_008", title: "Investor pitch with interruptions", category: "Investor Pitch", difficultyLevel: "elite", estimatedDurationMinutes: 15, targetSkill: "investor_readiness", scenarioBrief: "Investor interrupts and challenges traction assumptions.", userRole: "Founder", aiPersonaRole: "Investor", aiPersonaProfile: "Investor who interrupts", aiPersonaMood: "aggressive", aiPersonaResistanceLevel: 10, successCriteria: ["Answer with metrics", "Recover composure", "Clear ask"], scoringRubric: ["confidence", "evidenceProofPoints", "adaptability", "structure"], suggestedFramework: "investor_pitch", unlockRequirement: "Level 5", xpReward: 260, badgesAvailable: ["Investor Calm"] },
  { id: "si_009", title: "Board update on poor performance", category: "Board / Executive Stakeholder Conversation", difficultyLevel: "advanced", estimatedDurationMinutes: 12, targetSkill: "executive_communication", scenarioBrief: "You must brief board members on underperformance and recovery plan.", userRole: "CFO", aiPersonaRole: "Board member", aiPersonaProfile: "Board member asking hard questions", aiPersonaMood: "critical", aiPersonaResistanceLevel: 9, successCriteria: ["Transparent diagnosis", "Decisive recommendation", "Decision request"], scoringRubric: ["clarity", "commercialAcumen", "structure", "closingNextStep"], suggestedFramework: "executive_update", unlockRequirement: "Level 4", xpReward: 210, badgesAvailable: ["Boardroom Ready"] },
  { id: "si_010", title: "Team member underperforming", category: "Manager Conversation", difficultyLevel: "intermediate", estimatedDurationMinutes: 9, targetSkill: "coaching_conversation", scenarioBrief: "Coach an underperforming team member while preserving accountability and trust.", userRole: "Manager", aiPersonaRole: "Team member", aiPersonaProfile: "Underperforming team member", aiPersonaMood: "anxious", aiPersonaResistanceLevel: 5, successCriteria: ["Clear expectations", "Support plan", "Follow-up cadence"], scoringRubric: ["toneWarmth", "specificity", "listeningResponsiveness", "closingNextStep"], suggestedFramework: "narrative_pitch", unlockRequirement: "Level 2", xpReward: 140, badgesAvailable: ["Trusted Advisor"] },
  { id: "si_011", title: "Influence without authority", category: "Internal Team Training", difficultyLevel: "advanced", estimatedDurationMinutes: 10, targetSkill: "internal_influence", scenarioBrief: "Drive cross-functional alignment in an internal meeting without direct authority.", userRole: "Program Lead", aiPersonaRole: "Defensive manager", aiPersonaProfile: "Defensive manager", aiPersonaMood: "defensive", aiPersonaResistanceLevel: 8, successCriteria: ["Align on shared goals", "Resolve trade-offs", "Secure commitment"], scoringRubric: ["persuasiveness", "adaptability", "callControl", "structure"], suggestedFramework: "challenger", unlockRequirement: "Level 3", xpReward: 175, badgesAvailable: ["Challenger"] },
  { id: "si_012", title: "PE-style strategy interrogation", category: "Board / Executive Stakeholder Conversation", difficultyLevel: "elite", estimatedDurationMinutes: 14, targetSkill: "strategic_defense", scenarioBrief: "Defend numbers, assumptions, and strategy under PE-style questioning.", userRole: "CEO", aiPersonaRole: "PE partner", aiPersonaProfile: "PE partner", aiPersonaMood: "intense", aiPersonaResistanceLevel: 10, successCriteria: ["Maintain control", "Quantify strategy", "Conclude with decision"], scoringRubric: ["commercialAcumen", "specificity", "confidence", "adaptability"], suggestedFramework: "executive_update", unlockRequirement: "Level 5", xpReward: 280, badgesAvailable: ["Elite Communicator"] }
];

export const SALES_CERTIFICATIONS = [
  { id: "cert_sales_pitch", title: "Sales Pitch Certified", minimumAverageScore: 75, requiredScenarioIds: ["si_001", "si_002"], criticalDimensions: ["clarity", "openingStrength", "closingNextStep"] },
  { id: "cert_discovery", title: "Discovery Call Certified", minimumAverageScore: 78, requiredScenarioIds: ["si_004"], criticalDimensions: ["discoveryQuality", "commercialAcumen"] },
  { id: "cert_objection", title: "Objection Handling Certified", minimumAverageScore: 80, requiredScenarioIds: ["si_005", "si_006", "si_007"], criticalDimensions: ["objectionHandling", "adaptability"] },
  { id: "cert_investor", title: "Investor Pitch Certified", minimumAverageScore: 82, requiredScenarioIds: ["si_008"], criticalDimensions: ["evidenceProofPoints", "confidence"] },
  { id: "cert_manager", title: "Manager Conversation Certified", minimumAverageScore: 76, requiredScenarioIds: ["si_010", "si_011"], criticalDimensions: ["toneWarmth", "specificity"] },
  { id: "cert_exec", title: "Executive Communication Certified", minimumAverageScore: 84, requiredScenarioIds: ["si_009", "si_012"], criticalDimensions: ["structure", "commercialAcumen"] }
] as const;
