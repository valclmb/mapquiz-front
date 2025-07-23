import { LobbyRoom } from "@/components/multiplayer/LobbyRoom";
import { useLobbyStatus } from "@/hooks/useLobbyStatus";
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
  const { status: lobbyStatus } = useLobbyStatus(lobbyId);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setIsHost(true); // À adapter si tu veux une vraie logique d'hôte
  }, [lobbyId]);

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
