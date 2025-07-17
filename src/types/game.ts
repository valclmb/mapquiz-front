export interface Player {
  id: string;
  name: string;
  status: string;
}

export interface PlayerScore extends Player {
  score: number;
  progress: number;
  validatedCountries?: string[];
  incorrectCountries?: string[];
}

export interface LobbySettings {
  selectedRegions: string[];
  gameMode: string;
}

export interface Ranking {
  id: string;
  name: string;
  score: number;
  completionTime: number;
  rank: number;
}
