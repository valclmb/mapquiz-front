import { MultiplayerResults } from "@/components/multiplayer/MultiplayerResults";
import { useWebSocketContext } from "@/context/WebSocketContext";
import { authClient } from "@/lib/auth-client";
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
  const [hostId, setHostId] = useState<string | null>(null);

  const { sendMessage, lastMessage } = useWebSocketContext();
  const navigate = useNavigate();

  // Récupérer l'utilisateur actuel
  const { data: session } = authClient.useSession();
  const currentUserId = session?.user?.id;

  // Déterminer si l'utilisateur actuel est l'hôte
  const isHost = currentUserId && hostId ? currentUserId === hostId : false;

  // Debug: afficher les valeurs pour diagnostiquer
  console.log("GameResultPage - Debug isHost:", {
    currentUserId,
    hostId,
    isHost,
  });

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
      setHostId(lastMessage.data.hostId as string);
      setLoading(false);
    }

    // Gérer l'erreur - rediriger vers le jeu si la partie n'est pas terminée
    if (lastMessage?.type === "error") {
      const errorMessage = lastMessage.message as string;
      console.log("GameResultPage - Erreur reçue:", errorMessage);

      if (errorMessage.includes("pas encore terminée")) {
        console.log(
          "GameResultPage - Redirection vers le jeu car partie non terminée"
        );
        navigate({
          to: "/multiplayer/$lobbyId/game",
          params: { lobbyId },
        });
      }
    }
  }, [lastMessage, lobbyId, navigate]);

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

  return (
    <MultiplayerResults
      rankings={rankings}
      onRestart={handleRestart}
      isHost={isHost}
    />
  );
}
