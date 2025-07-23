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
  const lobby = useLobbyStatus(lobbyId);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setIsHost(true); // À adapter si tu veux une vraie logique d'hôte
  }, [lobbyId]);

  // Redirection centralisée selon le status du lobby
  useEffect(() => {
    if (!lobby) return;
    const basePath = `/multiplayer/${lobbyId}`;
    const currentPath = location.pathname;

    if (lobby.status === "waiting" && currentPath !== basePath) {
      navigate({ to: basePath, params: { lobbyId } });
    } else if (
      lobby.status === "playing" &&
      currentPath !== `${basePath}/game`
    ) {
      navigate({ to: `${basePath}/game`, params: { lobbyId } });
    } else if (
      lobby.status === "finished" &&
      currentPath !== `${basePath}/result`
    ) {
      navigate({ to: `${basePath}/result`, params: { lobbyId } });
    }
  }, [lobby, location.pathname, lobbyId, navigate]);

  // Affiche le lobby UNIQUEMENT sur la route exacte et si status = waiting
  if (
    location.pathname === `/multiplayer/${lobbyId}` &&
    lobby?.status === "waiting"
  ) {
    return <LobbyRoom lobbyId={lobbyId} isHost={isHost} />;
  }

  // Sinon, affiche la page enfant (game, result, etc.)
  return <Outlet />;
}
