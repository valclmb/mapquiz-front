"use client";

import { useWebSocketContext } from "@/context/WebSocketContext";
import { useFriendRequests } from "@/hooks/queries/useFriendRequests";
import { useFriendsList } from "@/hooks/queries/useFriends";
import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Avatar } from "./Avatar";
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
                <Button variant="outline">
                  <Plus /> Ajouter des amis
                </Button>
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
                    <Avatar user={friend} />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">{friend.name}</span>
                  </div>
                </div>
              ))}
              {friends.length > 3 && (
                <p className="text-sm text-muted-foreground">
                  +{friends.length - 3} autres amis
                </p>
              )}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">Demandes d{"'"}amitié</h3>
          {isLoadingRequests ? (
            <p>Chargement...</p>
          ) : (
            <div className="flex items-center gap-2 bg-secondary p-2 rounded-xl">
              <Link
                to="/social"
                className="font-medium  hover:text-primary transition-colors"
              >
                {requests.length} demande{requests.length !== 1 ? "s" : ""} en
                attente
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
