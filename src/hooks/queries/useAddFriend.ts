import { apiFetch } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

// Type pour la réponse de l'API
type AddFriendResponse = {
  message: string;
};

// Hook pour ajouter un ami
export function useAddFriend() {
  return useMutation({
    mutationFn: async (tag: string) => {
      return apiFetch<AddFriendResponse>("friends/add", {
        method: "POST",
        body: { tag: tag.trim() },
        showErrorToast: false, // On gère les erreurs manuellement dans onError
      });
    },
    onSuccess: (data: AddFriendResponse) => {
      toast("Succès", {
        description: data.message || "Demande d'ami envoyée avec succès",
      });
    },
    onError: (error: Error) => {
      toast.error("Erreur", {
        description: error.message,
      });
    },
  });
}
