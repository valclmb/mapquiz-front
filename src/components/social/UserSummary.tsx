"use client";

import { Plus } from "lucide-react";

import { useWebSocketContext } from "@/context/WebSocketContext";
import { useFriendRequests } from "@/hooks/queries/useFriendRequests";
import { useFriendsList } from "@/hooks/queries/useFriends";
import { Link } from "@tanstack/react-router";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
export const UserSummary = () => {
  const { isConnected, isAuthenticated } = useWebSocketContext();

  const { data: friends = [], isLoading: isLoadingFriends } = useFriendsList();
  const { data: requests = [], isLoading: isLoadingRequests } =
    useFriendRequests();

  return (
    <Card className="h-fit">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">Social</CardTitle>
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isConnected && isAuthenticated
                  ? "bg-green-500"
                  : isConnected
                    ? "bg-yellow-500"
                    : "bg-red-500"
              }`}
              title={
                isConnected && isAuthenticated
                  ? "Connecté en temps réel"
                  : isConnected
                    ? "Connexion en cours..."
                    : "Hors ligne"
              }
            />
            <span className="text-xs text-muted-foreground">
              {isConnected && isAuthenticated
                ? "En ligne"
                : isConnected
                  ? "Connexion..."
                  : "Hors ligne"}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-lg font-medium mb-2">Amis</h3>
          {isLoadingFriends ? (
            <p>Chargement...</p>
          ) : friends.length === 0 ? (
            <div className="space-y-3">
              <p className="text-muted-foreground">
                Vous n{"'"}avez pas encore d{"'"}amis
              </p>
              <Link to="/social">
                <Button variant="outline">Ajouter des amis</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {friends.slice(0, 3).map((friend) => (
                <div
                  key={friend.id}
                  className="flex items-center gap-2 bg-secondary p-2 rounded-xl"
                >
                  <div className="relative">
                    {friend.image ? (
                      <div className="w-8 h-8 rounded-full overflow-hidden">
                        <img
                          src={friend.image}
                          alt={friend.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                        {friend.name.charAt(0)}
                      </div>
                    )}
                    <div
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                        friend.isOnline ? "bg-green-500" : "bg-gray-400"
                      }`}
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">{friend.name}</span>
                    {!friend.isOnline && (
                      <span className="text-xs text-gray-500">
                        Vu {new Date(friend.lastSeen).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {friends.length > 3 && (
                <p className="text-sm text-muted-foreground">
                  +{friends.length - 3} autres amis
                </p>
              )}
              <Link to="/social">
                <Button variant="outline" size="sm" className="mt-2 gap-1">
                  <Plus size={20} /> Ajouter des amis
                </Button>
              </Link>
            </div>
          )}
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">Demandes d{"'"}amitié</h3>
          {isLoadingRequests ? (
            <p>Chargement...</p>
          ) : (
            <div className="flex items-center gap-2 bg-secondary p-2 rounded-xl">
              <span className="font-medium">
                {requests.length} demande{requests.length !== 1 ? "s" : ""} en
                attente
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
