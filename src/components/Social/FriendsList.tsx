"use client";

import { useFriendsList, useRemoveFriend } from "@/hooks/queries/useFriends";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

export const FriendsList = () => {
  const [removingFriend, setRemovingFriend] = useState<string | null>(null);
  const { data: friends = [], isLoading } = useFriendsList();
  const removeFriendMutation = useRemoveFriend();

  const handleRemoveFriend = async (friendId: string) => {
    setRemovingFriend(friendId);
    try {
      await removeFriendMutation.mutateAsync(friendId);
    } finally {
      setRemovingFriend(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vos amis</CardTitle>
        <CardDescription>Liste de tous vos amis</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div>Chargement...</div>
        ) : friends.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            Vous n{"'"}avez pas encore d{"'"}amis
          </div>
        ) : (
          <div className="space-y-4">
            {friends.map((friend) => (
              <div
                key={friend.id}
                className="flex items-center justify-between bg-muted p-3 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {friend.image ? (
                    <div className="w-10 h-10 rounded-full overflow-hidden">
                      <img
                        src={friend.image}
                        alt={friend.name}
                        className="w-full h-full object-cover size-20"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center ">
                      {friend.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <div className="font-medium">{friend.name}</div>
                    {friend.tag && (
                      <div className="text-xs text-muted-foreground font-mono">
                        {friend.tag}
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveFriend(friend.id)}
                  disabled={removingFriend === friend.id}
                  className="text-muted-foreground hover:text-destructive hover:cursor-pointer"
                >
                  <Trash2 className="h-4 w-4  " />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
