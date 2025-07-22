import { UserList } from "@/components/social/UserList";
import { useWebSocketContext } from "@/context/WebSocketContext";
import { useLobbyRoom } from "@/hooks/useLobbyRoom";
import { useEffect, useState } from "react";
import { RegionSelector } from "../game/common/RegionSelector";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";

type LobbyRoomProps = {
  lobbyId: string;
  isHost?: boolean;
};

export const LobbyRoom = ({ lobbyId }: LobbyRoomProps) => {
  const {
    players,
    settings,
    isReady,
    isHost,
    hostId,
    updateSettings,
    toggleReady,
    leaveLobby,
    lastMessage,
    allPlayersReady,
  } = useLobbyRoom(lobbyId);

  const { sendMessage } = useWebSocketContext();

  const currentPlayerIds = players.map((player) => player.id);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Arrêt du loading si on reçoit la confirmation du backend
    if (
      lastMessage?.type === "update_lobby_settings_success" &&
      lastMessage.lobbyId === lobbyId
    ) {
      setIsLoading(false);
    }
    // Arrêt du loading si on reçoit la mise à jour effective du lobby
    if (
      lastMessage?.type === "lobby_update" &&
      lastMessage.payload?.lobbyId === lobbyId
    ) {
      setIsLoading(false);
    }
  }, [lastMessage, lobbyId]);

  return (
    <div>
      <div className="w-full mx-auto space-y-6">
        {/* En-tête du lobby */}
        <div className="pt-10 pb-1">
          <h1 className="flex items-center gap-2 text-3xl font-bold mb-4">
            Lobby Multijoueur
          </h1>
          {isHost ? (
            <RegionSelector
              key={settings.selectedRegions.join(",")}
              selectedRegions={settings.selectedRegions}
              isLoading={isLoading}
              onChange={(regions) => {
                setIsLoading(true); // Active le loading dès le clic
                updateSettings({
                  ...settings,
                  selectedRegions: [...regions],
                });
              }}
            />
          ) : (
            <div className="flex flex-wrap gap-2">
              {settings.selectedRegions.map((region) => (
                <Badge
                  key={region}
                  className="text-sm px-2 py-1"
                  variant="secondary"
                >
                  {region}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Colonne 1: Liste des joueurs */}
        <div className="flex gap-2">
          <UserList
            className="w-1/3"
            title="Joueurs dans le lobby"
            customUsers={players.map((player) => ({
              id: player.id,
              name: player.name,
              image: null,
              tag: null,
              isOnline: true,
              lastSeen: "",
              status: player.status,
            }))}
            showStatus={true}
            hostId={hostId}
          />

          <UserList
            title="Inviter des amis"
            className="w-1/3"
            filterUsers={(friend) => !currentPlayerIds.includes(friend.id)}
            showInviteForOffline={true}
            onInvite={(friendId: string) => {
              // Envoyer l'invitation au lobby via WebSocket
              sendMessage({
                type: "invite_to_lobby",
                payload: {
                  lobbyId,
                  friendId,
                },
              });
            }}
          />
        </div>
        <Card className="w-max">
          <CardContent className="flex gap-2">
            <Button
              onClick={toggleReady}
              variant={isReady ? "destructive" : "default"}
            >
              {isReady ? "Annuler prêt" : "Je suis prêt"}
            </Button>

            {/* Bouton pour quitter le lobby */}
            <Button onClick={leaveLobby} variant="destructive">
              Quitter le lobby
            </Button>
          </CardContent>
        </Card>
        {allPlayersReady && (
          <div className="text-green-600 font-bold mt-4">
            Tous les joueurs sont prêts ! La partie va démarrer...
          </div>
        )}
      </div>
    </div>
  );
};
