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
type WebSocketMsg =
  | GameStateUpdateMsg
  | LobbyUpdateMsg
  | GetGameStateSuccessMsg
  | { type: string; [key: string]: unknown };

function extractLobbyStateZod(
  msg: WebSocketMsg,
  lobbyId: string
): LobbyState | null {
  console.log("extractLobbyStateZod - Message reçu:", msg);

  let data: unknown = null;
  switch (msg.type) {
    case "game_state_update":
      data = (msg as GameStateUpdateMsg).payload?.gameState;
      console.log("extractLobbyStateZod - game_state_update data:", data);
      break;
    case "lobby_update":
      data = (msg as LobbyUpdateMsg).payload;
      console.log("extractLobbyStateZod - lobby_update data:", data);
      break;
    case "get_game_state_success":
      data = (msg as GetGameStateSuccessMsg).data?.gameState;
      console.log("extractLobbyStateZod - get_game_state_success data:", data);
      break;
    default:
      console.log("extractLobbyStateZod - Type de message non géré:", msg.type);
      return null;
  }
  if (!data) {
    console.log("extractLobbyStateZod - Pas de données dans le message");
    return null;
  }

  const parsed = LobbyStateSchema.safeParse(data);
  console.log("extractLobbyStateZod - Résultat de la validation Zod:", parsed);

  if (parsed.success && parsed.data.lobbyId === lobbyId) {
    console.log(
      "extractLobbyStateZod - État du lobby extrait avec succès:",
      parsed.data
    );
    return parsed.data;
  }

  if (!parsed.success) {
    console.log(
      "extractLobbyStateZod - Erreur de validation Zod:",
      parsed.error
    );
    console.log("ZodError details:", parsed.error.issues);
  } else if (parsed.data.lobbyId !== lobbyId) {
    console.log("extractLobbyStateZod - lobbyId ne correspond pas:", {
      expected: lobbyId,
      received: parsed.data.lobbyId,
    });
  }

  return null;
}

export function useLobbyStatus(lobbyId: string) {
  const { lastMessage, sendMessage, isAuthenticated } = useWebSocketContext();
  const [lobby, setLobby] = useState<LobbyState | null>(null);
  const [hasRequestedGameState, setHasRequestedGameState] = useState(false);

  // Demander l'état du jeu au backend quand le hook se monte, uniquement si authentifié
  useEffect(() => {
    if (!hasRequestedGameState && lobbyId && isAuthenticated) {
      console.log(
        "useLobbyStatus - Demande de l'état du jeu pour le lobby:",
        lobbyId
      );
      sendMessage({
        type: "get_game_state",
        payload: { lobbyId },
      });
      setHasRequestedGameState(true);
    }
  }, [lobbyId, hasRequestedGameState, sendMessage, isAuthenticated]);

  // Écouter les messages WebSocket
  useEffect(() => {
    console.log("useLobbyStatus - lastMessage reçu:", lastMessage);
    if (!lastMessage) return;

    const state = extractLobbyStateZod(lastMessage as WebSocketMsg, lobbyId);
    if (state) {
      console.log("useLobbyStatus - État du lobby reçu:", state);
      setLobby(state);
    } else {
      console.log("useLobbyStatus - Aucun état de lobby extrait du message");
    }
  }, [lastMessage, lobbyId]);

  console.log("useLobbyStatus - État actuel du lobby:", lobby);
  return lobby;
}
