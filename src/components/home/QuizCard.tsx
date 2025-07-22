import { RegionSelector } from "@/components/game/common/RegionSelector";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useScoreHistory } from "@/hooks/queries/useScoreHistory";
import { authClient } from "@/lib/auth-client";
import { CONTINENTS } from "@/lib/constants";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import Typography from "../ui/Typography";
import { QuizHistory } from "./QuizHistory";

export const QuizCard = () => {
  const { useSession } = authClient;
  const { data } = useSession();
  const { data: scoreHistory } = useScoreHistory();
  const [selectedRegions, setSelectedRegions] = useState<string[]>(CONTINENTS);

  // Déterminer les régions par défaut à partir de l'historique
  useEffect(() => {
    if (data?.user && scoreHistory && scoreHistory.length > 0) {
      // Le premier élément est le plus récent car l'API les renvoie déjà triés
      const lastQuiz = scoreHistory[0];
      if (lastQuiz.selectedRegions && lastQuiz.selectedRegions.length > 0) {
        setSelectedRegions(lastQuiz.selectedRegions);
      }
    }
  }, [data?.user, scoreHistory]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl sm:text-2xl">Quiz</CardTitle>
        <CardDescription>
          Défiez-vous sur les pays et leurs capitales !
          <br /> Connectez-vous pour suivre votre progression et conserver l
          {"'"}historique de vos scores.
        </CardDescription>
      </CardHeader>

      <CardFooter className="flex-col items-start gap-2">
        <Typography variant="h4" className="text-base sm:text-lg">
          Sélectionnez vos régions
        </Typography>
        <RegionSelector
          selectedRegions={selectedRegions}
          onChange={setSelectedRegions}
        />
        {data && (
          <div className="w-full">
            <h4 className="text-base sm:text-lg font-medium mb-2">
              Historique
            </h4>
            <QuizHistory selectedRegions={selectedRegions} />
          </div>
        )}
        <Link
          to="/quiz"
          search={{ regions: selectedRegions }}
          className="w-full sm:w-auto"
        >
          <Button
            className="w-full sm:w-auto"
            disabled={selectedRegions.length === 0}
          >
            Lancer
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};
