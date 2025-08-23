import { useLobby } from "@/context/LobbyProvider";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/_authenticated/multiplayer/$lobbyId/")({
  component: LobbyIndexRedirect,
});

function LobbyIndexRedirect() {
  const { lobby, loading } = useLobby();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading || !lobby) return;
    if (lobby.status === "waiting") {
      navigate({ to: `/multiplayer/${lobby.lobbyId}/lobby` });
    } else if (lobby.status === "playing") {
      navigate({ to: `/multiplayer/${lobby.lobbyId}/game` });
    } else if (lobby.status === "finished") {
      navigate({ to: `/multiplayer/${lobby.lobbyId}/result` });
    }
  }, [lobby, loading, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Redirection en cours...</p>
      </div>
    </div>
  );
}
