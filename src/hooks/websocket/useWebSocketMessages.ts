import type { Friend } from "@/hooks/queries/useFriends";
import type { LobbySettings, Player } from "@/types/game";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

export interface WebSocketMessage {
  type: string;
  payload?: {
    friendId?: string;
    isOnline?: boolean;
    lastSeen?: string;
    action?: string;
    message?: string;
    request?: unknown;
    lobbyId?: string;
    players?: Player[];
    settings?: LobbySettings;
    hostId?: string;
    [key: string]: unknown;
  };
  message?: string;
  lobbyId?: string;
  data?: {
    lobby?: {
      id: string;
      [key: string]: unknown;
    };
    players?: Player[];
    settings?: LobbySettings;
    [key: string]: unknown;
  };
}

interface UseWebSocketMessagesOptions {
  onFriendRequestReceived?: (request: unknown) => void;
  onFriendStatusChange?: (
    friendId: string,
    isOnline: boolean,
    lastSeen: string
  ) => void;
}

export function useWebSocketMessages({
  onFriendRequestReceived,
  onFriendStatusChange,
}: UseWebSocketMessagesOptions) {
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const queryClient = useQueryClient();

  // Stocke les callbacks externes (navigation, etc.)
  const externalCallbacksRef = useRef<{
    onLobbyJoined?: (lobbyId: string) => void;
    onGameStart?: (lobbyId: string) => void;
  }>({});

  const setExternalCallbacks = useCallback(
    (callbacks: {
      onLobbyJoined?: (lobbyId: string) => void;
      onGameStart?: (lobbyId: string) => void;
    }) => {
      externalCallbacksRef.current = callbacks;
    },
    []
  );

  const handleMessage = useCallback(
    (message: WebSocketMessage) => {
      setLastMessage(message);
      
      switch (message.type) {
        case "authenticated":
          setIsAuthenticated(true);
          break;

        case "auth_error":
          console.error("Erreur d'authentification:", message.message);
          setIsAuthenticated(false);
          break;

        case "connected":
          // WebSocket connection established - no state change needed as it's already handled in onopen
          break;

        case "friend_request_received":
          toast.success("Nouvelle demande d'ami reçue!");
          queryClient.invalidateQueries({
            queryKey: ["friendRequests"],
            refetchType: "active",
          });
          if (message.payload?.request) {
            onFriendRequestReceived?.(message.payload.request);
          }
          break;

        case "friend_request_response": {
          const action = message.payload?.action;
          if (action === "accepted") {
            toast.success("Demande d'ami acceptée!");
          } else if (action === "rejected") {
            toast.info("Demande d'ami refusée");
          }

          if (action === "accepted") {
            queryClient.invalidateQueries({ queryKey: ["friends"] });
          }
          break;
        }

        case "friend_status_change": {
          // Mettre à jour le cache des amis
          queryClient.setQueryData(
            ["friends"],
            (oldData: Friend[] | undefined) => {
              if (!oldData) return oldData;

              return oldData.map((friend: Friend) => {
                if (friend.id === message.payload?.friendId) {
                  return {
                    ...friend,
                    isOnline: message.payload?.isOnline,
                    lastSeen: message.payload?.lastSeen,
                  };
                }
                return friend;
              });
            }
          );

          if (
            message.payload?.friendId &&
            message.payload?.isOnline !== undefined &&
            message.payload?.lastSeen
          ) {
            onFriendStatusChange?.(
              message.payload.friendId,
              message.payload.isOnline,
              message.payload.lastSeen
            );
          }
          break;
        }

        case "error":
          console.error("Erreur WebSocket:", message.message);
          toast.error(message.message || "Erreur WebSocket");
          break;

        case "create_lobby_success":
          toast.success("Lobby créé avec succès!");

          // Transformer ce message en un message de type "lobby_update"
          // pour que le hook useLobbyRoom puisse le traiter
          if (message.data?.lobby?.id) {
            setLastMessage({
              type: "lobby_update",
              payload: {
                lobbyId: message.data.lobby.id,
                players: message.data.players,
                settings: message.data.settings,
                hostId: message.data.hostId as string,
              },
            });

            // Utilise le callback externe pour la navigation
            externalCallbacksRef.current.onLobbyJoined?.(message.data.lobby.id);
          }
          break;

        case "lobby_invitation":
          toast(
            `Vous avez été invité à rejoindre le lobby "${message.payload?.lobbyName}" par ${message.payload?.hostName}`,
            {
              action: {
                label: "Rejoindre",
                onClick: () => {
                  if (message.payload?.lobbyId) {
                    // Envoyer un message pour rejoindre le lobby
                    // Note: sendMessage should be passed from parent
                  }
                },
              },
            }
          );
          break;

        case "join_lobby_success":
          toast.success("Lobby rejoint avec succès!");
          if (message.data?.lobby?.id) {
            externalCallbacksRef.current.onLobbyJoined?.(message.data.lobby.id);
          }
          break;

        case "lobby_update":
          // Ce message est traité par useLobbyRoom
          queryClient.invalidateQueries({ queryKey: ["lobby"] });
          break;

        case "leave_lobby_success":
          toast.success("Vous avez quitté le lobby");
          externalCallbacksRef.current.onLobbyJoined?.("");
          break;

        case "game_start": {
          // Si le message contient l'état du jeu, le traiter directement
          if (message.data?.gameState) {
            setLastMessage({
              type: "game_state_update",
              payload: {
                lobbyId: message.data.lobbyId as string,
                gameState: message.data.gameState,
              },
            });
          }

          // Rediriger vers la page du jeu
          if (message.data?.lobbyId) {
            externalCallbacksRef.current.onGameStart?.(message.data.lobbyId);
          }
          break;
        }

        case "score_update":
          // Transformer ce message en un message de type "player_progress_update"
          if (message.data) {
            setLastMessage({
              type: "player_progress_update",
              payload: {
                lobbyId: message.data.lobbyId as string,
                players: message.data.players,
                updatedPlayerId: message.data.updatedPlayerId,
              },
            });
          }
          break;

        case "update_game_progress_success":
          // Ce message est juste une confirmation, pas besoin de traitement spécial
          break;

        case "update_lobby_settings_success":
          // toast.success("Paramètres du lobby mis à jour !");
          break;

        case "player_left_game":
          toast.info(
            `${message.payload?.playerName || "Un joueur"} a quitté la partie`
          );

          // Transformer ce message en un message de type "lobby_update" pour mettre à jour l'UI
          if (message.payload?.lobbyId) {
            setLastMessage({
              type: "lobby_update",
              payload: {
                lobbyId: message.payload.lobbyId,
                playerLeft: true,
                leftPlayerId: message.payload.playerId,
                leftPlayerName: message.payload.playerName,
              },
            });
          }
          break;

        default:
          break;
      }
    },
    [queryClient, onFriendRequestReceived, onFriendStatusChange]
  );

  return {
    lastMessage,
    isAuthenticated,
    setIsAuthenticated,
    handleMessage,
    setExternalCallbacks,
  };
}