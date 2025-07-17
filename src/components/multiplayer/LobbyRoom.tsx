import { RegionSelector } from "@/components/game/common/RegionSelector";
import { UserList } from "@/components/social/UserList";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWebSocketContext } from "@/context/WebSocketContext";
import { useLobbyRoom } from "@/hooks/useLobbyRoom";

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
    allPlayersReady,
    updateSettings,
    toggleReady,
    leaveLobby,
  } = useLobbyRoom(lobbyId);

  const { sendMessage } = useWebSocketContext();

  const currentPlayerIds = players.map((player) => player.id);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* En-tête du lobby */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">Lobby Multijoueur</CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                {players.length} joueur{players.length > 1 ? "s" : ""}
              </Badge>
              {allPlayersReady && players.length >= 1 && (
                <Badge variant="default" className="bg-green-500">
                  Tous prêts !
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne 1: Liste des joueurs */}
        <div className="space-y-4">
          <UserList
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

          {/* Bouton prêt pour tous les joueurs, y compris l'hôte */}
          <Button
            onClick={toggleReady}
            className={`w-full ${
              isReady
                ? "bg-red-500 hover:bg-red-600"
                : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {isReady ? "Annuler prêt" : "Je suis prêt"}
          </Button>

          {/* Bouton pour quitter le lobby */}
          <Button onClick={leaveLobby} variant="outline" className="w-full">
            Quitter le lobby
          </Button>
        </div>

        {/* Colonne 2: Paramètres et contrôles */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres du jeu</CardTitle>
            </CardHeader>
            <CardContent>
              {isHost ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Continents</label>
                    <RegionSelector
                      selectedRegions={settings.selectedRegions}
                      onChange={(regions) =>
                        updateSettings({
                          ...settings,
                          selectedRegions: regions,
                        })
                      }
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    Continents sélectionnés :
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {settings.selectedRegions.map((region) => (
                      <Badge key={region} variant="secondary">
                        {region}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Colonne 3: Invitation d'amis */}
        <div className="space-y-2">
          <UserList
            title="Inviter des amis"
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
      </div>
    </div>
  );
};
