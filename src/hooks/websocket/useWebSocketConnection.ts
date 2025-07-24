import { useCallback, useRef, useState } from "react";

interface UseWebSocketConnectionOptions {
  userId?: string;
  onOpen?: () => void;
  onClose?: () => void;
  onMessage?: (message: MessageEvent) => void;
  onError?: (error: Event) => void;
}

export function useWebSocketConnection({
  userId,
  onOpen,
  onClose,
  onMessage,
  onError,
}: UseWebSocketConnectionOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
  }, []);

  const connect = useCallback(() => {
    if (!userId) {
      setIsConnected(false);
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
        onOpen?.();
      };

      wsRef.current.onmessage = (event) => {
        onMessage?.(event);
      };

      wsRef.current.onclose = () => {
        setIsConnected(false);
        onClose?.();

        // Reconnexion automatique
        const maxReconnectAttempts = 5;
        if (reconnectAttempts < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
          // Tentative de reconnexion automatique

          reconnectTimeoutRef.current = setTimeout(() => {
            setReconnectAttempts((prev) => prev + 1);
            connect();
          }, delay);
        }
      };

      wsRef.current.onerror = (error) => {
        onError?.(error);
      };
    } catch (error) {
      console.error("Erreur lors de la connexion WebSocket:", error);
    }
  }, [userId, onOpen, onMessage, onClose, onError, reconnectAttempts]);

  const sendMessage = useCallback((message: object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  const ping = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "ping" }));
    }
  }, []);

  return {
    isConnected,
    connect,
    disconnect,
    sendMessage,
    ping,
    wsRef,
  };
}