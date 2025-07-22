import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFriendsList, type Friend } from "@/hooks/queries/useFriends";
import { Check } from "lucide-react";

// Type pour les joueurs de lobby avec statut
type LobbyPlayer = {
  id: string;
  name: string;
  image: string | null;
  tag: string | null;
  isOnline: boolean;
  lastSeen: string;
  status?: string; // Statut optionnel pour les joueurs de lobby
};

// Type union pour supporter les deux cas
type UserListItem = Friend | LobbyPlayer;

// Configuration des statuts
const STATUS_CONFIG = {
  ready: {
    label: "Prêt",
    style: "bg-green-100 text-green-800",
  },
  joined: {
    label: "Pas prêt",
    style: "bg-yellow-100 text-yellow-800",
  },
  invited: {
    label: "Invité",
    style: "bg-blue-100 text-blue-800",
  },
} as const;

type UserListProps = {
  title?: string;
  onInvite?: (userId: string) => void;
  className?: string;
  filterUsers?: (user: UserListItem) => boolean; // Fonction optionnelle pour filtrer les utilisateurs
  showInviteForOffline?: boolean; // Afficher le bouton d'invitation même pour les utilisateurs hors ligne
  customUsers?: UserListItem[]; // Liste d'utilisateurs personnalisée (au lieu d'utiliser useFriendsList)
  showStatus?: boolean; // Afficher le statut des utilisateurs (pour les joueurs de lobby)
  hostId?: string; // ID de l'hôte (pour les lobbies)
};

export const UserList = ({
  title = "Utilisateurs",
  onInvite,
  className = "",
  filterUsers,
  showInviteForOffline = false,
  customUsers,
  showStatus = false,
  hostId,
}: UserListProps) => {
  // Utiliser le hook useFriendsList avec les nouvelles fonctionnalités
  const {
    data: friends = [],
    isLoading,
    invitedUsers,
    markUserAsInvited,
  } = useFriendsList();

  // Utiliser customUsers si fourni, sinon utiliser les amis
  const users = customUsers || friends;

  // Fonction pour gérer l'invitation
  const handleInvite = (userId: string) => {
    if (onInvite) {
      onInvite(userId);
      markUserAsInvited(userId);
    }
  };

  // Filtrer les utilisateurs si une fonction de filtrage est fournie
  const filteredUsers = filterUsers ? users.filter(filterUsers) : users;

  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <CardTitle className="text-xl">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div className="space-y-2">
          {isLoading ? (
            <p className="text-muted-foreground">Chargement...</p>
          ) : filteredUsers.length === 0 ? (
            <p className="text-muted-foreground">
              {users.length === 0
                ? "Aucun utilisateur"
                : "Aucun utilisateur disponible"}
            </p>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-2 border rounded-md"
              >
                <div className="flex items-center gap-2">
                  <div className="relative">
                    {user.image ? (
                      <div className="w-8 h-8 rounded-full overflow-hidden">
                        <img
                          src={user.image}
                          alt={user.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                        {user.name.charAt(0)}
                      </div>
                    )}
                    <div
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                        user.isOnline ? "bg-green-500" : "bg-gray-400"
                      }`}
                      title={user.isOnline ? "En ligne" : "Hors ligne"}
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">{user.name}</span>
                    {!user.isOnline && user.lastSeen && (
                      <span className="text-xs text-gray-500">
                        Vu {new Date(user.lastSeen).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {showStatus && hostId && user.id === hostId && (
                    <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                      Hôte
                    </span>
                  )}
                  {showStatus &&
                    user.status &&
                    (() => {
                      const status = (user as LobbyPlayer).status;
                      const statusConfig =
                        STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
                      return (
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            statusConfig?.style || "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {statusConfig?.label || String(status)}
                        </span>
                      );
                    })()}
                  {onInvite &&
                    (user.isOnline || showInviteForOffline) &&
                    (invitedUsers[user.id] ? (
                      <div className="w-8 h-8 flex items-center justify-center text-green-500">
                        <Check size={18} />
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleInvite(user.id)}
                        disabled={invitedUsers[user.id]}
                      >
                        Inviter
                      </Button>
                    ))}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
