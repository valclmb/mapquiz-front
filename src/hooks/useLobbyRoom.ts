import { DEFAULT_CONTINENT } from "@/lib/constants";
import type { Player } from "@/types/game";
import { useEffect, useState } from "react";
// Remplacer l'import de useWebSocket par useWebSocketContext
import { useWebSocketContext } from "@/context/WebSocketContext";
import { authClient } from "@/lib/auth-client";

export function useLobbyRoom(lobbyId: string) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [settings, setSettings] = useState({
    selectedRegions: [DEFAULT_CONTINENT],
    gameMode: "quiz",
  });
  const [isReady, setIsReady] = useState(false);

  // To this
  const [hostId, setHostId] = useState<string | undefined>(undefined);

  // Récupérer l'ID de l'utilisateur actuel
  const { data: session } = authClient.useSession();
  const currentUserId = session?.user?.id;

  // Utiliser le contexte WebSocket au lieu du hook useWebSocket
  const { sendMessage, lastMessage } = useWebSocketContext();

  // Gestion de la présence dans le lobby
  useEffect(() => {
    if (!currentUserId || !lobbyId) {
      console.log("useLobbyRoom - currentUserId ou lobbyId manquant:", {
        currentUserId,
        lobbyId,
      });
      return;
    }

    console.log(
      "useLobbyRoom - Initialisation de la gestion de présence pour:",
      { currentUserId, lobbyId }
    );

    // Marquer l'utilisateur comme présent dans le lobby
    const markAsPresent = () => {
      if (!currentUserId) {
        console.log(
          "useLobbyRoom - currentUserId manquant lors de markAsPresent"
        );
        return;
      }
      console.log("useLobbyRoom - Marquer comme présent");
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
          "useLobbyRoom - currentUserId manquant lors de markAsAbsent"
        );
        return;
      }
      console.log("useLobbyRoom - Marquer comme absent");
      sendMessage({
        type: "set_player_absent",
        payload: {
          lobbyId,
          absent: true,
        },
      });
    };

    // Marquer comme présent quand on entre dans le lobby
    markAsPresent();

    // Gestionnaire pour détecter quand l'utilisateur quitte la page
    const handleBeforeUnload = () => {
      markAsAbsent();
    };

    // Gestionnaire pour détecter quand l'utilisateur change de page
    const handleVisibilityChange = () => {
      if (document.hidden) {
        markAsAbsent();
      } else {
        markAsPresent();
      }
    };

    // Gestionnaire pour détecter quand l'utilisateur perd le focus de la fenêtre
    const handleBlur = () => {
      markAsAbsent();
    };

    // Gestionnaire pour détecter quand l'utilisateur reprend le focus
    const handleFocus = () => {
      markAsPresent();
    };

    // Ajouter les écouteurs d'événements
    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);

    // Cleanup des écouteurs d'événements
    return () => {
      markAsAbsent(); // Marquer comme absent lors du démontage
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
    };
  }, [currentUserId, lobbyId, sendMessage]);

  // Écouter les mises à jour du lobby
  useEffect(() => {
    // Ajouter un log pour voir tous les messages reçus
    console.log("Message reçu dans useLobbyRoom:", lastMessage);

    // Gérer le message player_left_game
    if (
      lastMessage?.type === "player_left_game" &&
      lastMessage.payload?.lobbyId === lobbyId
    ) {
      console.log(
        "Un joueur a quitté le lobby:",
        lastMessage.payload?.playerName
      );
      setPlayers((prev) =>
        prev.filter((p) => p.id !== lastMessage.payload!.playerId)
      );
      return;
    }

    if (
      lastMessage?.type === "lobby_update" &&
      lastMessage.payload?.lobbyId === lobbyId
    ) {
      console.log("LOBBY_UPDATE PAYLOAD:", lastMessage.payload);
      console.log(
        "LobbyRoom - settings reçus du backend :",
        lastMessage.payload.settings
      );
      console.log("Mise à jour du lobby détectée:", lastMessage.payload);
      // Vérifier que players existe avant de l'assigner
      if (lastMessage.payload.players) {
        console.log("Mise à jour des joueurs:", lastMessage.payload.players);
        setPlayers(lastMessage.payload.players);

        // Mettre à jour l'état isReady en fonction du statut du joueur actuel
        if (currentUserId) {
          const currentPlayer = lastMessage.payload.players.find(
            (p: Player) => p.id === currentUserId
          );
          if (currentPlayer) {
            setIsReady(currentPlayer.status === "ready");
          }
        }
      }
      // Vérifier que settings existe avant de l'assigner
      if (lastMessage.payload.settings) {
        setSettings(lastMessage.payload.settings);
      }
      // Stocker l'ID de l'hôte s'il est présent dans le message
      if (lastMessage.payload.hostId) {
        setHostId(lastMessage.payload.hostId);
      }
    }
  }, [lastMessage, lobbyId, currentUserId]);

  // Déterminer si l'utilisateur actuel est l'hôte
  const isHost = currentUserId && hostId ? currentUserId === hostId : false;

  const inviteFriend = (friendId: string) => {
    sendMessage({
      type: "invite_to_lobby",
      payload: {
        lobbyId,
        friendId,
      },
    });
  };

  const updateSettings = (newSettings: typeof settings) => {
    sendMessage({
      type: "update_lobby_settings",
      payload: {
        lobbyId,
        settings: newSettings,
      },
    });
  };

  const toggleReady = () => {
    const newReadyState = !isReady;
    setIsReady(newReadyState);
    sendMessage({
      type: "set_player_ready",
      payload: {
        lobbyId,
        ready: newReadyState,
      },
    });
  };

  const startGame = () => {
    sendMessage({
      type: "start_game",
      payload: {
        lobbyId,
      },
    });
  };

  const leaveLobby = () => {
    sendMessage({
      type: "leave_lobby",
      payload: {
        lobbyId,
      },
    });
  };

  // Vérifier que tous les joueurs sont prêts
  const allPlayersReady = players.every((p) => p.status === "ready");

  return {
    players,
    settings,
    isReady,
    isHost,
    hostId,
    allPlayersReady,
    inviteFriend,
    updateSettings,
    toggleReady,
    startGame,
    leaveLobby,
    lastMessage,
    currentUserId,
  };
}
