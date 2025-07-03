import { apiFetch } from "@/lib/api";
import { authClient } from "@/lib/auth-client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
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
  // Un seul état pour suivre les utilisateurs invités
  const [invitedUsers, setInvitedUsers] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!session?.user?.id) return;
  }, [queryClient, session]);

  // Fonction pour marquer un utilisateur comme invité
  const markUserAsInvited = useCallback((userId: string) => {
    setInvitedUsers((prev) => ({ ...prev, [userId]: true }));

    // Réinitialiser après 5 secondes
    setTimeout(() => {
      setInvitedUsers((prev) => {
        const newState = { ...prev };
        delete newState[userId];
        return newState;
      });
    }, 5000);
  }, []);

  const query = useQuery({
    queryKey: ["friends"],
    queryFn: async (): Promise<Friend[]> => {
      const data = await apiFetch<{ friends: Friend[] }>("friends/list");
      return data.friends || [];
    },
  });

  return {
    ...query,
    invitedUsers,
    markUserAsInvited,
  };
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
