export interface Player {
  id: string;
  name: string;
  image: string;
  status?: "ready" | "joined" | "invited";
}

export interface PlayerScore extends Player {
  score: number;
  progress: number;
  validatedCountries?: string[];
  incorrectCountries?: string[];
}

export interface Ranking {
  id: string;
  name: string;
  score: number;
  completionTime?: number | null;
  rank: number;
}
