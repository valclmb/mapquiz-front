import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useWebSocketContext } from "@/context/WebSocketContext";
import { useState } from "react";
import { toast } from "sonner";

export const AddFriend = () => {
  const [friendTag, setFriendTag] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { sendFriendRequest } = useWebSocketContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendTag.trim()) return;

    setIsLoading(true);
    try {
      // Envoyer directement le tag via WebSocket
      sendFriendRequest(friendTag.trim());

      setFriendTag("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erreur lors de l'envoi"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ajouter un ami</CardTitle>
        <CardDescription>
          Entrez le tag d'un utilisateur pour lui envoyer une demande d'ami
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="text"
            placeholder="Entrez le tag d'ami"
            className="font-mono uppercase"
            maxLength={6}
            value={friendTag}
            onChange={(e) => setFriendTag(e.target.value)}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Envoi..." : "Ajouter"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
