export type GameState = 'TITLE' | 'DAY_START' | 'PLAYING' | 'DAY_CLEAR' | 'GAME_OVER' | 'ENDING';

export type GameOverReason =
  | 'COMPLETED_ALL'
  | 'TIME_UP'
  | 'STAMINA_EXHAUSTED'
  | 'ROOF_AVALANCHE'
  | 'ROOF_FALL'
  | 'STREET_CAR_ACCIDENT';

export type StageLocation = 'YARD' | 'ROOF';
export type ToolType = 'SHOVEL' | 'DUMP';
export type SnowType = 'POWDER' | 'WET' | 'COMPACT';

export interface DayConfig {
  day: number;
  title: string;
  stageLocation: StageLocation;
  morningQuote: string;
  targetClearPercent: number;
  timeLimitSec: number;
  snowFallRate: number; // grid cells per second
  blizzardIntensity: number; // 0 to 1
  roofHazardEnabled: boolean;
  snowType: SnowType;
  columnTrivia: string;
  description: string;
}

export interface SupportOption {
  id: 'neighbor' | 'volunteer' | 'snowplow' | 'grandson' | 'melting_pipe' | 'tonjiru' | 'safety_rope';
  name: string;
  sub: string;
  icon: string;
  cooldownSec: number;
  remainingCooldown: number;
  usedToday: boolean;
  description: string;
}

export interface HighScoreRecord {
  highScore: number;
  maxDay: number;
  totalSnowClearedKg: number;
  date: string;
}

