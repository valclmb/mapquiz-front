import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWebSocketContext } from "@/context/WebSocketContext";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface LobbyInvitation {
  lobbyId: string;
  hostId: string;
  hostName: string;
  lobbyName: string;
}

export const LobbyInvitation = () => {
  const [invitations, setInvitations] = useState<LobbyInvitation[]>([]);
  const { lastMessage } = useWebSocketContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (lastMessage?.type === "lobby_invitation") {
      const payload = lastMessage.payload as Record<string, unknown>;
      const invitation: LobbyInvitation = {
        lobbyId: payload.lobbyId as string,
        hostId: payload.hostId as string,
        hostName: payload.hostName as string,
        lobbyName: payload.lobbyName as string,
      };
      setInvitations((prev) => [...prev, invitation]);

      // Afficher une notification toast
      toast.info(
        `${invitation.hostName} vous invite à rejoindre "${invitation.lobbyName}"`,
        {
          action: {
            label: "Rejoindre",
            onClick: () => handleJoinLobby(invitation.lobbyId),
          },
          duration: 10000, // 10 secondes
        }
      );
    }
  }, [lastMessage]);

  const handleJoinLobby = (lobbyId: string) => {
    // Supprimer l'invitation de la liste
    setInvitations((prev) => prev.filter((inv) => inv.lobbyId !== lobbyId));

    // Naviguer vers le lobby
    navigate({ to: "/multiplayer/$lobbyId", params: { lobbyId } });
  };

  const handleDeclineInvitation = (lobbyId: string) => {
    setInvitations((prev) => prev.filter((inv) => inv.lobbyId !== lobbyId));
  };

  if (invitations.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {invitations.map((invitation) => (
        <Card key={invitation.lobbyId} className="w-80 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Invitation de lobby</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium">{invitation.lobbyName}</p>
              <p className="text-xs text-muted-foreground">
                Invité par {invitation.hostName}
              </p>
            </div>
            <div className="flex space-x-2">
              <Button
                size="sm"
                onClick={() => handleJoinLobby(invitation.lobbyId)}
                className="flex-1"
              >
                Rejoindre
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDeclineInvitation(invitation.lobbyId)}
              >
                Décliner
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
