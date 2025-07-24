import { useCallback, useEffect } from "react";
import { useWebSocketConnection } from "./websocket/useWebSocketConnection";
import { useWebSocketMessages, type WebSocketMessage } from "./websocket/useWebSocketMessages";

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
  const {
    lastMessage,
    isAuthenticated,
    setIsAuthenticated,
    handleMessage,
    setExternalCallbacks,
  } = useWebSocketMessages({
    onFriendRequestReceived,
    onFriendStatusChange,
  });

  const onMessage = useCallback((event: MessageEvent) => {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      handleMessage(message);
    } catch (error) {
      console.error("Erreur parsing message WebSocket:", error);
    }
  }, [handleMessage]);

  const onClose = useCallback(() => {
    setIsAuthenticated(false);
  }, [setIsAuthenticated]);

  const {
    isConnected,
    connect,
    disconnect,
    sendMessage: sendRawMessage,
    ping,
  } = useWebSocketConnection({
    userId,
    onMessage,
    onClose,
  });

  // Fonction d'authentification
  const authenticate = useCallback(
    (userId: string) => {
      sendRawMessage({
        type: "authenticate",
        payload: { userId },
      });
    },
    [sendRawMessage]
  );

  // Fonctions d'API WebSocket
  const sendFriendRequest = useCallback(
    (receiverId: string) => {
      sendRawMessage({
        type: "send_friend_request",
        payload: { receiverId },
      });
    },
    [sendRawMessage]
  );

  const respondToFriendRequest = useCallback(
    (requestId: string, action: "accept" | "reject") => {
      sendRawMessage({
        type: "respond_friend_request",
        payload: { requestId, action },
      });
    },
    [sendRawMessage]
  );

  const sendMessage = useCallback(
    (message: WebSocketMessage) => {
      sendRawMessage(message);
    },
    [sendRawMessage]
  );

  // Connexion automatique à l'initialisation
  useEffect(() => {
    if (userId) {
      connect();
    }
    return () => {
      disconnect();
    };
  }, [userId, connect, disconnect]);

  // Authentification automatique
  useEffect(() => {
    if (userId && isConnected && !isAuthenticated) {
      authenticate(userId);
    }
  }, [userId, isConnected, isAuthenticated, authenticate]);

  // Ping périodique pour maintenir la connexion
  useEffect(() => {
    if (isConnected) {
      const pingInterval = setInterval(() => {
        ping();
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
    setExternalCallbacks,
  };
}

// Re-export types for backward compatibility
export type { WebSocketMessage };
