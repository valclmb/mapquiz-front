import { apiFetch } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type FriendRequest = {
  id: string;
  sender: {
    id: string;
    name: string;
    image: string | null;
    tag: string | null;
  };
  createdAt: string;
};

type FriendRequestResponse = {
  message: string;
};

// Hook pour récupérer les demandes d'amitié
export function useFriendRequests() {
  return useQuery({
    queryKey: ["friendRequests"],
    queryFn: async (): Promise<FriendRequest[]> => {
      const data = await apiFetch<{ friendRequests: FriendRequest[] }>(
        "friends/requests"
      );
      return data.friendRequests || [];
    },
  });
}

// Hook pour gérer les demandes d'amitié (accepter/refuser)
export function useHandleFriendRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      requestId,
      action,
    }: {
      requestId: string;
      action: "accept" | "reject";
    }) => {
      return apiFetch<FriendRequestResponse>(`friends/requests/${requestId}`, {
        method: "POST",
        body: { action },
      });
    },
    onSuccess: (data: FriendRequestResponse) => {
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      // Si l'action est "accept", on invalide aussi la liste des amis
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      toast("Succès !", {
        description: data.message,
      });
    },
    onError: (error: Error) => {
      toast.error("Une erreur est survenue !", {
        description: error.message,
      });
    },
  });
}
