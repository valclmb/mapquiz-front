import { apiFetch } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export type ScoreHistoryItem = {
  id: string;
  score: number;
  totalQuestions: number;
  selectedRegions: string[];
  gameMode: string;
  duration: number;
  createdAt: string;

  date: string; // Format dd/MM
  scorePercentage: number; // Pourcentage arrondi
};

export function useScoreHistory() {
  return useQuery({
    queryKey: ["scoreHistory"],
    queryFn: async (): Promise<ScoreHistoryItem[]> => {
      return apiFetch<ScoreHistoryItem[]>("scores/history");
    },
  });
}
