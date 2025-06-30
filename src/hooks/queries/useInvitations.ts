import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  tag: string;
  image?: string;
  isOnline: boolean;
  lastSeen: string;
  isFriend: boolean;
  hasPendingRequest: boolean;
}

interface SearchUsersResponse {
  users: User[];
}

interface SendInvitationResponse {
  message: string;
  request: any;
  notificationSent: boolean;
}

// Hook pour rechercher des utilisateurs
export function useSearchUsers(query: string) {
  return useQuery({
    queryKey: ['searchUsers', query],
    queryFn: async (): Promise<SearchUsersResponse> => {
      if (!query || query.trim().length < 2) {
        return { users: [] };
      }

      const response = await fetch(`/api/friends/search?query=${encodeURIComponent(query)}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la recherche');
      }

      return response.json();
    },
    enabled: query.trim().length >= 2,
    staleTime: 30000, // 30 secondes
  });
}

// Hook pour envoyer une invitation d'ami
export function useSendInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (receiverId: string): Promise<SendInvitationResponse> => {
      const response = await fetch('/api/friends/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ receiverId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de l\'envoi de l\'invitation');
      }

      return response.json();
    },
    onSuccess: (data, receiverId) => {
      toast.success(data.message);
      
      // Invalider les requêtes pour mettre à jour l'UI
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
      queryClient.invalidateQueries({ queryKey: ['searchUsers'] });
      
      // Mettre à jour le cache de recherche pour marquer l'utilisateur comme ayant une demande en cours
      queryClient.setQueriesData(
        { queryKey: ['searchUsers'] },
        (oldData: SearchUsersResponse | undefined) => {
          if (!oldData) return oldData;
          
          return {
            ...oldData,
            users: oldData.users.map(user => 
              user.id === receiverId 
                ? { ...user, hasPendingRequest: true }
                : user
            ),
          };
        }
      );
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Hook pour envoyer une invitation via WebSocket (si disponible)
export function useSendInvitationWebSocket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ receiverId, sendFriendRequest }: { 
      receiverId: string; 
      sendFriendRequest: (receiverId: string) => void;
    }) => {
      // Utiliser la fonction WebSocket pour envoyer l'invitation
      sendFriendRequest(receiverId);
      return { receiverId };
    },
    onSuccess: (data) => {
      // Invalider les requêtes pour mettre à jour l'UI
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
      queryClient.invalidateQueries({ queryKey: ['searchUsers'] });
      
      // Mettre à jour le cache de recherche
      queryClient.setQueriesData(
        { queryKey: ['searchUsers'] },
        (oldData: SearchUsersResponse | undefined) => {
          if (!oldData) return oldData;
          
          return {
            ...oldData,
            users: oldData.users.map(user => 
              user.id === data.receiverId 
                ? { ...user, hasPendingRequest: true }
                : user
            ),
          };
        }
      );
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de l\'envoi de l\'invitation');
    },
  });
}