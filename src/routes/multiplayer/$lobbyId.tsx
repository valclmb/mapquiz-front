import { LobbyRoom } from "@/components/multiplayer/LobbyRoom";
import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/multiplayer/$lobbyId")({
  component: LobbyParentPage,
});

function LobbyParentPage() {
  const { lobbyId } = Route.useParams();
  const [isHost, setIsHost] = useState(false);

  const location = useLocation();

  useEffect(() => {
    setIsHost(true);
  }, [lobbyId]);

  // // Affiche le lobby UNIQUEMENT sur la route exacte
  if (location.pathname === `/multiplayer/${lobbyId}`) {
    return <LobbyRoom lobbyId={lobbyId} isHost={isHost} />;
  }

  // Sinon, affiche la page enfant (game, result, etc.)
  return <Outlet />;
}
