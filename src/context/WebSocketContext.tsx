import type { Friend } from "@/hooks/queries/useFriends";
import { useWebSocket, type WebSocketMessage } from "@/hooks/useWebSocket";
import { authClient } from "@/lib/auth-client";
import { useQueryClient } from "@tanstack/react-query";
import { createContext, useContext } from "react";

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
  lastMessage: WebSocketMessage | null; // Ajoutez cette ligne
}

// Dans le provider, ajouter sendMessage
const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = authClient.useSession();
  const queryClient = useQueryClient();

  // Vérifier si l'utilisateur est authentifié via better-auth
  const isUserLoggedIn = !!session?.user;

  const {
    isConnected,
    isAuthenticated,
    sendFriendRequest,
    respondToFriendRequest,
    sendMessage,
    lastMessage, // Ajoutez cette ligne
  } = useWebSocket({
    // Ne passer userId que si l'utilisateur est authentifié
    userId: isUserLoggedIn ? session?.user?.id : undefined,
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
        isConnected: isConnected && isUserLoggedIn,
        isAuthenticated: isAuthenticated && isUserLoggedIn,
        sendFriendRequest,
        respondToFriendRequest,
        sendMessage,
        lastMessage, // Ajoutez cette ligne
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
