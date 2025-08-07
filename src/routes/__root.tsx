import { Footer } from "@/components/layout/Footer";
import { Grid } from "@/components/layout/Grid";
import { Nav } from "@/components/layout/Nav";
import { Providers } from "@/context/Providers";
import { createRootRoute, Outlet } from "@tanstack/react-router";

function RootLayout() {
  return (
    <Providers>
      <Grid>
        <Nav />
        <main id="main-content" role="main">
          <Outlet />
        </main>
        <Footer />
      </Grid>
    </Providers>
  );
}

export const Route = createRootRoute({
  component: RootLayout,
});
