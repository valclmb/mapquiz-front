import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFriendsList } from "@/hooks/queries/useFriends";
import { Check } from "lucide-react";

type UserListProps = {
  title?: string;
  onInvite?: (userId: string) => void;
  className?: string;
};

export const UserList = ({
  title = "Utilisateurs",
  onInvite,
  className = "",
}: UserListProps) => {
  // Utiliser le hook useFriendsList avec les nouvelles fonctionnalités
  const {
    data: users = [],
    isLoading,
    invitedUsers,
    markUserAsInvited,
  } = useFriendsList();

  // Fonction pour gérer l'invitation
  const handleInvite = (userId: string) => {
    if (onInvite) {
      onInvite(userId);
      markUserAsInvited(userId);
    }
  };

  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div className="space-y-2">
          {isLoading ? (
            <p className="text-muted-foreground">Chargement...</p>
          ) : users.length === 0 ? (
            <p className="text-muted-foreground">Aucun utilisateur</p>
          ) : (
            users.map((user) => (
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
                {onInvite &&
                  user.isOnline &&
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
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
