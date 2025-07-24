import { LobbyProvider } from "@/context/LobbyProvider";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/multiplayer/$lobbyId")({
  component: LobbyParentPage,
});

function LobbyParentPage() {
  const { lobbyId } = Route.useParams();
  console.log("LobbyParentPage MOUNT");
  return (
    <LobbyProvider lobbyId={lobbyId}>
      <Outlet />
    </LobbyProvider>
  );
}
