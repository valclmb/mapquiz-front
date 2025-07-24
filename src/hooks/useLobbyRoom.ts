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
  // SUPPRESSION : plus de hasMarkedAsPresent
  const [hostId, setHostId] = useState<string | undefined>(undefined);

  const { data: session } = authClient.useSession();
  const currentUserId = session?.user?.id;
  const { sendMessage, lastMessage } = useWebSocketContext();

  // SUPPRESSION : plus de gestion de présence/absence à l'unload

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
      if (lastMessage.payload.players) {
        setPlayers(lastMessage.payload.players);
        if (currentUserId) {
          const currentPlayer = lastMessage.payload.players.find(
            (p: Player) => p.id === currentUserId
          );
          if (currentPlayer) {
            setIsReady(currentPlayer.status === "ready");
          }
        }
      }
      if (lastMessage.payload.settings) {
        setSettings(lastMessage.payload.settings);
      }
      if (lastMessage.payload.hostId) {
        setHostId(lastMessage.payload.hostId);
      }
    }
  }, [lastMessage, lobbyId, currentUserId, sendMessage]);

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
