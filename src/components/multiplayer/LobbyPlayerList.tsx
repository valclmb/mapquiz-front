import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Player } from "@/types/game";

type LobbyPlayerListProps = {
  players: Player[];
  title?: string;
  className?: string;
  hostId?: string;
};

export const LobbyPlayerList = ({
  players,
  title = "Joueurs",
  className = "",
  hostId,
}: LobbyPlayerListProps) => {
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
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                      {player.name.charAt(0)}
                    </div>
                    <div
                      className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white bg-green-500"
                      title="En ligne"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">{player.name}</span>
                  </div>
                </div>
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
