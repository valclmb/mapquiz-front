import { RegionSelector } from "@/components/game/common/RegionSelector";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLobbyRoom } from "@/hooks/useLobbyRoom";
import { LobbyFriendInvite } from "./LobbyFriendInvite";
import { LobbyPlayerList } from "./LobbyPlayerList";

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
    startGame,
    leaveLobby,
  } = useLobbyRoom(lobbyId);

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
              {allPlayersReady && players.length > 1 && (
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
          <LobbyPlayerList
            players={players}
            title="Joueurs dans le lobby"
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

                  <Button
                    onClick={startGame}
                    className="w-full bg-green-500 hover:bg-green-600"
                    disabled={!allPlayersReady || players.length < 1}
                  >
                    Démarrer la partie
                  </Button>
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

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={leaveLobby} variant="outline" className="w-full">
                Quitter le lobby
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Colonne 3: Invitation d'amis */}
        <div className="space-y-4">
          <LobbyFriendInvite
            lobbyId={lobbyId}
            currentPlayers={currentPlayerIds}
          />
        </div>
      </div>
    </div>
  );
};
