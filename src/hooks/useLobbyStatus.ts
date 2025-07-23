import { useWebSocketContext } from "@/context/WebSocketContext";
import { useEffect, useState } from "react";

export type LobbyPlayer = {
  id: string;
  name: string;
  score?: number;
  progress?: number;
  status: string;
  validatedCountries?: string[];
  incorrectCountries?: string[];
};

export type LobbySettings = {
  selectedRegions: string[];
  gameMode: string;
  totalQuestions?: number;
};

export type LobbyState = {
  lobbyId: string;
  status: string;
  players: LobbyPlayer[];
  settings: LobbySettings;
  hostId: string;
};

export function useLobbyStatus(lobbyId: string) {
  const { lastMessage } = useWebSocketContext();
  const [lobby, setLobby] = useState<LobbyState | null>(null);

  useEffect(() => {
    if (!lastMessage) return;

    let data: Partial<LobbyState> | null = null;

    if (
      lastMessage.type === "game_state_update" &&
      (lastMessage.payload?.gameState as Partial<LobbyState>)?.lobbyId ===
        lobbyId
    ) {
      data = lastMessage.payload?.gameState as Partial<LobbyState>;
    } else if (
      lastMessage.type === "lobby_update" &&
      (lastMessage.payload as Partial<LobbyState>)?.lobbyId === lobbyId
    ) {
      data = lastMessage.payload as Partial<LobbyState>;
    } else if (
      lastMessage.type === "get_game_state_success" &&
      (lastMessage.data?.gameState as Partial<LobbyState>)?.lobbyId === lobbyId
    ) {
      data = lastMessage.data?.gameState as Partial<LobbyState>;
    }

    if (
      data &&
      typeof data.lobbyId === "string" &&
      typeof data.status === "string" &&
      typeof data.hostId === "string" &&
      data.settings &&
      typeof data.settings.gameMode === "string" &&
      Array.isArray(data.settings.selectedRegions) &&
      Array.isArray(data.players)
    ) {
      setLobby(data as LobbyState);
    }
  }, [lastMessage, lobbyId]);

  return lobby;
}
