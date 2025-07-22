import { Grid } from "@/components/layout/Grid";
import { Nav } from "@/components/layout/Nav";
import { Providers } from "@/context/Providers";
import { createRootRoute, Outlet } from "@tanstack/react-router";

function RootLayout() {
  return (
    <Providers>
      <Grid>
        <Nav />
        <Outlet />
      </Grid>
    </Providers>
  );
}

export const Route = createRootRoute({
  component: RootLayout,
});
