import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Toggle } from "@/components/ui/toggle";
import { useScoreHistory } from "@/hooks/queries/useScoreHistory";
import { authClient } from "@/lib/auth-client";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import Typography from "../ui/Typography";
import { QuizHistory } from "./QuizHistory";

export const QuizCard = () => {
  const { useSession } = authClient;
  const { data } = useSession();
  const { data: scoreHistory } = useScoreHistory();
  const [selectedRegions, setSelectedRegions] = useState<string[]>([
    "Afrique",
    "Amérique du Nord",
    "Amérique du Sud",
    "Europe",
    "Asie",
    "Océanie",
  ]);

  // Utiliser les régions du dernier quiz comme sélection par défaut
  useEffect(() => {
    if (data?.user && scoreHistory && scoreHistory.length > 0) {
      // Le premier élément est le plus récent car l'API les renvoie déjà triés
      const lastQuiz = scoreHistory[0];
      if (lastQuiz.selectedRegions && lastQuiz.selectedRegions.length > 0) {
        setSelectedRegions(lastQuiz.selectedRegions);
      }
    }
  }, [data?.user, scoreHistory]);

  const handleRegionToggle = (region: string) => {
    setSelectedRegions((prev) =>
      prev.includes(region)
        ? prev.filter((r) => r !== region)
        : [...prev, region]
    );
  };

  return (
    <Card className="bg-white">
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
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { key: "Afrique", label: "Afrique" },
            { key: "Amérique du Nord", label: "Amérique du Nord" },
            { key: "Amérique du Sud", label: "Amérique du Sud" },
            { key: "Asie", label: "Asie" },
            { key: "Europe", label: "Europe" },
            { key: "Océanie", label: "Océanie" },
          ].map(({ key, label }) => (
            <Toggle
              key={key}
              aria-label={label}
              pressed={selectedRegions.includes(key)}
              onPressedChange={() => handleRegionToggle(key)}
              className="text-sm"
            >
              {label}
            </Toggle>
          ))}
        </div>
        {data?.user && (
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
