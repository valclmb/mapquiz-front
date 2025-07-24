import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Ranking } from "@/types/game";
import { useNavigate } from "@tanstack/react-router";
import { Award, Medal, Trophy } from "lucide-react";

interface MultiplayerResultsProps {
  rankings: Ranking[];
  onRestart: () => void;
}

export const MultiplayerResults = ({
  rankings,
  onRestart,
}: MultiplayerResultsProps) => {
  const navigate = useNavigate();


  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return (
          <span className="w-6 h-6 text-center text-sm font-bold">{rank}</span>
        );
    }
  };

  const getRankBadgeVariant = (rank: number) => {
    switch (rank) {
      case 1:
        return "default" as const;
      case 2:
        return "secondary" as const;
      case 3:
        return "outline" as const;
      default:
        return "outline" as const;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br ">
      <Card className="w-full max-w-2xl mx-4">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-gray-800">
            Résultats de la partie
          </CardTitle>
          <p className="text-gray-600 mt-2">Classement final des joueurs</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Classement */}
          <div className="space-y-3">
            {rankings.map((player, index) => (
              <div
                key={player.id}
                className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                  index === 0
                    ? "border-yellow-400 bg-yellow-50"
                    : index === 1
                      ? "border-gray-300 bg-gray-50"
                      : index === 2
                        ? "border-amber-600 bg-amber-50"
                        : "border-gray-200 bg-white"
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-8 h-8">
                    {getRankIcon(player.rank)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{player.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant={getRankBadgeVariant(player.rank)}>
                        {player.rank === 1
                          ? "1er"
                          : player.rank === 2
                            ? "2ème"
                            : player.rank === 3
                              ? "3ème"
                              : `${player.rank}ème`}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {player.score} points
                      </span>
                      {player.completionTime && (
                        <span className="text-sm text-gray-600">
                          en {Math.floor(player.completionTime / 60)}:
                          {(player.completionTime % 60)
                            .toString()
                            .padStart(2, "0")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={onRestart}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Rejouer
            </Button>
            <Button
              onClick={() => navigate({ to: "/multiplayer" })}
              variant="outline"
              className="flex-1"
            >
              Nouveau lobby
            </Button>
            <Button
              onClick={() => navigate({ to: "/" })}
              variant="outline"
              className="flex-1"
            >
              Accueil
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
