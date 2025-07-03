import { Grid } from "@/components/layout/Grid";
import { CreateLobby } from "@/components/multiplayer/CreateLobby";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/multiplayer/")({
  component: MultiplayerPage,
});

function MultiplayerPage() {
  return (
    <main className="flex w-11/12 m-auto flex-grow min-w-screen h-full overflow-hidden flex-col items-center justify-between">
      <Grid>
        <div className="w-full max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">
            Créer un lobby multijoueur
          </h1>
          <CreateLobby />
        </div>
      </Grid>
    </main>
  );
}
