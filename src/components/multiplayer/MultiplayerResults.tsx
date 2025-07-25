import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Ranking } from "@/types/game";
import { useNavigate } from "@tanstack/react-router";
import { Award, Medal, Trophy } from "lucide-react";
import React from "react";
import Typography from "../ui/Typography";

interface MultiplayerResultsProps {
  rankings: Ranking[];
  onRestart: () => void;
  isHost?: boolean;
}

export const MultiplayerResults = ({
  rankings,
  onRestart,
  isHost = false,
}: MultiplayerResultsProps) => {
  const navigate = useNavigate();

  const RANK_CONFIG: Record<
    number,
    {
      icon: React.ReactNode;
      style: string;
      badge: string;
      textColor: string;
      badgeVariant: "default" | "secondary" | "outline";
    }
  > = {
    1: {
      icon: <Trophy className="w-6 h-6 text-yellow-500" />,
      style: "border-yellow-400 bg-yellow-50 dark:bg-yellow-900",
      textColor: "text-yellow-900 dark:text-yellow-500",
      badge: "1er",
      badgeVariant: "default",
    },
    2: {
      icon: <Medal className="w-6 h-6 text-gray-400" />,
      style: "border-gray-300 bg-gray-50 dark:bg-gray-500",
      textColor: "text-gray-900 dark:text-gray-500",
      badge: "2ème",
      badgeVariant: "secondary",
    },
    3: {
      icon: <Award className="w-6 h-6 text-amber-600" />,
      style: "border-amber-600 bg-amber-50 dark:bg-amber-500",
      textColor: "text-amber-900 dark:text-amber-500",
      badge: "3ème",
      badgeVariant: "outline",
    },
  };

  return (
    <div className="min-h-screen flex items-start justify-center bg-gradient-to-br dark:text-yellow-500">
      <Card className="w-full max-w-2xl mt-30">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold ">
            Résultats de la partie
          </CardTitle>
          <p className="text-primary mt-2">Classement final des joueurs</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Classement */}
          <div className="space-y-3">
            {rankings.map((player) => {
              const config = RANK_CONFIG[player.rank];
              return (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${config.style}`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-8 h-8">
                      {config.icon}
                    </div>
                    <div className="">
                      <Typography variant="h3">{player.name}</Typography>

                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={config.badgeVariant}>
                          {config.badge}
                        </Badge>
                        <span className="text-sm">{player.score} points</span>
                        {player.completionTime && (
                          <span className="text-sm ">
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
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            {isHost && (
              <Button onClick={onRestart} className="flex-1 ">
                Rejouer
              </Button>
            )}

            {/* Message d'attente pour les non-hôtes */}
            {!isHost && (
              <div
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "hover:bg-background"
                )}
              >
                Attendre que l'hôte relance la partie...
              </div>
            )}

            <Button
              onClick={() => navigate({ to: "/" })}
              variant={isHost ? "outline" : "default"}
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
