import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Friend } from "./queries/useFriends";

interface WebSocketMessage {
  type: string;
  payload?: {
    friendId?: string;
    isOnline?: boolean;
    lastSeen?: string;
    action?: string;
    message?: string;
    request?: unknown;
    [key: string]: unknown;
  };
  message?: string;
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
  // const maxReconnectAttempts = 5;

  // Fonction pour se déconnecter (déplacée avant connect)
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

  // Ne pas établir de connexion si userId n'existe pas
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
        process.env.NODE_ENV === "production"
          ? `wss://${window.location.host}/ws`
          : "ws://localhost:3000/ws";

      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log("WebSocket connecté");
        setIsConnected(true);
        setReconnectAttempts(0);

        // Authentifier automatiquement si userId est disponible
        if (userId) {
          authenticate(userId);
        } else {
          // Si pas d'userId, fermer la connexion
          disconnect();
        }
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          handleMessage(message);
        } catch (error) {
          console.error("Erreur parsing message WebSocket:", error);
        }
      };

      wsRef.current.onclose = () => {
        console.log("WebSocket déconnecté");
        setIsConnected(false);
        setIsAuthenticated(false);

        // Tentative de reconnexion automatique
        // if (reconnectAttempts < maxReconnectAttempts) {
        //   const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
        //   console.log(`Tentative de reconnexion dans ${delay}ms...`);

        //   reconnectTimeoutRef.current = setTimeout(() => {
        //     setReconnectAttempts((prev) => prev + 1);
        //     connect();
        //   }, delay);
        // } else {
        //   console.error("Nombre maximum de tentatives de reconnexion atteint");
        //   toast.error(
        //     "Connexion WebSocket perdue. Veuillez rafraîchir la page."
        //   );
        // }
      };

      wsRef.current.onerror = (error) => {
        console.error("Erreur WebSocket détaillée:", {
          error,
          readyState: wsRef.current?.readyState,
          url: wsUrl,
        });
      };
    } catch (error) {
      console.error("Erreur lors de la connexion WebSocket:", error);
    }
  }, [userId, reconnectAttempts, disconnect]);

  // Fonction pour gérer les messages reçus
  const handleMessage = useCallback(
    (message: WebSocketMessage) => {
      switch (message.type) {
        case "authenticated":
          setIsAuthenticated(true);
          console.log("Authentifié via WebSocket");
          break;

        case "auth_error":
          console.error("Erreur d'authentification:", message.message);
          setIsAuthenticated(false);
          break;

        case "connected":
          console.log("Connexion WebSocket établie:", message.message);
          // Pas besoin de changer l'état ici, car setIsConnected(true) est déjà appelé dans onopen
          break;

        case "friend_request_received":
          console.log("Nouvelle demande d'ami reçue:", message.payload);
          toast.success("Nouvelle demande d'ami reçue!");

          // Invalider ET refetch immédiatement
          queryClient.invalidateQueries({
            queryKey: ["friendRequests"],
            refetchType: "active",
          });

          // Alternative: refetch explicite
          queryClient.refetchQueries({ queryKey: ["friendRequests"] });

          if (onFriendRequestReceived) {
            onFriendRequestReceived(message.payload?.request);
          }
          break;

        case "friend_request_sent":
          toast.success("Invitation envoyée!");
          break;

        case "send_friend_request_success":
          toast.success("Demande d'ami envoyée avec succès!");
          break;

        case "friend_request_accepted":
          toast.success("Votre demande d'ami a été acceptée!");

          // Invalider les requêtes pour mettre à jour l'UI
          queryClient.invalidateQueries({ queryKey: ["friends"] });
          queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
          break;

        case "friend_request_responded": {
          const action = message.payload?.action;
          toast.success(message.payload?.message);

          // Invalider les requêtes pour mettre à jour l'UI
          queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
          if (action === "accepted") {
            queryClient.invalidateQueries({ queryKey: ["friends"] });
          }
          break;
        }

        case "friend_status_change": {
          console.log("Changement de statut d'ami:", message.payload);

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
          // Réponse au ping, connexion active
          break;

        case "error":
          console.error("Erreur WebSocket:", message.message);
          toast.error(message.message || "Erreur WebSocket");
          break;

        default:
          console.warn("Type de message WebSocket non géré:", message.type);
      }
    },
    [queryClient, onFriendRequestReceived, onFriendStatusChange]
  );

  // Fonction pour s'authentifier
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

  // Ajouter ces fonctions à la fin du hook useWebSocket, avant le return

  // Fonction pour envoyer une demande d'ami
  const sendFriendRequest = useCallback(
    (receiverTag: string) => {
      if (wsRef.current?.readyState === WebSocket.OPEN && isAuthenticated) {
        wsRef.current.send(
          JSON.stringify({
            type: "send_friend_request",
            payload: { receiverTag },
          })
        );
      } else {
        toast.error("Connexion WebSocket non disponible");
      }
    },
    [isAuthenticated]
  );

  // Fonction pour répondre à une demande d'ami
  const respondToFriendRequest = useCallback(
    (requestId: string, action: "accept" | "reject") => {
      if (wsRef.current?.readyState === WebSocket.OPEN && isAuthenticated) {
        wsRef.current.send(
          JSON.stringify({
            type: "respond_friend_request",
            payload: { requestId, action },
          })
        );
      } else {
        toast.error("Connexion WebSocket non disponible");
      }
    },
    [isAuthenticated]
  );

  // Fonction pour envoyer un ping
  const ping = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "ping" }));
    }
  }, []);

  // Effet pour gérer la connexion
  useEffect(() => {
    if (userId) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [userId, connect, disconnect]);

  // Effet pour authentifier quand userId change
  useEffect(() => {
    if (userId && isConnected && !isAuthenticated) {
      authenticate(userId);
    }
  }, [userId, isConnected, isAuthenticated, authenticate]);

  // Ping périodique pour maintenir la connexion
  useEffect(() => {
    if (isConnected) {
      const pingInterval = setInterval(ping, 30000); // Ping toutes les 30 secondes
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
  };
}
