import type { Friend } from "@/hooks/queries/useFriends";
import { useWebSocket } from "@/hooks/useWebSocket";
import { authClient } from "@/lib/auth-client";
import { useQueryClient } from "@tanstack/react-query";
import { createContext, useContext } from "react";

interface WebSocketContextType {
  isConnected: boolean;
  isAuthenticated: boolean;
  sendFriendRequest: (receiverId: string) => void;
  respondToFriendRequest: (
    requestId: string,
    action: "accept" | "reject"
  ) => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = authClient.useSession();
  const queryClient = useQueryClient();

  const {
    isConnected,
    isAuthenticated,
    sendFriendRequest,
    respondToFriendRequest,
  } = useWebSocket({
    userId: session?.user?.id,
    onFriendRequestReceived: (request) => {
      console.log("Nouvelle demande d'ami reçue:", request);
      // Invalider les requêtes pour mettre à jour l'UI
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
    },
    onFriendStatusChange: (friendId, isOnline, lastSeen) => {
      console.log(`Ami ${friendId} ${isOnline ? "connecté" : "déconnecté"}`);

      // Mettre à jour le cache des amis
      queryClient.setQueryData(["friends"], (oldData: Friend[] | undefined) => {
        if (!oldData) return oldData;

        return oldData.map((friend: Friend) => {
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

  return (
    <WebSocketContext.Provider
      value={{
        isConnected,
        isAuthenticated,
        sendFriendRequest,
        respondToFriendRequest,
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
