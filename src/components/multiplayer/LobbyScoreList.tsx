import { Card, CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { PlayerScore } from "@/types/game";
import { Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { ScoreListContent } from "./ScoreListContent";

export type LobbyScoreListPlayer = PlayerScore & { isHost?: boolean };

interface LobbyScoreListProps {
  players: LobbyScoreListPlayer[];
  totalCountries: number;
  title?: string;
  className?: string;
}

export const LobbyScoreList = ({
  players,
  totalCountries,
  className = "",
}: LobbyScoreListProps) => {
  const [isLg, setIsLg] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(min-width: 1024px)").matches
      : false
  );
  const [minimized, setMinimized] = useState(false);

  // Gère le breakpoint lg dynamiquement
  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const handler = () => setIsLg(mediaQuery.matches);
    handler();
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Quand on passe sur desktop, on affiche la Card par défaut
  useEffect(() => {
    if (isLg) setMinimized(false);
  }, [isLg]);

  return (
    <div>
      {isLg ? (
        <div className="test">
          <Button
            variant="outline"
            className="z-20 absolute top-5 left-5 cursor-pointer rounded-2xl"
            onClick={() => setMinimized((m) => !m)}
          >
            <Users /> Scores
          </Button>
          <Card className={cn(className, "2xl:block relative")}>
            {!minimized && (
              <CardContent>
                <ScoreListContent
                  players={players}
                  totalCountries={totalCountries}
                />
              </CardContent>
            )}
          </Card>
        </div>
      ) : (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="z-20 absolute top-5 left-5 cursor-pointer rounded-2xl"
            >
              <Users /> Scores
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full">
            <ScoreListContent
              players={players}
              totalCountries={totalCountries}
            />
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};
