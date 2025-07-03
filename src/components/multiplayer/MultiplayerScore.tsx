import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { PlayerScore } from "@/types/game";

type MultiplayerScoreProps = {
  playerScores: PlayerScore[];
  totalCountries: number;
};

export const MultiplayerScore = ({
  playerScores,
  totalCountries,
}: MultiplayerScoreProps) => {
  // Trier les joueurs par score (décroissant)
  const sortedPlayers = [...playerScores].sort((a, b) => b.score - a.score);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scores en temps réel</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedPlayers.map((player, index) => {
            const percentage = Math.round((player.progress || 0) * 100) / 100;
            const scoreText = `${player.score || 0}/${totalCountries}`;

            return (
              <div key={player.id} className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-medium">
                    {index + 1}. {player.name}
                  </span>
                  <span className="text-sm">{scoreText}</span>
                </div>
                <Progress value={percentage} className="h-2" />
                {player.status === "finished" && (
                  <span className="text-xs text-green-600">Terminé !</span>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
