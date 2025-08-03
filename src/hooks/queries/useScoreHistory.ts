import { apiFetch } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import type { Continent } from "@/types/continent";
import { useQuery } from "@tanstack/react-query";

export type ScoreHistoryItem = {
  id: string;
  score: number;
  totalQuestions: number;
  selectedRegions: Continent[];
  gameMode: string;
  duration: number;
  createdAt: string;
  date: string; // Format dd/MM
  scorePercentage: number; // Pourcentage arrondi
};

export function useScoreHistory() {
  const { data: session } = authClient.useSession();
  const isAuthenticated = !!session?.user;

  return useQuery({
    queryKey: ["scoreHistory"],
    queryFn: async (): Promise<ScoreHistoryItem[]> => {
      return apiFetch<ScoreHistoryItem[]>("scores/history");
    },
    // Ne pas exécuter la requête si l'utilisateur n'est pas authentifié
    enabled: isAuthenticated,
  });
}
