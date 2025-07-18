import { QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { WebSocketProvider } from "../../context/WebSocketContext";
import { createTestQueryClient } from "./testUtils";

// Wrapper complet pour les tests avec tous les providers
export const TestWrapper = ({ children }: { children: ReactNode }) => {
  const queryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <WebSocketProvider>{children}</WebSocketProvider>
    </QueryClientProvider>
  );
};
