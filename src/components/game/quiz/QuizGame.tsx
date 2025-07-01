"use client";

import { Grid } from "@/components/layout/Grid";
import { GameContext } from "@/context/GameContext";
import { useSaveScore } from "@/hooks/queries/useSaveScore";
import { useFilter } from "@/hooks/useFilter";
import type { Country } from "@/hooks/useMapGame";
import { useMapGame } from "@/hooks/useMapGame";
import { authClient } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import { Form } from "../common/Form";
import { Map } from "../common/Map";
import { Score } from "../common/Score";
import { QuizResults } from "./QuizResults";
type QuizGameProps = {
  countries: Country[]; // Changer de GeoJsonProperties[] à Country[]
  selectedRegions: string[];
};

export const QuizGame = ({ countries, selectedRegions }: QuizGameProps) => {
  const { filteredCountries, activeCountries } = useFilter(
    countries,
    selectedRegions
  );

  const [gameFinished, setGameFinished] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const { useSession } = authClient;
  const { data: session } = useSession();
  const saveScoreMutation = useSaveScore();

  useEffect(() => {
    setStartTime(new Date());
  }, []);

  const map = useMapGame(filteredCountries, {
    mode: "quiz",
    onGameEnd: (score: number, total: number) => {
      setGameFinished(true);
      if (session?.user && startTime) {
        const duration = Math.floor((Date.now() - startTime.getTime()) / 1000);
        saveScoreMutation.mutate({
          score,
          totalQuestions: total,
          selectedRegions,
          gameMode: "quiz",
          duration,
        });
      }
    },
  });

  const resetGame = () => {
    setGameFinished(false);
    setStartTime(null);
    map.resetGame();
  };

  if (gameFinished) {
    return (
      <QuizResults
        score={map.score}
        total={activeCountries.length} // Correction ici
        duration={
          startTime ? Math.floor((Date.now() - startTime.getTime()) / 1000) : 0
        }
        onRestart={resetGame}
      />
    );
  }

  return (
    <GameContext.Provider value={map}>
      <Grid>
        <Map />
      </Grid>
      <Form />
      <Score />
    </GameContext.Provider>
  );
};
