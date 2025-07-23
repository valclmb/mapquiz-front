import { MultiplayerGame } from "@/components/multiplayer/MultiplayerGame";
import { useWebSocketContext } from "@/context/WebSocketContext";
import type { Country } from "@/hooks/useMapGame";
import type { WebSocketMessage } from "@/hooks/useWebSocket";
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
    status: string;
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

  useEffect(() => {
    if (isConnected && !gameState) {
      sendMessage({
        type: "get_game_state",
        payload: { lobbyId },
      });
      setLoading(false);
    }
  }, [isConnected, gameState, lobbyId, sendMessage]);

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
