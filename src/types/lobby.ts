import type { Continent } from "./continent";
import type { Player } from "./game";

export interface LobbySettings {
  selectedRegions: Continent[];
  gameMode?: "quiz" | "training";
}

export interface LobbyState {
  lobbyId: string;
  players: Player[];
  hostId: string;
  settings: LobbySettings;
  status: "waiting" | "started" | "finished";
}

export type MultiplayerPlayer = Player & {
  score: number;
  progress: number;
  validatedCountries: string[];
  incorrectCountries: string[];
};
