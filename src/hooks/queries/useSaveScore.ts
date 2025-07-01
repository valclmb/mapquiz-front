import { apiFetch } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

type SaveScoreData = {
  score: number;
  totalQuestions: number;
  selectedRegions: string[];
  gameMode: string;
  duration: number;
};

type SaveScoreResponse = {
  message: string;
};

export function useSaveScore() {
  return useMutation({
    mutationFn: async (data: SaveScoreData): Promise<SaveScoreResponse> => {
      return apiFetch<SaveScoreResponse>("scores", {
        method: "POST",
        body: data,
      });
    },

    onError: (error) => {
      toast.error("Erreur lors de la sauvegarde du score");
      console.error("Erreur lors de la sauvegarde du score:", error);
    },
  });
}
