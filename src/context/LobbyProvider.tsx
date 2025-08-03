import { useWebSocketContext } from "@/context/WebSocketContext";
import type { LobbyState } from "@/types/lobby";
import { useLocation, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface LobbyContextType {
  lobby: LobbyState | null;
  loading: boolean;
  restartGame: () => void;
}

interface LobbyProviderProps {
  lobbyId: string;
  children: ReactNode;
}

const LobbyContext = createContext<LobbyContextType | null>(null);

export function LobbyProvider({ lobbyId, children }: LobbyProviderProps) {
  const { lastMessage, sendMessage } = useWebSocketContext();
  const [lobby, setLobby] = useState<LobbyState | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = `/multiplayer/${lobbyId}`;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Redirection automatique vers le lobby à la réception de 'game_restarted' pour ce lobby
  useEffect(() => {
    if (
      lastMessage?.type === "game_restarted" &&
      lastMessage.payload?.lobbyId === lobbyId
    ) {
      toast.info("L'hôte a relancé la partie, retour au lobby !");
      // Utilisation de la navigation TanStack Router
      navigate({ to: "/multiplayer/$lobbyId/lobby", params: { lobbyId } });
    }
  }, [lastMessage, lobbyId, navigate]);

  // Gestion de game_end : redirection + envoi automatique de get_game_results
  useEffect(() => {
    if (
      lastMessage?.type === "game_end" &&
      lastMessage.payload?.lobbyId === lobbyId
    ) {
      // Envoyer get_game_results
      sendMessage({
        type: "get_game_results",
        payload: { lobbyId },
      });

      // Redirection automatique vers /result
      navigate({ to: `/multiplayer/${lobbyId}/result` });
    }
  }, [lastMessage, lobbyId, sendMessage, navigate]);

  // Timeout de chargement (10s)
  useEffect(() => {
    if (!lobby && location.pathname.startsWith(basePath)) {
      timeoutRef.current = setTimeout(() => {
        navigate({ to: "/" });
      }, 10000);
    } else {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [lobby, location.pathname, basePath, navigate]);

  // Gestion des messages WebSocket et navigation
  useEffect(() => {
    console.log(
      "[LobbyProvider] lastMessage:",
      lastMessage,
      "lobby:",
      lobby,
      "loading:",
      loading
    );
    if (!lastMessage) return;
    if (lastMessage.type === "error") {
      const errorMessage = lastMessage.message as string;
      console.log("[LobbyProvider] ERREUR:", errorMessage);
      setLoading(false);
      if (errorMessage.includes("pas encore terminée")) {
        navigate({ to: `${basePath}/game`, params: { lobbyId } });
        return;
      }
      if (
        errorMessage.includes("déconnecté") &&
        errorMessage.includes("lobby")
      ) {
        navigate({ to: basePath, params: { lobbyId } });
        return;
      }
      if (
        errorMessage.includes("Lobby non trouvé") ||
        errorMessage.includes("n'existe pas")
      ) {
        toast.error("Lobby introuvable", {
          description: "Ce lobby n'existe pas ou a été supprimé.",
        });
        navigate({ to: "/" });
        return;
      }
      if (
        errorMessage.includes("pas autorisé") ||
        errorMessage.includes("non autorisé")
      ) {
        toast.error("Accès refusé", {
          description: "Vous n'êtes pas autorisé à accéder à ce lobby.",
        });
        navigate({ to: "/" });
        return;
      }
      toast.error("Erreur", { description: errorMessage });
      navigate({ to: "/" });
      return;
    }
    // Ajout : gestion du message game_results
    if (lastMessage.type === "game_results" && lastMessage.payload?.rankings) {
      setLobby((prev: LobbyState | null) => {
        if (!prev || !lastMessage.payload) {
          console.warn(
            "[LobbyProvider] game_results reçu mais lobby précédent null, rankings ignorés"
          );
          return null;
        }
        const next = { ...prev, rankings: lastMessage.payload.rankings };
        console.log("[LobbyProvider] setLobby (game_results):", next);
        return next;
      });
      setLoading(false);
      return;
    }
    if (
      lastMessage.type === "get_game_results_success" &&
      lastMessage.data?.rankings
    ) {
      console.log(
        "[LobbyProvider] get_game_results_success, setLoading(false)"
      );
      setLoading(false);
    }
    if (
      lastMessage.type === "get_game_state_success" ||
      lastMessage.type === "lobby_update" ||
      lastMessage.type === "get_lobby_state_success"
    ) {
      const state = (lastMessage.data?.lobbyState ||
        lastMessage.payload ||
        lastMessage.data?.gameState) as LobbyState | undefined;
      console.log(
        "[LobbyProvider] LOBBY STATE AVANT setLobby:",
        JSON.stringify(state, null, 2)
      );
      console.log("[LobbyProvider] PLAYERS DETAIL:", state?.players);
      if (state && state.lobbyId === lobbyId) {
        setLobby(state);
        setLoading(false);
        console.log("[LobbyProvider] setLobby et setLoading(false)");
      }
    }
  }, [lastMessage, lobbyId, navigate, basePath]);

  // Handler pour relancer la partie
  const restartGame = () => {
    sendMessage({ type: "restart_game", payload: { lobbyId } });
    navigate({ to: basePath });
  };

  return (
    <LobbyContext.Provider value={{ lobby, loading, restartGame }}>
      {children}
    </LobbyContext.Provider>
  );
}

export function useLobby() {
  const ctx = useContext(LobbyContext);
  if (!ctx) throw new Error("useLobby doit être utilisé dans un LobbyProvider");
  return ctx;
}
