import { LobbyProvider } from "@/context/LobbyProvider";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useWebSocketContext } from "@/context/WebSocketContext";
import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/multiplayer/$lobbyId")({
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

  console.log("LobbyParentPage MOUNT");
  return (
    <LobbyProvider lobbyId={lobbyId}>
      <Outlet />
    </LobbyProvider>
  );
}
