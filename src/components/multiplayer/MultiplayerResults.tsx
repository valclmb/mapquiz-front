import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Ranking } from "@/types/game";
import { Link } from "@tanstack/react-router";

type MultiplayerResultsProps = {
  rankings: Ranking[];
  onRestart: () => void;
};

export const MultiplayerResults = ({
  rankings,
  onRestart,
}: MultiplayerResultsProps) => {
  // Trier par rang
  const sortedRankings = [...rankings].sort((a, b) => a.rank - b.rank);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Résultats de la partie</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-4">
              {sortedRankings.map((player) => {
                const minutes = Math.floor(player.completionTime / 60);
                const seconds = player.completionTime % 60;
                const timeText = `${minutes}m ${seconds}s`;

                return (
                  <div
                    key={player.id}
                    className={`p-4 rounded-lg ${player.rank === 1 ? "bg-yellow-100" : "bg-gray-100"}`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xl">{player.rank}</span>
                        <span className="font-medium">{player.name}</span>
                      </div>
                      <span>{player.score} points</span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Temps: {timeText}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col space-y-2">
              <Button onClick={onRestart} className="w-full">
                Rejouer
              </Button>
              <Link to="/">
                <Button variant="outline" className="w-full">
                  Retour à l'accueil
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
