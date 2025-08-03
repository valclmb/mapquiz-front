import { apiFetch } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import type { Continent } from "@/types/continent";
import { useQuery } from "@tanstack/react-query";

export type ScoreHistoryItem = {
  score: number;
  duration: number;
  selectedRegions: Continent[];
  date: string; // Format dd/MM
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
