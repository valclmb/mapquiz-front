import { Button } from "@/components/ui/button";
import { useFriendsList } from "@/hooks/queries/useFriends";
import { cn } from "@/lib/utils";
import type { Player } from "@/types/game";
import { Check, CircleMinus, Crown } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import Typography from "../ui/Typography";
import { Avatar } from "./Avatar";
import { PlayerStatusBadge } from "./PlayerStatusBadge";

type UserListProps = {
  title?: string;
  onInvite?: (userId: string) => void;
  className?: string;
  filterUsers?: (user: Player) => boolean; // Fonction optionnelle pour filtrer les utilisateurs

  customUsers?: Player[]; // Liste d'utilisateurs personnalisée (au lieu d'utiliser useFriendsList)
  showStatus?: boolean; // Afficher le statut des utilisateurs (pour les joueurs de lobby)
  hostId?: string; // ID de l'hôte (pour les lobbies)
  isHost?: boolean; // Nouveau: indique si l'utilisateur actuel est l'hôte
  onRemovePlayer?: (playerId: string) => void; // Nouveau: fonction pour supprimer un joueur
};

export const UserList = ({
  title,
  onInvite,
  className = "",
  filterUsers,

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
      <Typography variant="h3">{title}</Typography>
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
              <Card key={user.id} className="rounded-xl p-0">
                <CardContent className="flex items-center justify-between gap-2 p-4">
                  {/* Avatar et nom */}
                  <section className="flex items-center gap-2">
                    <Avatar user={user} showStatus={!showStatus} />
                    <div className="flex flex-col">
                      <span className={cn("font-medium")}>{user.name}</span>
                      {/* {user.lastSeen && (
                        <span className="text-xs text-gray-500">
                          Vu {new Date(user.lastSeen).toLocaleDateString()}
                        </span>
                      )} */}
                    </div>
                  </section>

                  {/* Bouton d'invitation et actions */}
                  <div className="flex items-center space-x-2">
                    {/* Statut */}
                    {showStatus && <PlayerStatusBadge status={user.status} />}

                    {/* Bouton de suppression pour l'hôte */}
                    {isHost && onRemovePlayer && user.id !== hostId && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <CircleMinus
                              className="cursor-pointer hover:scale-110 transition-all text-destructive"
                              onClick={() => onRemovePlayer(user.id)}
                            />
                          </TooltipTrigger>
                          <TooltipContent>Exclure le joueur</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    {showStatus && hostId && user.id === hostId && (
                      <Crown className="text-primary" />
                    )}

                    {onInvite &&
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
