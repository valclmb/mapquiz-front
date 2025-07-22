import { CreateLobby } from "@/components/multiplayer/CreateLobby";
import Typography from "@/components/ui/Typography";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/multiplayer/")({
  component: MultiplayerPage,
});

function MultiplayerPage() {
  return (
    <div className="w-full max-w-3xl mx-auto">
      <Typography variant="h1" className="text-center mt-10 mb-16">
        Créer un lobby multijoueur
      </Typography>
      <h1 className="text-2xl font-bold mb-6"></h1>
      <CreateLobby />
    </div>
  );
}
