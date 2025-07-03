import { useFriendsList } from "@/hooks/queries/useFriends";
import { useState } from "react";
import { Button } from "../ui/button";

type FriendSelectorProps = {
  onSelectFriend: (friendId: string) => void;
};

export const FriendSelector = ({ onSelectFriend }: FriendSelectorProps) => {
  const [invitingFriend, setInvitingFriend] = useState<string | null>(null);
  const { data: friends = [], isLoading } = useFriendsList();

  const handleInviteFriend = async (friendId: string) => {
    setInvitingFriend(friendId);
    try {
      onSelectFriend(friendId);
    } finally {
      setInvitingFriend(null);
    }
  };

  return (
    <div className="space-y-2">
      {isLoading ? (
        <div>Chargement...</div>
      ) : friends.length === 0 ? (
        <div className="text-center py-2 text-muted-foreground">
          Vous n{"'"}avez pas encore d{"'"}amis
        </div>
      ) : (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {friends.map((friend) => (
            <div
              key={friend.id}
              className="flex items-center justify-between bg-muted p-2 rounded-lg"
            >
              <div className="flex items-center gap-2">
                {friend.image ? (
                  <div className="w-8 h-8 rounded-full overflow-hidden">
                    <img
                      src={friend.image}
                      alt={friend.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                    {friend.name.charAt(0)}
                  </div>
                )}
                <div className="font-medium">{friend.name}</div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleInviteFriend(friend.id)}
                disabled={invitingFriend === friend.id}
                className="text-primary hover:text-primary-foreground hover:bg-primary"
              >
                Inviter
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
