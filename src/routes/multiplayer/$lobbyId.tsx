import { LobbyRoom } from "@/components/multiplayer/LobbyRoom";
import { useWebSocketContext } from "@/context/WebSocketContext";
import {
  createFileRoute,
  Outlet,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/multiplayer/$lobbyId")({
  component: LobbyParentPage,
});

function LobbyParentPage() {
  const { lobbyId } = Route.useParams();
  const [isHost, setIsHost] = useState(false);
  const [lobbyStatus, setLobbyStatus] = useState<string | null>(null);
  const { sendMessage, lastMessage } = useWebSocketContext();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setIsHost(true); // À adapter si tu veux une vraie logique d'hôte
  }, [lobbyId]);

  // Récupérer l'état du lobby au montage
  useEffect(() => {
    sendMessage({
      type: "get_game_state",
      payload: { lobbyId },
    });
  }, [lobbyId, sendMessage]);

  // Met à jour le status du lobby à chaque message pertinent
  useEffect(() => {
    console.log(
      "📨 Message reçu dans $lobbyId:",
      lastMessage?.type,
      lastMessage
    );

    if (
      lastMessage?.type === "game_state_update" &&
      lastMessage.payload?.gameState
    ) {
      const gameState = lastMessage.payload.gameState as {
        lobbyId: string;
        status: string;
      };
      if (gameState.lobbyId === lobbyId) {
        setLobbyStatus(gameState.status);
      }
    }

    // Gérer le message get_game_state_success pour mettre à jour le status
    if (
      lastMessage?.type === "get_game_state_success" &&
      lastMessage.data?.gameState
    ) {
      const gameState = lastMessage.data.gameState as {
        lobbyId: string;
        status: string;
      };
      if (gameState.lobbyId === lobbyId) {
        setLobbyStatus(gameState.status);
      }
    }
  }, [lastMessage, lobbyId]);

  // Redirection centralisée selon le status du lobby
  useEffect(() => {
    if (!lobbyStatus) return;
    const basePath = `/multiplayer/${lobbyId}`;
    const currentPath = location.pathname;

    console.log("🔄 Redirection check:", {
      lobbyStatus,
      currentPath,
      basePath,
    });

    if (lobbyStatus === "waiting" && currentPath !== basePath) {
      console.log("⬅️ Redirecting to lobby");
      navigate({ to: basePath, params: { lobbyId } });
    } else if (
      lobbyStatus === "playing" &&
      currentPath !== `${basePath}/game`
    ) {
      console.log("🎮 Redirecting to game");
      navigate({ to: `${basePath}/game`, params: { lobbyId } });
    } else if (
      lobbyStatus === "finished" &&
      currentPath !== `${basePath}/result`
    ) {
      console.log("🏁 Redirecting to results");
      navigate({ to: `${basePath}/result`, params: { lobbyId } });
    }
  }, [lobbyStatus, location.pathname, lobbyId, navigate]);

  // Affiche le lobby UNIQUEMENT sur la route exacte et si status = waiting
  if (
    location.pathname === `/multiplayer/${lobbyId}` &&
    lobbyStatus === "waiting"
  ) {
    return <LobbyRoom lobbyId={lobbyId} isHost={isHost} />;
  }

  // Sinon, affiche la page enfant (game, result, etc.)
  return <Outlet />;
}
