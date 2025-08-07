import { AddFriend } from "@/components/social/AddFriend";
import { FriendRequests } from "@/components/social/FriendRequests";
import { FriendsList } from "@/components/social/FriendsList";
import { FriendTag } from "@/components/social/FriendTag";

import Typography from "@/components/ui/Typography";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/social")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="w-full max-w-5xl mx-auto">
      <Typography variant="h1">Amis</Typography>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <FriendTag />
        <AddFriend />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <FriendRequests />
        <FriendsList />
      </div>
    </div>
  );
}
