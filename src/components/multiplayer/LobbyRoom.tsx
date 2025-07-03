import { RegionSelector } from "@/components/game/common/RegionSelector";
import { UserList } from "@/components/social";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLobbyRoom } from "@/hooks/useLobbyRoom";
import { LobbyPlayerList } from "./LobbyPlayerList";

type LobbyRoomProps = {
  lobbyId: string;
  isHost?: boolean; // Rendre cette prop optionnelle car nous utiliserons celle du hook
};

export const LobbyRoom = ({ lobbyId }: LobbyRoomProps) => {
  const {
    players,
    settings,
    isReady,
    isHost,
    hostId, // Récupérer hostId du hook
    allPlayersReady,
    inviteFriend,
    updateSettings,
    toggleReady,
    startGame,
    leaveLobby,
  } = useLobbyRoom(lobbyId);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Lobby</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <LobbyPlayerList
              players={players}
              title="Joueurs dans le lobby"
              hostId={hostId} // Passer hostId au composant LobbyPlayerList
            />
            <UserList onInvite={inviteFriend} />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Paramètres du jeu</h3>
            {isHost ? (
              <div className="space-y-2">
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
            ) : (
              <div className="space-y-2">
                <p>Continents sélectionnés :</p>
                <div className="flex flex-wrap gap-2">
                  {settings.selectedRegions.map((region) => (
                    <span
                      key={region}
                      className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                    >
                      {region}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col space-y-2 mt-4">
              {isHost ? (
                <Button
                  onClick={startGame}
                  disabled={!allPlayersReady || players.length < 2}
                  className="w-full"
                >
                  Démarrer la partie
                </Button>
              ) : (
                <Button
                  onClick={toggleReady}
                  className={`w-full ${
                    isReady ? "bg-red-500 hover:bg-red-600" : ""
                  }`}
                >
                  {isReady ? "Annuler prêt" : "Je suis prêt"}
                </Button>
              )}
              <Button onClick={leaveLobby} variant="outline" className="w-full">
                Quitter le lobby
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
