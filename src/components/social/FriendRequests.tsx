"use client";

import {
  useFriendRequests,
  useHandleFriendRequest,
} from "@/hooks/queries/useFriendRequests";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

export const FriendRequests = () => {
  const { data: requests = [], isLoading } = useFriendRequests();
  const handleRequestMutation = useHandleFriendRequest();

  console.log(requests);
  const handleRequest = async (
    requestId: string,
    action: "accept" | "reject"
  ) => {
    await handleRequestMutation.mutateAsync({ requestId, action });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Demandes d{"'"}amitié</CardTitle>
        <CardDescription>
          Gérez les demandes d{"'"}amitié que vous avez reçues
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div>Chargement...</div>
        ) : requests.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            Vous n{"'"}avez pas de demandes d{"'"}amitié en attente
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between bg-muted p-3 rounded-lg gap-3"
              >
                <div>
                  <div className="font-medium">{request.sender.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex gap-2 self-end sm:self-auto">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleRequest(request.id, "accept")}
                    disabled={handleRequestMutation.isPending}
                  >
                    Accepter
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRequest(request.id, "reject")}
                    disabled={handleRequestMutation.isPending}
                  >
                    Refuser
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
