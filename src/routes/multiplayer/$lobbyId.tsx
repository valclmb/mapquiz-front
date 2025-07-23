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
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const lobby = useLobbyStatus(lobbyId);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setIsHost(true); // À adapter si tu veux une vraie logique d'hôte
  }, [lobbyId]);

  // Timeout pour éviter la boucle infinie de loading
  useEffect(() => {
    if (!lobby && location.pathname === `/multiplayer/${lobbyId}`) {
      const timeout = setTimeout(() => {
        console.log(
          "LobbyParentPage - Timeout de loading atteint, redirection vers l'accueil"
        );
        setLoadingTimeout(true);
        navigate({ to: "/" });
      }, 10000); // 10 secondes

      return () => clearTimeout(timeout);
    }
  }, [lobby, lobbyId, location.pathname, navigate]);

  // Redirection centralisée selon le status du lobby
  useEffect(() => {
    const basePath = `/multiplayer/${lobbyId}`;
    const currentPath = location.pathname;

    console.log("LobbyParentPage - Redirection check:", {
      lobbyStatus: lobby?.status,
      currentPath,
      basePath,
      gamePath: `${basePath}/game`,
      resultPath: `${basePath}/result`,
      hasLobbyData: !!lobby,
    });

    // Si on a les données du lobby, faire la redirection
    if (lobby) {
      // Si on est en train de jouer, rediriger vers la partie
      if (lobby.status === "playing" && currentPath !== `${basePath}/game`) {
        console.log("LobbyParentPage - Redirection vers la partie en cours");
        navigate({ to: `${basePath}/game`, params: { lobbyId } });
        return;
      }

      // Si la partie est terminée, rediriger vers les résultats
      if (lobby.status === "finished" && currentPath !== `${basePath}/result`) {
        console.log("LobbyParentPage - Redirection vers les résultats");
        navigate({ to: `${basePath}/result`, params: { lobbyId } });
        return;
      }

      // Si on est en attente, rediriger vers le lobby
      if (lobby.status === "waiting" && currentPath !== basePath) {
        console.log("LobbyParentPage - Redirection vers le lobby");
        navigate({ to: basePath, params: { lobbyId } });
        return;
      }
    }
  }, [lobby, location.pathname, lobbyId, navigate]);

  // Affiche le lobby UNIQUEMENT sur la route exacte et si status = waiting
  if (
    location.pathname === `/multiplayer/${lobbyId}` &&
    lobby?.status === "waiting"
  ) {
    return <LobbyRoom lobbyId={lobbyId} isHost={isHost} />;
  }

  // Si on n'a pas encore les données du lobby, afficher un loading
  if (
    !lobby &&
    location.pathname === `/multiplayer/${lobbyId}` &&
    !loadingTimeout
  ) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du lobby...</p>
          <p className="text-sm text-gray-400 mt-2">
            Si le problème persiste, vérifiez votre connexion
          </p>
        </div>
      </div>
    );
  }

  // Sinon, affiche la page enfant (game, result, etc.)
  return <Outlet />;
}
