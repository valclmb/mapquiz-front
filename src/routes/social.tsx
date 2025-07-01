import { Grid } from "@/components/layout/Grid";
import { AddFriend } from "@/components/social/AddFriend";
import { FriendRequests } from "@/components/social/FriendRequests";
import { FriendsList } from "@/components/social/FriendsList";
import { FriendTag } from "@/components/social/FriendTag";
import Typography from "@/components/ui/Typography";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/social")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Grid>
      <div className="w-full max-w-4xl mx-auto p-6">
        <Typography variant="h1" className="mb-10 text-center">
          Amis
        </Typography>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <FriendTag />
          <AddFriend />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <FriendRequests />
          <FriendsList />
        </div>
      </div>
    </Grid>
  );
}
