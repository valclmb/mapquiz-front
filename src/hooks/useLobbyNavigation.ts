import type { LobbyState } from "@/types/lobby";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface LobbyNavigationParams {
  lobbyId: string;
  lobby: LobbyState | null;
  shouldRedirect: {
    to: "game" | "result" | "lobby" | "home";
    reason?: string;
  } | null;
}

/**
 * Hook pour gérer la navigation dans les lobbies
 * - Gère les redirections automatiques selon le statut du lobby
 * - Gère le timeout de chargement
 *
 * @param {LobbyNavigationParams} params
 */
export function useLobbyNavigation({
  lobbyId,
  lobby,
  shouldRedirect,
}: LobbyNavigationParams) {
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = `/multiplayer/${lobbyId}`;
  const currentPath = location.pathname;
  const isOnLobbyRoute = currentPath.startsWith(basePath);

  // Timeout de chargement (10s sans lobby sur la route du lobby)
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!lobby && currentPath === basePath && !loadingTimeout) {
      timeoutRef.current = setTimeout(() => {
        setLoadingTimeout(true);
      }, 10000);
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setLoadingTimeout(false);
    }
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [lobby, currentPath, basePath, loadingTimeout]);

  // Redirection sur timeout
  useEffect(() => {
    if (loadingTimeout && !lobby && currentPath === basePath) {
      navigate({ to: "/" });
    }
  }, [loadingTimeout, lobby, currentPath, basePath, navigate]);

  // Redirection sur erreur explicite (shouldRedirect)
  useEffect(() => {
    if (shouldRedirect) {
      if (shouldRedirect.to === "game") {
        navigate({ to: `${basePath}/game`, params: { lobbyId } });
      } else if (shouldRedirect.to === "result") {
        navigate({ to: `${basePath}/result`, params: { lobbyId } });
      } else if (shouldRedirect.to === "lobby") {
        navigate({ to: basePath, params: { lobbyId } });
      } else if (shouldRedirect.to === "home") {
        const allowedPaths = [
          `${basePath}`,
          `${basePath}/game`,
          `${basePath}/result`,
        ];
        if (!allowedPaths.includes(currentPath)) {
          navigate({ to: "/" });
        }
      }
      // Toasts d'erreur centralisés
      if (shouldRedirect.to === "home") {
        if (
          shouldRedirect.reason?.includes("pas autorisé") ||
          shouldRedirect.reason?.includes("non autorisé")
        ) {
          toast.error("Accès refusé", {
            description:
              "Vous n'êtes pas autorisé à accéder à ce lobby. Veuillez demander une invitation à l'hôte.",
          });
        } else if (shouldRedirect.reason?.includes("Lobby non trouvé")) {
          toast.error("Lobby introuvable", {
            description: "Ce lobby n'existe pas ou a été supprimé.",
          });
        } else if (shouldRedirect.reason) {
          toast.error("Erreur", {
            description: shouldRedirect.reason,
          });
        }
      }
    }
  }, [shouldRedirect, lobbyId, navigate, currentPath, basePath]);

  // Redirection centralisée selon le status du lobby
  useEffect(() => {
    if (lobby && isOnLobbyRoute) {
      if (lobby.status === "playing" && currentPath !== `${basePath}/game`) {
        navigate({ to: `${basePath}/game`, params: { lobbyId } });
      } else if (
        lobby.status === "finished" &&
        currentPath !== `${basePath}/result`
      ) {
        navigate({ to: `${basePath}/result`, params: { lobbyId } });
      } else if (lobby.status === "waiting" && currentPath !== basePath) {
        navigate({ to: basePath, params: { lobbyId } });
      }
    }
  }, [lobby, currentPath, lobbyId, navigate, basePath, isOnLobbyRoute]);
}
