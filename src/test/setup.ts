import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeAll, vi } from "vitest";

// Nettoyer automatiquement après chaque test
afterEach(() => {
  cleanup();
});

// Configuration globale pour les tests
beforeAll(() => {
  // Mock de window.matchMedia pour les tests responsive
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // Mock de ResizeObserver
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // Mock de IntersectionObserver
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // Mock de console.log pour éviter la pollution
  vi.spyOn(console, "log").mockImplementation(() => {});
});

// Mock global de WebSocket pour les tests
const mockWebSocket = {
  send: vi.fn(),
  close: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  readyState: 1, // WebSocket.OPEN
};

global.WebSocket = vi.fn(() => mockWebSocket) as unknown as typeof WebSocket;

// Mock de l'environnement vite
vi.mock("@/lib/auth-client", () => ({
  authClient: {
    useSession: vi.fn(() => ({
      data: {
        user: {
          id: "test-user-id",
          name: "Test User",
          tag: "TEST123",
        },
      },
    })),
  },
}));

// Mock sonner pour éviter les toasts pendant les tests
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));
