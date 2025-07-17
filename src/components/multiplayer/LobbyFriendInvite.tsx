import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWebSocketContext } from "@/context/WebSocketContext";
import { useFriendsList, type Friend } from "@/hooks/queries/useFriends";
import { Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface LobbyFriendInviteProps {
  lobbyId: string;
  currentPlayers: string[]; // IDs des joueurs déjà dans le lobby
}

export const LobbyFriendInvite = ({
  lobbyId,
  currentPlayers,
}: LobbyFriendInviteProps) => {
  const { data: friends } = useFriendsList();
  const { sendMessage } = useWebSocketContext();
  const [cooldownFriends, setCooldownFriends] = useState<Set<string>>(
    new Set()
  );

  const handleInviteFriend = (friendId: string) => {
    sendMessage({
      type: "invite_to_lobby",
      payload: {
        lobbyId,
        friendId,
      },
    });

    // Ajouter l'ami au cooldown
    setCooldownFriends((prev) => new Set(prev).add(friendId));
    toast.success("Invitation envoyée !");

    // Retirer du cooldown après 5 secondes
    setTimeout(() => {
      setCooldownFriends((prev) => {
        const newSet = new Set(prev);
        newSet.delete(friendId);
        return newSet;
      });
    }, 5000);
  };

  const isAlreadyInLobby = (friendId: string) =>
    currentPlayers.includes(friendId);
  const isInCooldown = (friendId: string) => cooldownFriends.has(friendId);

  if (!friends || friends.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Inviter des amis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Vous n'avez pas encore d'amis à inviter.
          </p>
        </CardContent>
      </Card>
    );
  }

  const availableFriends = friends.filter(
    (friend: Friend) => !isAlreadyInLobby(friend.id)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Inviter des amis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {availableFriends.map((friend: Friend) => (
            <div
              key={friend.id}
              className="flex items-center justify-between p-2 border rounded-lg"
            >
              <div className="flex items-center space-x-2">
                <span className="font-medium">{friend.name}</span>
                <Badge variant="secondary">{friend.tag}</Badge>
                {friend.isOnline && (
                  <Badge variant="default" className="bg-green-500">
                    En ligne
                  </Badge>
                )}
              </div>
              {isInCooldown(friend.id) ? (
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-green-500">Envoyée</span>
                </div>
              ) : (
                <Button
                  size="sm"
                  onClick={() => handleInviteFriend(friend.id)}
                  disabled={isInCooldown(friend.id)}
                >
                  Inviter
                </Button>
              )}
            </div>
          ))}

          {availableFriends.length === 0 && (
            <p className="text-muted-foreground text-center py-4">
              Tous vos amis sont déjà dans ce lobby.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
