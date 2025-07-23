import { MultiplayerResults } from "@/components/multiplayer/MultiplayerResults";
import { useWebSocketContext } from "@/context/WebSocketContext";
import type { Ranking } from "@/types/game";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/multiplayer/$lobbyId/result")({
  component: GameResultPage,
});

function GameResultPage() {
  const { lobbyId } = Route.useParams();
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [loading, setLoading] = useState(true);
  const { sendMessage, lastMessage } = useWebSocketContext();
  const navigate = useNavigate();

  // Récupérer les résultats au montage
  useEffect(() => {
    sendMessage({
      type: "get_game_results",
      payload: { lobbyId },
    });
  }, [lobbyId, sendMessage]);

  // Écouter les résultats
  useEffect(() => {
    if (
      lastMessage?.type === "get_game_results_success" &&
      lastMessage.data?.rankings
    ) {
      setRankings(lastMessage.data.rankings as Ranking[]);
      setLoading(false);
    }
  }, [lastMessage]);

  // Fonction pour relancer la partie
  const handleRestart = () => {
    sendMessage({
      type: "restart_game",
      payload: { lobbyId },
    });
    // Rediriger vers le lobby après restart
    navigate({
      to: "/multiplayer/$lobbyId",
      params: { lobbyId },
    });
  };

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

  return <MultiplayerResults rankings={rankings} onRestart={handleRestart} />;
}
