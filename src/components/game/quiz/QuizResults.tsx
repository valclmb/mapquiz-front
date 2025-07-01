import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";

type QuizResultsProps = {
  score: number;
  total: number;
  duration: number;
  onRestart: () => void;
};

export const QuizResults = ({
  score,
  total,
  duration,
  onRestart,
}: QuizResultsProps) => {
  const percentage = Math.round((score / total) * 100);
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;

  const getScoreMessage = () => {
    if (percentage >= 90) return "Excellent ! 🏆";
    if (percentage >= 75) return "Très bien ! 🎉";
    if (percentage >= 50) return "Bien joué ! 👍";
    return "Continue à t'entraîner ! 💪";
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Résultats du Quiz</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <div className="text-4xl font-bold text-primary">
            {score}/{total}
          </div>
          <div className="text-2xl font-semibold">{percentage}%</div>
          <div className="text-lg">{getScoreMessage()}</div>
          <div className="text-sm text-muted-foreground">
            Temps: {minutes}m {seconds}s
          </div>
          <Button onClick={onRestart} className="w-full">
            Rejouer
          </Button>
          <Link to="/">
            <Button>Retourner à l'accueil</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};
