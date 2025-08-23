import { useWebSocket, type WebSocketMessage } from "@/hooks/useWebSocket";
import { authClient } from "@/lib/auth-client";
import type { Player } from "@/types/game";
import { useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, useEffect } from "react";

// Ajouter sendMessage à l'interface avec le bon type
interface WebSocketContextType {
  isConnected: boolean;
  isAuthenticated: boolean;
  sendFriendRequest: (receiverId: string) => void;
  respondToFriendRequest: (
    requestId: string,
    action: "accept" | "reject"
  ) => void;
  sendMessage: (message: WebSocketMessage) => void;
  lastMessage: WebSocketMessage | null;
}

// Dans le provider, ajouter sendMessage
const WebSocketContext = createContext<WebSocketContextType | null>(null);

interface WebSocketProviderProps {
  children: React.ReactNode;
  onLobbyJoined?: (lobbyId: string) => void;
  onGameStart?: (lobbyId: string) => void;
}

export function WebSocketProvider({
  children,
  onLobbyJoined,
  onGameStart,
}: WebSocketProviderProps) {
  const { data: session } = authClient.useSession();
  console.log("WebSocketProvider MOUNT", session);
  const queryClient = useQueryClient();

  // Vérifier si l'utilisateur est authentifié via better-auth
  const isUserLoggedIn = !!session?.user;

  const {
    isConnected,
    isAuthenticated,
    sendFriendRequest,
    respondToFriendRequest,
    sendMessage,
    lastMessage,
    // Ajoute les callbacks à passer au hook
    setExternalCallbacks,
  } = useWebSocket({
    userId: isUserLoggedIn ? session?.user?.id : undefined,
    onFriendRequestReceived: (request) => {
      console.log("Nouvelle demande d'ami reçue:", request);
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
    },
    onFriendStatusChange: (friendId, isOnline, lastSeen) => {
      console.log(`Ami ${friendId} ${isOnline ? "connecté" : "déconnecté"}`);
      queryClient.setQueryData(["friends"], (oldData: Player[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map((friend: Player) => {
          if (friend.id === friendId) {
            return {
              ...friend,
              isOnline,
              lastSeen,
            };
          }
          return friend;
        });
      });
    },
  });

  // Passe les callbacks au hook après le mount
  useEffect(() => {
    setExternalCallbacks?.({ onLobbyJoined, onGameStart });
  }, [onLobbyJoined, onGameStart, setExternalCallbacks]);

  return (
    <WebSocketContext.Provider
      value={{
        isConnected: isConnected && isUserLoggedIn,
        isAuthenticated: isAuthenticated && isUserLoggedIn,
        sendFriendRequest,
        respondToFriendRequest,
        sendMessage,
        lastMessage,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useWebSocketContext() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error(
      "useWebSocketContext must be used within a WebSocketProvider"
    );
  }
  return context;
}
