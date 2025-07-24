import { MultiplayerResults } from "@/components/multiplayer/MultiplayerResults";
import { useLobby } from "@/context/LobbyProvider";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/multiplayer/$lobbyId/result")({
  component: GameResultPage,
});

function GameResultPage() {
  const { lobby, loading, restartGame } = useLobby();
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Chargement des résultats...</p>
        </div>
      </div>
    );
  }
  // On suppose que lobby.rankings et lobby.hostId existent dans l'état du lobby
  const rankings = lobby?.rankings || [];
  const isHost =
    lobby?.hostId &&
    lobby?.players?.some((p: { id: string }) => p.id === lobby.hostId);
  return (
    <MultiplayerResults
      rankings={rankings}
      onRestart={restartGame}
      isHost={isHost}
    />
  );
}
