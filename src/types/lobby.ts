export type LobbyPlayer = {
  id: string;
  name: string;
  status: string;
};

export type LobbyState = {
  lobbyId: string;
  status: string;
  players: LobbyPlayer[];
  settings?: Record<string, unknown>;
  hostId?: string;
  rankings?: unknown[];
};

export type MultiplayerPlayer = {
  id: string;
  name: string;
  status: string;
  score: number;
  progress: number;
  validatedCountries: string[];
  incorrectCountries: string[];
};
