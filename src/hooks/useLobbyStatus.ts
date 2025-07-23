import { useWebSocketContext } from "@/context/WebSocketContext";
import { useEffect, useState } from "react";
import { z } from "zod";

export const LobbyPlayerSchema = z.object({
  id: z.string(),
  name: z.string(),
  score: z.number().optional(),
  progress: z.number().optional(),
  status: z.string(),
  validatedCountries: z.array(z.string()).optional(),
  incorrectCountries: z.array(z.string()).optional(),
});

export const LobbySettingsSchema = z.object({
  selectedRegions: z.array(z.string()),
  gameMode: z.string(),
  totalQuestions: z.number().optional(),
});

export const LobbyStateSchema = z.object({
  lobbyId: z.string(),
  status: z.string(),
  players: z.array(LobbyPlayerSchema),
  settings: LobbySettingsSchema,
  hostId: z.string(),
});

export type LobbyState = z.infer<typeof LobbyStateSchema>;

type GameStateUpdateMsg = {
  type: "game_state_update";
  payload?: { gameState?: unknown };
};
type LobbyUpdateMsg = { type: "lobby_update"; payload?: unknown };
type GetGameStateSuccessMsg = {
  type: "get_game_state_success";
  data?: { gameState?: unknown };
};
type CreateLobbySuccessMsg = {
  type: "create_lobby_success";
  data?: { lobby?: unknown };
};
type WebSocketMsg =
  | GameStateUpdateMsg
  | LobbyUpdateMsg
  | GetGameStateSuccessMsg
  | CreateLobbySuccessMsg
  | { type: string; [key: string]: unknown };

function extractLobbyStateZod(
  msg: WebSocketMsg,
  lobbyId: string
): LobbyState | null {
  let data: unknown = null;
  switch (msg.type) {
    case "game_state_update":
      data = (msg as GameStateUpdateMsg).payload?.gameState;
      break;
    case "lobby_update":
      data = (msg as LobbyUpdateMsg).payload;
      break;
    case "get_game_state_success":
      data = (msg as GetGameStateSuccessMsg).data?.gameState;
      break;
    case "create_lobby_success":
      data = (msg as CreateLobbySuccessMsg).data?.lobby;
      break;
    default:
      return null;
  }
  if (!data) return null;
  const parsed = LobbyStateSchema.safeParse(data);
  if (parsed.success && parsed.data.lobbyId === lobbyId) {
    return parsed.data;
  }
  return null;
}

export function useLobbyStatus(lobbyId: string) {
  const { lastMessage } = useWebSocketContext();
  const [lobby, setLobby] = useState<LobbyState | null>(null);

  useEffect(() => {
    if (!lastMessage) return;
    const state = extractLobbyStateZod(lastMessage as WebSocketMsg, lobbyId);
    if (state) setLobby(state);
  }, [lastMessage, lobbyId]);

  return lobby;
}
