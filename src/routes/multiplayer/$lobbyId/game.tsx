import { MultiplayerGame } from "@/components/multiplayer/MultiplayerGame";
import { useWebSocketContext } from "@/context/WebSocketContext";
import type { Country } from "@/hooks/useMapGame";
import type { WebSocketMessage } from "@/hooks/useWebSocket";
import { authClient } from "@/lib/auth-client";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/multiplayer/$lobbyId/game")({
  component: MultiplayerGamePage,
});

type GameState = {
  countries: Country[];
  settings: {
    selectedRegions: string[];
  };
  players?: Array<{
    id: string;
    name: string;
    score: number;
    progress: number;
    // Le statut est optionnel car on ne l'affiche plus pendant le jeu
    status?: string;
    validatedCountries: string[];
    incorrectCountries: string[];
  }>;
};

function MultiplayerGamePage() {
  const { lobbyId } = Route.useParams();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { sendMessage, lastMessage, isConnected } = useWebSocketContext();

  // Récupérer l'ID de l'utilisateur actuel
  const { data: session } = authClient.useSession();
  const currentUserId = session?.user?.id;

  // Gestion de la présence dans le jeu
  useEffect(() => {
    if (!currentUserId || !lobbyId) {
      console.log("MultiplayerGamePage - currentUserId ou lobbyId manquant:", {
        currentUserId,
        lobbyId,
      });
      return;
    }

    // Marquer l'utilisateur comme présent dans le lobby (une seule fois)
    const markAsPresent = () => {
      if (!currentUserId) {
        console.log(
          "MultiplayerGamePage - currentUserId manquant lors de markAsPresent"
        );
        return;
      }
      console.log("MultiplayerGamePage - Marquer comme présent");
      sendMessage({
        type: "set_player_absent",
        payload: {
          lobbyId,
          absent: false,
        },
      });
    };

    // Marquer l'utilisateur comme absent du lobby
    const markAsAbsent = () => {
      if (!currentUserId) {
        console.log(
          "MultiplayerGamePage - currentUserId manquant lors de markAsAbsent"
        );
        return;
      }
      console.log("MultiplayerGamePage - Marquer comme absent");
      sendMessage({
        type: "set_player_absent",
        payload: {
          lobbyId,
          absent: true,
        },
      });
    };

    // Marquer comme présent quand on entre dans le jeu (une seule fois)
    markAsPresent();

    // Gestionnaire pour détecter quand l'utilisateur quitte la page
    const handleBeforeUnload = () => {
      markAsAbsent();
    };

    // Ajouter les écouteurs d'événements
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Nettoyer les écouteurs d'événements
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [currentUserId, lobbyId, sendMessage]);

  // Vérifier si l'utilisateur est autorisé avant d'envoyer des messages WebSocket
  useEffect(() => {
    if (isConnected && !gameState && !error) {
      sendMessage({
        type: "get_game_state",
        payload: { lobbyId },
      });
      setLoading(false);
    }
  }, [isConnected, gameState, lobbyId, sendMessage, error]);

  const handleGameStateMessage = (message: WebSocketMessage) => {
    if (message.payload?.gameState) {
      setGameState(message.payload.gameState as GameState);
      setError(null);
    } else {
      setError("Aucun état de jeu disponible");
    }
  };

  const handleGameStateUpdateMessage = (message: WebSocketMessage) => {
    const state = message.payload?.gameState;
    if (
      state &&
      typeof state === "object" &&
      "countries" in state &&
      (state as { countries?: unknown }).countries
    ) {
      setGameState(state as GameState);
      setError(null);
      return;
    }
    if (
      state &&
      typeof state === "object" &&
      "gameState" in state &&
      (state as { gameState?: { countries?: unknown } }).gameState?.countries
    ) {
      const nestedState = (state as { gameState?: GameState }).gameState;
      setGameState(nestedState as GameState);
      setError(null);
      return;
    }
    if (state && typeof state === "object" && "gameState" in state) {
      const nestedGameState = (state as { gameState?: GameState }).gameState;
      if (
        nestedGameState &&
        "countries" in nestedGameState &&
        nestedGameState.countries
      ) {
        setGameState(nestedGameState as GameState);
        setError(null);
        return;
      }
    }
    setError("Aucun état de jeu disponible");
  };

  const handleGameStartMessage = (message: WebSocketMessage) => {
    if (message.payload?.gameState) {
      setGameState(message.payload.gameState as GameState);
      setError(null);
    }
  };

  const handleErrorMessage = (message: WebSocketMessage) => {
    const errorMessage =
      message.message || "Erreur lors du chargement de l'état du jeu";
    if (errorMessage.includes("Aucun état de jeu disponible")) {
      setLoading(true);
      return;
    }
    setError(errorMessage);
  };

  useEffect(() => {
    const messageLobbyId =
      lastMessage?.lobbyId ||
      lastMessage?.payload?.lobbyId ||
      lastMessage?.data?.lobbyId;
    if (lastMessage?.type === "game_state_update") {
      handleGameStateUpdateMessage(lastMessage);
      return;
    }
    if (lastMessage?.type === "score_update") {
      return;
    }
    if (!lastMessage || messageLobbyId !== lobbyId) {
      return;
    }
    switch (lastMessage.type) {
      case "game_state":
        handleGameStateMessage(lastMessage);
        break;
      case "game_start":
        handleGameStartMessage(lastMessage);
        break;
      case "error":
        handleErrorMessage(lastMessage);
        break;
    }
  }, [lastMessage, lobbyId]);

  useEffect(() => {
    if (!isConnected && !loading && !gameState) {
      setError("Connexion WebSocket perdue. Veuillez rafraîchir la page.");
    }
  }, [isConnected, loading, gameState]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Connexion au serveur...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Erreur</h1>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Rafraîchir la page
        </button>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold mb-4">Chargement...</h1>
          <p className="text-gray-600 mb-4">
            Récupération de l'état du jeu depuis le serveur...
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Lobby: {lobbyId} | Connecté: {isConnected ? "Oui" : "Non"}
          </p>
        </div>
      </div>
    );
  }

  return <MultiplayerGame lobbyId={lobbyId} gameState={gameState} />;
}
