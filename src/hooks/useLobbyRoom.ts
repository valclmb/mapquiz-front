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

  // Envoyer une requête pour rejoindre le lobby lors du montage du composant
  // Cela permettra de récupérer les données du lobby même après un rafraîchissement
  useEffect(() => {
    if (lobbyId) {
      sendMessage({
        type: "join_lobby",
        payload: {
          lobbyId,
        },
      });
    }
  }, [lobbyId, sendMessage]);

  // Écouter les mises à jour du lobby
  useEffect(() => {
    // Ajouter un log pour voir tous les messages reçus
    console.log("Message reçu dans useLobbyRoom:", lastMessage);

    if (
      lastMessage?.type === "lobby_update" &&
      lastMessage.payload?.lobbyId === lobbyId
    ) {
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
  };
}
