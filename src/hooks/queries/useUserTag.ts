import { apiFetch } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

// Hook pour récupérer le tag de l'utilisateur
export function useUserTag() {
  return useQuery({
    queryKey: ["userTag"],
    queryFn: async (): Promise<string> => {
      const data = await apiFetch<{ tag: string }>("users/tag");
      return data.tag || "";
    },
  });
}
