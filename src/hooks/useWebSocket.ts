import type { Player } from "@/types/game";
import type { LobbySettings } from "@/types/lobby";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Friend } from "./queries/useFriends";

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

interface UseWebSocketOptions {
  userId?: string;
  onFriendRequestReceived?: (request: unknown) => void;
  onFriendStatusChange?: (
    friendId: string,
    isOnline: boolean,
    lastSeen: string
  ) => void;
}

export function useWebSocket({
  userId,
  onFriendRequestReceived,
  onFriendStatusChange,
}: UseWebSocketOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const queryClient = useQueryClient();
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);

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

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
    setIsAuthenticated(false);
  }, []);

  const connect = useCallback(() => {
    if (!userId) {
      setIsConnected(false);
      setIsAuthenticated(false);
      return;
    }
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }
    try {
      const wsUrl =
        import.meta.env.VITE_WS_URL ||
        (process.env.NODE_ENV === "production"
          ? `wss://${window.location.host}/ws`
          : "ws://localhost:3000/ws");
      wsRef.current = new WebSocket(wsUrl);
      wsRef.current.onopen = () => {
        setIsConnected(true);
        setReconnectAttempts(0);
        if (userId) {
          authenticate(userId);
        } else {
          disconnect();
        }
      };
      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          handleMessage(message);
        } catch {
          // Erreur de parsing ignorée volontairement
        }
      };
      wsRef.current.onclose = () => {
        setIsConnected(false);
        setIsAuthenticated(false);
        const maxReconnectAttempts = 5;
        if (reconnectAttempts < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
          reconnectTimeoutRef.current = setTimeout(() => {
            setReconnectAttempts((prev) => prev + 1);
            connect();
          }, delay);
        } else {
          toast.error(
            "Connexion WebSocket perdue. Veuillez rafraîchir la page."
          );
        }
      };
      wsRef.current.onerror = () => {
        setIsConnected(false);
      };
    } catch {
      toast.error("Erreur lors de la connexion WebSocket");
    }
  }, [userId, reconnectAttempts, disconnect]);

  const handleMessage = useCallback(
    (message: WebSocketMessage) => {
      setLastMessage(message);
      switch (message.type) {
        case "authenticated":
          setIsAuthenticated(true);
          break;
        case "auth_error":
          setIsAuthenticated(false);
          break;
        case "friend_request_received":
          toast("Nouvelle demande d'ami reçue !", {
            action: {
              label: "Voir",
              onClick: () => {},
            },
          });
          queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
          break;
        case "friend_request_sent":
          toast.success("Invitation envoyée!");
          break;
        case "send_friend_request_success":
          toast.success("Demande d'ami envoyée avec succès!");
          break;
        case "friend_request_accepted":
          toast.success("Votre demande d'ami a été acceptée!");
          queryClient.invalidateQueries({ queryKey: ["friends"] });
          queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
          break;
        case "friend_request_responded": {
          const action = message.payload?.action;
          toast.success(message.payload?.message);
          queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
          if (action === "accepted") {
            queryClient.invalidateQueries({ queryKey: ["friends"] });
          }
          break;
        }
        case "friend_status_change": {
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
            onFriendStatusChange &&
            message.payload?.friendId &&
            message.payload?.isOnline !== undefined &&
            message.payload?.lastSeen
          ) {
            onFriendStatusChange(
              message.payload.friendId,
              message.payload.isOnline,
              message.payload.lastSeen
            );
          }
          break;
        }
        case "pong":
          break;
        case "error":
          toast.error(message.message || "Erreur WebSocket");
          break;
        case "create_lobby_success":
          toast.success("Lobby créé avec succès!");
          if (message.data?.lobby?.id) {
            setLastMessage({
              type: "lobby_update",
              payload: {
                lobbyId: message.data.lobby.id,
                players: message.data.players,
                settings: message.data.settings,
                hostId: message.data.hostId as string,
                status: message.data.lobby.status,
              },
            });
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
                    sendMessage({
                      type: "join_lobby",
                      payload: {
                        lobbyId: message.payload.lobbyId,
                      },
                    });
                    externalCallbacksRef.current.onLobbyJoined?.(
                      message.payload.lobbyId
                    );
                  }
                },
              },
            }
          );
          break;
        case "invite_to_lobby_success":
          if (message.payload?.lobbyId && message.payload?.players) {
            setLastMessage({
              type: "lobby_update",
              payload: {
                lobbyId: message.payload.lobbyId,
                players: message.payload.players,
                settings: message.payload.settings,
                hostId: message.payload.hostId as string,
              },
            });
            toast.success("Invitation envoyée avec succès");
          }
          break;
        case "join_lobby_success":
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
            toast.success("Lobby rejoint avec succès");
            externalCallbacksRef.current.onLobbyJoined?.(message.data.lobby.id);
          }
          break;
        case "lobby_update":
          setLastMessage(message);
          break;
        case "set_player_ready_success":
          toast.success(String(message.data?.message || "Statut mis à jour"));
          break;
        case "start_game_success":
          toast.success("Partie démarrée avec succès!");
          break;
        case "leave_game_success":
          toast.success("Vous avez quitté la partie");
          externalCallbacksRef.current.onLobbyJoined?.("");
          break;
        case "leave_lobby_success":
          toast.success("Vous avez quitté le lobby");
          externalCallbacksRef.current.onLobbyJoined?.("");
          break;
        case "remove_player_success":
          toast.success("Joueur supprimé avec succès");
          break;
        case "player_removed":
          toast.error("Vous avez été expulsé du lobby par l'hôte");
          externalCallbacksRef.current.onLobbyJoined?.("");
          break;
        case "get_disconnected_players_success":
          break;
        case "game_start": {
          if (message.data?.gameState) {
            setLastMessage({
              type: "game_state_update",
              payload: {
                lobbyId: message.data.lobbyId as string,
                gameState: message.data.gameState,
              },
            });
          }
          if (
            message.data?.lobbyId &&
            typeof message.data.lobbyId === "string"
          ) {
            externalCallbacksRef.current.onGameStart?.(message.data.lobbyId);
          }
          break;
        }
        case "get_game_state_success":
          if (message.data) {
            setLastMessage({
              type: "game_state_update",
              payload: {
                lobbyId: message.data.lobbyId as string,
                gameState: message.data.gameState,
              },
            });
          }
          break;
        case "score_update":
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
        case "game_restarted": {
          const lobbyId = message.payload?.lobbyId;
          if (lobbyId && typeof lobbyId === "string") {
            externalCallbacksRef.current.onLobbyJoined?.(lobbyId);
          }
          break;
        }
        case "player_left_game":
          toast.info(
            `${message.payload?.playerName || "Un joueur"} a quitté la partie`
          );
          // Ne plus transformer en lobby_update pour éviter les conflits
          setLastMessage(message);
          break;
        case "game_end":
          setLastMessage(message);
          break;
        default:
          break;
      }
    },
    [queryClient, onFriendRequestReceived, onFriendStatusChange]
  );

  const authenticate = useCallback((userId: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "authenticate",
          payload: { userId },
        })
      );
    }
  }, []);

  const sendFriendRequest = useCallback(
    (receiverTag: string) => {
      if (wsRef.current?.readyState === WebSocket.OPEN && isAuthenticated) {
        wsRef.current.send(
          JSON.stringify({
            type: "send_friend_request",
            payload: { receiverTag },
          })
        );
      }
    },
    [isAuthenticated]
  );

  const respondToFriendRequest = useCallback(
    (requestId: string, action: "accept" | "reject") => {
      if (wsRef.current?.readyState === WebSocket.OPEN && isAuthenticated) {
        wsRef.current.send(
          JSON.stringify({
            type: "respond_friend_request",
            payload: { requestId, action },
          })
        );
      }
    },
    [isAuthenticated]
  );

  const sendMessage = useCallback(
    (message: WebSocketMessage) => {
      if (wsRef.current?.readyState === WebSocket.OPEN && isAuthenticated) {
        wsRef.current.send(JSON.stringify(message));
      }
    },
    [isAuthenticated]
  );

  const ping = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "ping" }));
    }
  }, []);

  const clearLastMessage = useCallback(() => setLastMessage(null), []);

  useEffect(() => {
    if (userId) {
      connect();
    }
    return () => {
      disconnect();
    };
  }, [userId, connect, disconnect]);

  useEffect(() => {
    if (userId && isConnected && !isAuthenticated) {
      authenticate(userId);
    }
  }, [userId, isConnected, isAuthenticated, authenticate]);

  useEffect(() => {
    if (!isConnected) {
      setIsAuthenticated(false);
    }
  }, [isConnected]);

  useEffect(() => {
    if (isConnected) {
      const pingInterval = setInterval(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          ping();
        }
      }, 15000);
      return () => clearInterval(pingInterval);
    }
  }, [isConnected, ping]);

  return {
    isConnected,
    isAuthenticated,
    sendFriendRequest,
    respondToFriendRequest,
    disconnect,
    reconnect: connect,
    sendMessage,
    lastMessage,
    clearLastMessage,
    setExternalCallbacks,
  };
}
