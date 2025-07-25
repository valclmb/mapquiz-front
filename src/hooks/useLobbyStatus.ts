import { useWebSocketContext } from "@/context/WebSocketContext";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";

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
type GetLobbyStateSuccessMsg = {
  type: "get_lobby_state_success";
  data?: { lobbyState?: unknown };
};
type WebSocketMsg =
  | GameStateUpdateMsg
  | LobbyUpdateMsg
  | GetGameStateSuccessMsg
  | GetLobbyStateSuccessMsg
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

    case "get_lobby_state_success":
      data = (msg as GetLobbyStateSuccessMsg).data?.lobbyState;
      console.log("extractLobbyStateZod - get_lobby_state_success data:", data);
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
  const [shouldRedirect, setShouldRedirect] = useState<{
    to: string;
    reason: string;
  } | null>(null);

  // Demander l'état du lobby au backend quand le hook se monte, uniquement si authentifié
  // Sur la page lobby et résultats, on utilise get_lobby_state (plus léger)
  useEffect(() => {
    const isOnResultPage = window.location.pathname.includes("/result");
    const isOnLobbyPage =
      window.location.pathname === `/multiplayer/${lobbyId}` ||
      window.location.pathname === `/multiplayer/${lobbyId}/`;
    const isOnGamePage = window.location.pathname.includes("/game");

    console.log("useLobbyStatus - Vérification condition demande état:", {
      hasRequestedGameState,
      lobbyId,
      isAuthenticated,
      condition: !hasRequestedGameState && lobbyId && isAuthenticated,
    });

    if (!hasRequestedGameState && lobbyId && isAuthenticated) {
      console.log(
        `useLobbyStatus - Demande de l'état pour le lobby:`,
        lobbyId,
        {
          isOnResultPage,
          isOnLobbyPage,
          isOnGamePage,
          pathname: window.location.pathname,
        }
      );

      // Sur la page lobby, d'abord vérifier si le lobby existe
      if (isOnLobbyPage) {
        console.log(
          "useLobbyStatus - Envoi get_lobby_state pour vérifier l'existence du lobby"
        );
        sendMessage({
          type: "get_lobby_state",
          payload: { lobbyId },
        });
      } else if (isOnResultPage) {
        // Sur la page résultats, demander juste l'état du lobby (plus léger)
        console.log("useLobbyStatus - Envoi get_lobby_state");
        sendMessage({
          type: "get_lobby_state",
          payload: { lobbyId },
        });
      } else if (isOnGamePage) {
        // Sur la page jeu, demander l'état complet du jeu
        console.log("useLobbyStatus - Envoi get_game_state");
        sendMessage({
          type: "get_game_state",
          payload: { lobbyId },
        });
      }
      setHasRequestedGameState(true);
    }
  }, [lobbyId, hasRequestedGameState, sendMessage, isAuthenticated]);

  // Écouter les messages WebSocket
  useEffect(() => {
    console.log("useLobbyStatus - lastMessage reçu:", lastMessage);
    if (!lastMessage) return;

    // Gérer les messages d'erreur pour forcer la redirection
    if (lastMessage.type === "error") {
      const errorMessage = lastMessage.message as string;
      console.log("useLobbyStatus - Erreur reçue:", errorMessage);

      // Si on est sur la page jeu et que la partie est terminée, rediriger vers les résultats
      if (
        errorMessage.includes("terminée") &&
        window.location.pathname.includes("/game")
      ) {
        console.log(
          "useLobbyStatus - Redirection forcée vers les résultats car partie terminée"
        );
        setShouldRedirect({ to: "result", reason: "Partie terminée" });
        return;
      }

      // Si le lobby n'existe pas, rediriger vers l'accueil
      if (errorMessage.includes("Lobby non trouvé") || errorMessage.includes("n'existe pas")) {
        console.log("useLobbyStatus - Lobby non trouvé, redirection vers l'accueil");
        setShouldRedirect({ to: "home", reason: "Lobby non trouvé" });
        return;
      }

      // Si l'utilisateur n'est pas autorisé, rediriger vers l'accueil
      if (errorMessage.includes("pas autorisé") || errorMessage.includes("rejoindre le lobby") || errorMessage.includes("non autorisé")) {
        console.log("useLobbyStatus - Utilisateur non autorisé, redirection vers l'accueil");
        setShouldRedirect({ to: "home", reason: "Vous n'êtes pas autorisé à accéder à ce lobby" });
        return;
      }

      // Pour les autres erreurs, afficher un message et rediriger vers l'accueil
      console.log("useLobbyStatus - Erreur non gérée, redirection vers l'accueil");
      setShouldRedirect({ to: "home", reason: errorMessage });
      return;
    }

    // Gérer la réponse de get_lobby_state
    if (lastMessage.type === "get_lobby_state_success") {
      console.log("useLobbyStatus - Lobby trouvé, envoi de join_lobby");
      // Ne pas envoyer join_lobby si on a déjà une redirection en cours
      if (!shouldRedirect) {
        sendMessage({
          type: "join_lobby",
          payload: { lobbyId },
        });
      }
      return;
    }

    // Log spécifique pour les messages lobby_update
    if (lastMessage.type === "lobby_update") {
      console.log("useLobbyStatus - Message lobby_update reçu:", {
        type: lastMessage.type,
        payload: lastMessage.payload,
        lobbyId: (lastMessage.payload as Record<string, unknown>)?.lobbyId,
        status: (lastMessage.payload as Record<string, unknown>)?.status,
      });
    }

    const state = extractLobbyStateZod(lastMessage as WebSocketMsg, lobbyId);
    if (state) {
      console.log("useLobbyStatus - État du lobby reçu:", state);
      
      // Vérifier si l'utilisateur était déconnecté et s'est reconnecté
      if (lobby && state.players) {
        const currentPlayer = state.players.find(
          (p) => p.status === "joined"
        );
        if (currentPlayer) {
          // Vérifier si le joueur était précédemment déconnecté
          const wasDisconnected = lobby.players.find(
            (p) => p.id === currentPlayer.id && p.status === "disconnected"
          );
          if (wasDisconnected) {
            toast.success("Vous avez été reconnecté au lobby !");
          }
        }
      }
      
      setLobby(state);
    } else {
      console.log("useLobbyStatus - Aucun état de lobby extrait du message");
    }
  }, [lastMessage, lobbyId]);

  console.log("useLobbyStatus - État actuel du lobby:", lobby);
  return { lobby, shouldRedirect };
}
