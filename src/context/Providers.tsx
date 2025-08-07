import { Toaster } from "@/components/ui/sonner";
import { WebSocketProvider } from "@/context/WebSocketContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { ThemeProvider } from "./ThemeProvider"; // adapte le chemin selon ta lib

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <WebSocketProvider
          onLobbyJoined={(lobbyId) => {
            if (lobbyId) {
              router.navigate({
                to: "/multiplayer/$lobbyId",
                params: { lobbyId },
              });
            } else {
              router.navigate({ to: "/" });
            }
          }}
          onGameStart={(lobbyId) => {
            router.navigate({
              to: "/multiplayer/$lobbyId/game",
              params: { lobbyId },
            });
          }}
        >
          {children}
          <Toaster richColors position="top-center" />
        </WebSocketProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
