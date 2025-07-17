import { MultiplayerGame } from "@/components/multiplayer/MultiplayerGame";
import { useWebSocketContext } from "@/context/WebSocketContext";
import type { Country } from "@/hooks/useMapGame";
import type { WebSocketMessage } from "@/hooks/useWebSocket";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/multiplayer/game/$lobbyId")({
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

  // Debug: afficher l'état actuel
  console.log("MultiplayerGamePage - État actuel:", {
    lobbyId,
    gameState: !!gameState,
    loading,
    error,
    isConnected,
    lastMessageType: lastMessage?.type,
  });

  // 1. Attendre la connexion WebSocket et demander l'état du jeu
  useEffect(() => {
    if (isConnected && !gameState) {
      console.log(
        "Connexion WebSocket établie, demande de l'état du jeu pour le lobby:",
        lobbyId
      );
      sendMessage({
        type: "get_game_state",
        payload: { lobbyId },
      });
      setLoading(false);
    }
  }, [isConnected, gameState, lobbyId, sendMessage]);

  // Fonctions pour gérer les différents types de messages
  const handleGameStateMessage = (message: WebSocketMessage) => {
    if (message.payload?.gameState) {
      setGameState(message.payload.gameState as GameState);
      setError(null);
    } else {
      setError("Aucun état de jeu disponible");
    }
  };

  const handleGameStateUpdateMessage = (message: WebSocketMessage) => {
    console.log("handleGameStateUpdateMessage - message complet:", message);
    console.log("handleGameStateUpdateMessage - payload:", message.payload);

    const state = message.payload?.gameState;
    console.log("handleGameStateUpdateMessage - state extrait:", state);

    // Vérifier si gameState est directement dans le payload avec countries
    if (
      state &&
      typeof state === "object" &&
      "countries" in state &&
      (state as { countries?: unknown }).countries
    ) {
      console.log(
        "handleGameStateUpdateMessage - gameState direct trouvé:",
        state
      );
      setGameState(state as GameState);
      setError(null);
      return;
    }

    // Vérifier si gameState est imbriqué (structure du backend)
    if (
      state &&
      typeof state === "object" &&
      "gameState" in state &&
      (state as { gameState?: { countries?: unknown } }).gameState?.countries
    ) {
      const nestedState = (state as { gameState?: GameState }).gameState;
      console.log(
        "handleGameStateUpdateMessage - gameState imbriqué trouvé:",
        nestedState
      );
      setGameState(nestedState as GameState);
      setError(null);
      return;
    }

    // Vérifier si nous avons la structure complète du backend
    if (state && typeof state === "object" && "gameState" in state) {
      const nestedGameState = (state as { gameState?: GameState }).gameState;
      if (
        nestedGameState &&
        "countries" in nestedGameState &&
        nestedGameState.countries
      ) {
        console.log(
          "handleGameStateUpdateMessage - structure backend trouvée:",
          nestedGameState
        );
        setGameState(nestedGameState as GameState);
        setError(null);
        return;
      }
    }

    console.log("handleGameStateUpdateMessage - Aucun gameState valide trouvé");
    console.log(
      "handleGameStateUpdateMessage - Structure reçue:",
      JSON.stringify(state, null, 2)
    );
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

    // Si c'est une erreur de jeu non trouvé, juste continuer à charger
    if (errorMessage.includes("Aucun état de jeu disponible")) {
      console.log("Aucun état de jeu disponible, continuer à charger...");
      setLoading(true);
      return;
    }

    setError(errorMessage);
  };

  // 2. Gérer les réponses du backend
  useEffect(() => {
    // Ajouter des logs de débogage détaillés
    console.log("MultiplayerGamePage - Message reçu:", {
      type: lastMessage?.type,
      payload: lastMessage?.payload,
      data: lastMessage?.data,
      lobbyId:
        lastMessage?.lobbyId ||
        lastMessage?.payload?.lobbyId ||
        lastMessage?.data?.lobbyId,
      expectedLobbyId: lobbyId,
      match:
        (lastMessage?.lobbyId ||
          lastMessage?.payload?.lobbyId ||
          lastMessage?.data?.lobbyId) === lobbyId,
    });

    // Traiter tous les messages de type game_state_update, même si le lobbyId ne correspond pas exactement
    if (lastMessage?.type === "game_state_update") {
      console.log("Traitement du message game_state_update");
      handleGameStateUpdateMessage(lastMessage);
      return;
    }

    // Traiter les messages de mise à jour de score (ils viennent dans le data field)
    if (lastMessage?.type === "score_update") {
      console.log("Traitement du message score_update");
      // Ces messages sont gérés par le hook useMultiplayerGame
      return;
    }

    // Pour les autres types de messages, vérifier le lobbyId (vérifier à la fois le root, payload et data)
    const messageLobbyId =
      lastMessage?.lobbyId ||
      lastMessage?.payload?.lobbyId ||
      lastMessage?.data?.lobbyId;
    if (!lastMessage || messageLobbyId !== lobbyId) {
      console.log("Message ignoré - lobbyId ne correspond pas ou message null");
      return;
    }

    console.log(
      "Traitement du message:",
      lastMessage.type,
      "pour le lobby:",
      lobbyId
    );

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

  // 3. Gérer les erreurs de connexion
  useEffect(() => {
    if (!isConnected && !loading && !gameState) {
      console.log("Connexion WebSocket perdue, affichage de l'erreur");
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
