import { LobbyRoom } from "@/components/multiplayer/LobbyRoom";
import { useLobbyStatus } from "@/hooks/useLobbyStatus";
import {
  createFileRoute,
  Outlet,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/multiplayer/$lobbyId")({
  component: LobbyParentPage,
});

function LobbyParentPage() {
  const { lobbyId } = Route.useParams();
  const [isHost, setIsHost] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const { lobby, shouldRedirect } = useLobbyStatus(lobbyId);
  const navigate = useNavigate();
  const location = useLocation();

  // Log à chaque render pour diagnostiquer navigation et status
  console.log("LobbyParentPage - Render", {
    pathname: location.pathname,
    lobbyStatus: lobby?.status,
    lobbyId,
    shouldRedirect,
  });

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

  // Redirection forcée basée sur les erreurs WebSocket
  useEffect(() => {
    if (shouldRedirect) {
      const basePath = `/multiplayer/${lobbyId}`;
      console.log(
        `LobbyParentPage - Redirection forcée vers ${shouldRedirect.to}: ${shouldRedirect.reason}`
      );

      // Afficher une notification toast pour les redirections vers l'accueil
      if (shouldRedirect.to === "home") {
        if (
          shouldRedirect.reason.includes("pas autorisé") ||
          shouldRedirect.reason.includes("non autorisé")
        ) {
          toast.error("Accès refusé", {
            description:
              "Vous n'êtes pas autorisé à accéder à ce lobby. Veuillez demander une invitation à l'hôte.",
          });
        } else if (shouldRedirect.reason.includes("Lobby non trouvé")) {
          toast.error("Lobby introuvable", {
            description: "Ce lobby n'existe pas ou a été supprimé.",
          });
        } else {
          toast.error("Erreur", {
            description: shouldRedirect.reason,
          });
        }
      }

      if (shouldRedirect.to === "game") {
        navigate({ to: `${basePath}/game`, params: { lobbyId } });
      } else if (shouldRedirect.to === "result") {
        navigate({ to: `${basePath}/result`, params: { lobbyId } });
      } else if (shouldRedirect.to === "lobby") {
        navigate({ to: basePath, params: { lobbyId } });
      } else if (shouldRedirect.to === "home") {
        navigate({ to: "/" });
      }
    }
  }, [shouldRedirect, lobbyId, navigate, location.pathname]);

  // Redirection centralisée selon le status du lobby
  useEffect(() => {
    const basePath = `/multiplayer/${lobbyId}`;
    const currentPath = location.pathname;
    const isOnLobbyRoute = currentPath.startsWith(basePath);

    // Ne faire la redirection que si on est sur une route de lobby
    if (lobby && isOnLobbyRoute) {
      // Si on est en train de jouer, rediriger vers la partie
      if (lobby.status === "playing") {
        if (currentPath !== `${basePath}/game`) {
          console.log("LobbyParentPage - Redirection vers la partie en cours");
          navigate({ to: `${basePath}/game`, params: { lobbyId } });
          return;
        }
      }

      // Si la partie est terminée, rediriger vers les résultats
      if (lobby.status === "finished") {
        if (currentPath !== `${basePath}/result`) {
          console.log("LobbyParentPage - Redirection vers les résultats");
          navigate({ to: `${basePath}/result`, params: { lobbyId } });
          return;
        }
      }

      // Si on est en attente, rediriger vers le lobby
      if (lobby.status === "waiting") {
        if (currentPath !== basePath) {
          console.log("LobbyParentPage - Redirection vers le lobby");
          navigate({ to: basePath, params: { lobbyId } });
          return;
        }
      }
    }
  }, [lobby, location.pathname, lobbyId, navigate]);

  // Affiche le lobby UNIQUEMENT sur la route exacte et si status = waiting
  const isOnLobbyPage =
    location.pathname === `/multiplayer/${lobbyId}` ||
    location.pathname === `/multiplayer/${lobbyId}/`;

  if (isOnLobbyPage && lobby?.status === "waiting") {
    console.log("LobbyParentPage - Affichage du LobbyRoom");
    return <LobbyRoom lobbyId={lobbyId} isHost={isHost} />;
  }

  // Si on n'a pas encore les données du lobby, afficher un loading
  console.log("LobbyParentPage - Vérification affichage loading:", {
    hasLobby: !!lobby,
    pathname: location.pathname,
    expectedPath: `/multiplayer/${lobbyId}`,
    loadingTimeout,
    isOnLobbyPage,
    shouldShowLoading: !lobby && isOnLobbyPage && !loadingTimeout,
  });

  if (!lobby && isOnLobbyPage && !loadingTimeout) {
    console.log("LobbyParentPage - Affichage du loading");
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
