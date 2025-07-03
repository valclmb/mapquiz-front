import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Player } from "@/types/game";

type LobbyPlayerListProps = {
  players: Player[];
  title?: string;
  className?: string;
};

export const LobbyPlayerList = ({
  players,
  title = "Joueurs",
  className = "",
  hostId, // Ajouter le hostId comme prop
}: LobbyPlayerListProps & { hostId?: string }) => {
  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div className="space-y-2">
          {players.length === 0 ? (
            <p className="text-muted-foreground">Aucun joueur</p>
          ) : (
            players.map((player) => (
              <div
                key={player.id}
                className="flex items-center justify-between p-2 border rounded-md"
              >
                <span>{player.name}</span>
                <div className="flex items-center space-x-2">
                  {hostId && player.id === hostId && (
                    <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                      Hôte
                    </span>
                  )}
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      player.status === "ready"
                        ? "bg-green-100 text-green-800"
                        : player.status === "joined"
                          ? "bg-yellow-100 text-yellow-800"
                          : player.status === "invited"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {player.status === "ready"
                      ? "Prêt"
                      : player.status === "joined"
                        ? "Pas prêt"
                        : player.status === "invited"
                          ? "Invité"
                          : player.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
