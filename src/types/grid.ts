export type PlantKind = 'hydro' | 'gas' | 'steam' | 'solar';

export type StationId = 'kainji' | 'egbin' | 'geregu' | 'kano';

export interface PowerStation {
  id: StationId;
  name: string; // Generic role name e.g. "Hydro"
  realName: string; // Nigerian power station name e.g. "Kainji Hydroelectric Power Station"
  location: string; // e.g. "Niger State"
  plantType: 'Hydro' | 'Gas' | 'Solar';
  maxCapacityTokens: number; // e.g. 8 (80 MW)
  currentTokens: number;
  rampLimitTokens?: number; // Gas A & B: 3 tokens per round
  controlledBy: 'team' | 'facilitator';
  description: string;
  isTripped?: boolean;
  isRestricted?: boolean;
  restrictionNote?: string;
}

export interface RoundDefinition {
  id: number; // 0 for Practice, 1-6 for scored rounds
  name: string;
  timeOfDay: string;
  demandMW: number;
  demandTokens: number;
  solarTokens: number;
  solarMW: number;
  tokensNeeded: number; // Demand - Solar
  eventTitle?: string;
  eventDescription?: string;
  eventBadge?: string;
  teachingLine: string;
  facilitatorNotes: string;
  isPractice: boolean;
  // Specific round constraints
  egbinTripped?: boolean;
  egbinRestartLimit?: number;
  kainjiMaxLimit?: number;
  kainjiReserveMaxThreshold?: number; // Default 6 (at least 2 free spaces), in R6 it is 2
}

export interface RoundScore {
  roundId: number;
  roundName: string;
  demandTokens: number;
  solarTokens: number;
  kainjiTokens: number;
  egbinTokens: number;
  gereguTokens: number;
  totalGenerationTokens: number;
  loadShedTokens: number;
  effectiveDemandTokens: number;
  gapTokens: number;
  gapMW: number;
  baseMatchPoints: number; // 3 for exact, 2 for 1 off, 1 for 2 off, 0 for 3+ off
  hasReserveBonus: boolean;
  reserveBonusPoints: number; // +1
  loadShedPenalty: number; // -1 per token
  gasRampViolated: boolean;
  egbinChange: number;
  gereguChange: number;
  finalScore: number;
  isFrequencyAlarm: boolean;
  teachingLine: string;
  notes?: string;
}

export interface TeamScoreboardEntry {
  id: string;
  name: string;
  dispatcherName?: string;
  checkerName?: string;
  scores: Record<number, RoundScore | null>;
  totalScore: number;
  tournamentPoints: number; // 10, 7, 5, 3
  rank?: number;
}

export interface FrequencyTelemetry {
  frequencyHz: number;
  targetHz: number;
  rocof: number; // Rate of change of frequency (Hz/s)
  imbalanceMW: number;
  statusBand: 'normal' | 'alert' | 'critical-low' | 'critical-high';
  controllerMessage: string;
  timestamp: number;
}
