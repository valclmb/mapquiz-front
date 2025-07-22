import { Providers } from "@/context/Providers";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { createRoot } from "react-dom/client";
import { Toaster } from "./components/ui/sonner";
import "./index.css";
import { routeTree } from "./routeTree.gen";

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById("root")!).render(
  <Providers>
    <RouterProvider router={router} />
    <Toaster richColors />
  </Providers>
);
