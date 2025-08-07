import { LobbyRoom } from "@/components/multiplayer/LobbyRoom";
import { useLobby } from "@/context/LobbyProvider";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/multiplayer/$lobbyId/lobby")({
  component: LobbyWaitingPage,
});

export default function LobbyWaitingPage() {
  const { lobby, loading } = useLobby();
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du lobby...</p>
        </div>
      </div>
    );
  }
  if (lobby?.status === "waiting") {
    return <LobbyRoom lobbyId={lobby.lobbyId} isHost={false} />;
  }
  return null;
}
