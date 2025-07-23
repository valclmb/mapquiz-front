import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { LobbyScoreListPlayer } from "./LobbyScoreList";

interface ScoreListContentProps {
  players: LobbyScoreListPlayer[];
  totalCountries: number;
}

export function ScoreListContent({
  players,
  totalCountries,
}: ScoreListContentProps) {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const statusMap: Record<string, { label: string; style: string }> = {
    ready: { label: "Prêt", style: "bg-green-100 text-green-800" },
    joined: { label: "Pas prêt", style: "bg-yellow-100 text-yellow-800" },
    invited: { label: "Invité", style: "bg-blue-100 text-blue-800" },
    finished: { label: "Terminé", style: "bg-gray-200 text-gray-800" },
    playing: { label: "En jeu", style: "bg-green-100 text-green-800" },
    // autres statuts...
  };
  return (
    <div className="space-y-4">
      {sortedPlayers.length === 0 ? (
        <p className="text-muted-foreground">Aucun joueur</p>
      ) : (
        sortedPlayers.map((player, index) => {
          const validatedCount = player.validatedCountries?.length || 0;
          const incorrectCount = player.incorrectCountries?.length || 0;
          const totalAnswered = validatedCount + incorrectCount;
          const percentage =
            totalCountries > 0 ? (totalAnswered / totalCountries) * 100 : 0;
          const scoreText = `${totalAnswered}/${totalCountries}`;
          const { label, style } = statusMap[player.status] ?? {
            label: player.status,
            style: "bg-gray-100 text-gray-800",
          };
          return (
            <div key={player.id} className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">
                  {index + 1}. {player.name}
                </span>
                {player.isHost && (
                  <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                    Hôte
                  </span>
                )}
                <Badge className={` ${style}`}>{label}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={percentage} className="h-2 w-32" />
                <span className="text-sm">{scoreText}</span>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
