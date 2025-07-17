import { Nav } from "@/components/layout/Nav";
import { LobbyInvitation } from "@/components/multiplayer/LobbyInvitation";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

export const Route = createRootRoute({
  component: () => (
    <div className="min-h-screen flex flex-col  m-auto">
      <Nav />
      <Outlet />
      <LobbyInvitation />
      <TanStackRouterDevtools />
    </div>
  ),
});
