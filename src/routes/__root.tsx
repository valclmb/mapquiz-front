import { Nav } from "@/components/layout/Nav";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

export const Route = createRootRoute({
  component: () => (
    <div className="min-h-screen flex flex-col  m-auto">
      <Nav />
      <Outlet />
      <TanStackRouterDevtools />
    </div>
  ),
});
