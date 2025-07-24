import { Button } from "@/components/ui/button";
import { useFriendsList, type Friend } from "@/hooks/queries/useFriends";
import { cn } from "@/lib/utils";
import { Check, Trash2 } from "lucide-react";
import Typography from "../ui/Typography";
import { Card, CardContent } from "../ui/card";

// Type pour les joueurs de lobby avec statut
type LobbyPlayer = {
  id: string;
  name: string;
  image: string | null;
  tag: string | null;
  isOnline: boolean; // Statut général de l'utilisateur (connecté à l'app)
  lastSeen: string;
  status?: string; // Statut de jeu dans le lobby (joined, ready, playing)
  isPresentInLobby?: boolean; // Nouveau: indique si le joueur est présent dans le lobby
  leftLobbyAt?: string | null; // Nouveau: timestamp de départ du lobby
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
  disconnected: {
    label: "Déconnecté",
    style: "bg-red-100 text-red-800",
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
  isHost?: boolean; // Nouveau: indique si l'utilisateur actuel est l'hôte
  onRemovePlayer?: (playerId: string) => void; // Nouveau: fonction pour supprimer un joueur
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
  isHost = false,
  onRemovePlayer,
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
    <div className={cn(className, "mb-10 space-y-4")}>
      {title && (
        <div>
          <Typography variant="h3">{title}</Typography>
        </div>
      )}
      <div>
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
              <Card
                key={user.id}
                className={cn(
                  "rounded-xl p-0",
                  (user as LobbyPlayer).isPresentInLobby === false &&
                    "border-red-200 bg-red-50"
                )}
              >
                <CardContent className="flex items-center justify-between gap-2 p-4">
                  {/* Avatar et nom */}
                  <section className="flex items-center gap-2">
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
                        <div
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-primary-foreground",
                            (user as LobbyPlayer).isPresentInLobby === false
                              ? "bg-red-500"
                              : "bg-primary"
                          )}
                        >
                          {user.name.charAt(0)}
                        </div>
                      )}
                      <div
                        className={cn(
                          "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white",
                          (user as LobbyPlayer).isPresentInLobby === false
                            ? "bg-red-500"
                            : user.isOnline
                              ? "bg-green-500"
                              : "bg-gray-400"
                        )}
                        title={
                          (user as LobbyPlayer).isPresentInLobby === false
                            ? "Absent du lobby"
                            : user.isOnline
                              ? "En ligne"
                              : "Hors ligne"
                        }
                      />
                    </div>

                    <div className="flex flex-col">
                      <span
                        className={cn(
                          "font-medium",
                          (user as LobbyPlayer).isPresentInLobby === false &&
                            "text-red-800"
                        )}
                      >
                        {user.name}
                      </span>
                      {(user as LobbyPlayer).isPresentInLobby === false &&
                      (user as LobbyPlayer).leftLobbyAt ? (
                        <span className="text-xs text-red-600">
                          Absent depuis{" "}
                          {new Date(
                            (user as LobbyPlayer).leftLobbyAt!
                          ).toLocaleString()}
                        </span>
                      ) : !user.isOnline && user.lastSeen ? (
                        <span className="text-xs text-gray-500">
                          Vu {new Date(user.lastSeen).toLocaleDateString()}
                        </span>
                      ) : null}
                    </div>
                  </section>

                  {/* Bouton d'invitation et actions */}
                  <div className="flex items-center space-x-2">
                    {showStatus && hostId && user.id === hostId && (
                      <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                        Hôte
                      </span>
                    )}
                    {/* Statut de présence */}
                    {showStatus &&
                      (user as LobbyPlayer).isPresentInLobby === false && (
                        <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                          Absent
                        </span>
                      )}

                    {/* Statut de jeu - seulement dans les lobbies, pas pendant le jeu */}
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

                    {/* Bouton de suppression pour l'hôte */}
                    {isHost && onRemovePlayer && user.id !== hostId && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onRemovePlayer(user.id)}
                        className="ml-2"
                        title={
                          (user as LobbyPlayer).isPresentInLobby === false
                            ? "Supprimer le joueur absent"
                            : "Expulser le joueur"
                        }
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}

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
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
