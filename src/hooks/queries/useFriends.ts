import { apiFetch } from "@/lib/api";
import { authClient } from "@/lib/auth-client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";

export type Friend = {
  id: string;
  name: string;
  image: string | null;
  tag: string | null;
  isOnline: boolean;
  lastSeen: string;
};

// Hook pour récupérer la liste des amis
export function useFriendsList() {
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();

  useEffect(() => {
    if (!session?.user?.id) return;
  }, [queryClient, session]);

  return useQuery({
    queryKey: ["friends"],
    queryFn: async (): Promise<Friend[]> => {
      const data = await apiFetch<{ friends: Friend[] }>("friends/list");
      return data.friends || [];
    },
  });
}

// Hook pour supprimer un ami
export function useRemoveFriend() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (friendId: string) => {
      return apiFetch<{ message: string }>("friends/remove", {
        method: "DELETE",
        body: { friendId },
        showErrorToast: false, // On gère les erreurs manuellement dans onError
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      toast("title", {
        description: "Ami supprimé avec succès",
      });
    },
    onError: (error: Error) => {
      toast.error("Une erreur est survenue !", {
        description: error.message || "Impossible de supprimer cet ami",
      });
    },
  });
}
