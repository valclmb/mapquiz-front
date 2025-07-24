export interface Player {
  id: string;
  name: string;
  // Le statut est optionnel car on ne l'affiche plus pendant le jeu
  status?: string;
  isPresentInLobby?: boolean;
  leftLobbyAt?: string | null;
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
