import { MultiplayerGame } from "@/components/multiplayer/MultiplayerGame";
import { useLobby } from "@/context/LobbyProvider";
import { useWebSocketContext } from "@/context/WebSocketContext";
import { getCountries } from "@/lib/data";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/multiplayer/$lobbyId/game")({
  component: MultiplayerGamePage,
  loader: async () => {
    const countries = await getCountries();
    return { countries };
  },
});

function MultiplayerGamePage() {
  const { lobby, loading } = useLobby();
  const { countries } = Route.useLoaderData();
  const { lastMessage } = useWebSocketContext();
  const navigate = useNavigate();
  const { lobbyId } = Route.useParams();

  useEffect(() => {
    if (lastMessage?.type === "game_results") {
      navigate({ to: `/multiplayer/${lobbyId}/result` });
    }
  }, [lastMessage, navigate, lobbyId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du jeu...</p>
        </div>
      </div>
    );
  }

  const selectedRegions = Array.isArray(lobby?.settings?.selectedRegions)
    ? lobby.settings.selectedRegions
    : [];

  return (
    <MultiplayerGame
      lobby={lobby}
      countries={countries}
      selectedRegions={selectedRegions}
    />
  );
}
