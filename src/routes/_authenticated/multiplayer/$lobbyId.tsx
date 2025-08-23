import { LobbyProvider } from "@/context/LobbyProvider";
import { useWebSocketContext } from "@/context/WebSocketContext";
import { authClient } from "@/lib/auth-client";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/_authenticated/multiplayer/$lobbyId")({
  component: LobbyParentPage,
});

function LobbyParentPage() {
  const { lobbyId } = Route.useParams();
  const { sendMessage } = useWebSocketContext();
  const { data: session } = authClient.useSession();

  useEffect(() => {
    if (lobbyId && session?.user?.id) {
      sendMessage({
        type: "join_lobby",
        payload: { lobbyId },
      });
    }
  }, [lobbyId, session?.user?.id, sendMessage]);

  // Nettoyer les ressources lors du démontage du composant
  useEffect(() => {
    const handleBeforeUnload = () => {
      console.log("🔍 [LobbyParentPage] beforeunload triggered");
      sendMessage({
        type: "leave_lobby",
        payload: { lobbyId },
      });
    };

    // Ajouter le gestionnaire beforeunload
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      // Nettoyer le gestionnaire
      window.removeEventListener("beforeunload", handleBeforeUnload);

      // Envoyer leave_lobby quand le composant se démonte (navigation vers une autre page)
      console.log("🔍 [LobbyParentPage] component unmounting");
      sendMessage({
        type: "leave_lobby",
        payload: { lobbyId },
      });
    };
  }, [sendMessage, lobbyId]);

  console.log("LobbyParentPage MOUNT");
  return (
    <LobbyProvider lobbyId={lobbyId}>
      <Outlet />
    </LobbyProvider>
  );
}
