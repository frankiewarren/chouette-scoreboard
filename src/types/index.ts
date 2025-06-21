export interface Player {
  id: string;
  name: string;
  totalScore: number;
  gamesPlayed: number;
  createdAt: Date;
}

export interface GameSession {
  id: string;
  createdAt: Date;
  gameMode: 'setup' | 'game';
  isComplete: boolean;
  
  boxPlayerId: string | null;
  captainPlayerId: string | null;
  queuePlayerIds: string[];
  
  currentChouetteScores: { [playerId: string]: number };
  playersSittingOut: { [playerId: string]: boolean };
}

export type GameMode = 'setup' | 'game';

export interface QueuePlayerData {
  id: number;
  playerId: string;
  sittingOut: boolean;
}