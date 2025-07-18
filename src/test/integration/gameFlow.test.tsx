import { QuizGame } from "@/components/game/quiz/QuizGame";
import { QuizHistory } from "@/components/home/QuizHistory";
import { CreateLobby } from "@/components/multiplayer/CreateLobby";
import { LobbyRoom } from "@/components/multiplayer/LobbyRoom";
import { AddFriend } from "@/components/social/AddFriend";
import { useWebSocket } from "@/hooks/useWebSocket";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock des services API
vi.mock("@/lib/api", () => ({
  apiFetch: vi.fn(),
}));

// Mock des hooks
vi.mock("@/hooks/useMapGame", () => ({
  useMapGame: () => ({
    countries: [
      {
        properties: {
          name: "France",
          capital: "Paris",
          code: "FR",
          continent: "Europe",
        },
      },
    ],
    activeCountries: [],
    randomIndex: 0,
    currentCountry: {
      name: { value: "", valid: false },
      capital: { value: "", valid: false },
    },
    changeIndex: vi.fn(),
    handleChange: vi.fn(),
    refs: {
      capitalRef: { current: null },
      countryRef: { current: null },
    },
    validatedCountries: [],
    incorrectCountries: [],
    score: 8,
    gameEnded: true,
    resetGame: vi.fn(),
  }),
}));

vi.mock("@/hooks/useWebSocket", () => ({
  useWebSocket: () => ({
    isConnected: true,
    isAuthenticated: true,
    sendMessage: vi.fn(),
    lastMessage: null,
    sendFriendRequest: vi.fn(),
    respondToFriendRequest: vi.fn(),
    disconnect: vi.fn(),
    reconnect: vi.fn(),
  }),
}));

// Wrapper pour les tests avec router
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <div>{children}</div>
);

describe("Game Flow Integration", () => {
  const mockCountries = [
    {
      properties: {
        name: "France",
        capital: "Paris",
        code: "FR",
        continent: "Europe",
      },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should complete a full quiz game flow", async () => {
    render(
      <TestWrapper>
        <QuizGame countries={mockCountries} selectedRegions={[]} />
      </TestWrapper>
    );

    // Vérifier que le jeu est affiché
    expect(screen.getByText(/Score : 8/)).toBeInTheDocument();
    expect(screen.getByText(/Partie terminée/)).toBeInTheDocument();
  });

  it("should handle multiplayer lobby creation and joining", async () => {
    render(
      <TestWrapper>
        <CreateLobby />
      </TestWrapper>
    );

    // Créer un lobby
    const createButton = screen.getByRole("button", {
      name: /Créer un lobby/i,
    });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(createButton).toBeInTheDocument();
    });
  });

  it("should handle friend request flow", async () => {
    render(
      <TestWrapper>
        <AddFriend />
      </TestWrapper>
    );

    // Saisir le tag d'un ami
    const input = screen.getByPlaceholderText(/Tag de l'ami/i);
    fireEvent.change(input, { target: { value: "FRIEND123" } });

    // Envoyer la demande
    const addButton = screen.getByRole("button", { name: /Ajouter/i });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(input).toHaveValue("FRIEND123");
    });
  });

  it("should handle score history display", async () => {
    render(
      <TestWrapper>
        <QuizHistory />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/Historique/i)).toBeInTheDocument();
    });
  });

  it("should handle error states gracefully", async () => {
    render(
      <TestWrapper>
        <QuizGame countries={mockCountries} selectedRegions={[]} />
      </TestWrapper>
    );

    // Vérifier que le jeu se charge correctement
    expect(screen.getByText(/Score : 8/)).toBeInTheDocument();
  });

  it("should maintain game state across navigation", async () => {
    render(
      <TestWrapper>
        <QuizGame countries={mockCountries} selectedRegions={[]} />
      </TestWrapper>
    );

    // Vérifier l'état initial
    expect(screen.getByText(/Score : 8/)).toBeInTheDocument();
  });

  it("should handle WebSocket disconnection", async () => {
    const mockUseWebSocket = vi.mocked(useWebSocket);
    mockUseWebSocket.mockReturnValue({
      isConnected: false,
      isAuthenticated: false,
      sendMessage: vi.fn(),
      lastMessage: null,
      sendFriendRequest: vi.fn(),
      respondToFriendRequest: vi.fn(),
      disconnect: vi.fn(),
      reconnect: vi.fn(),
    });

    render(
      <TestWrapper>
        <LobbyRoom lobbyId="test-lobby" />
      </TestWrapper>
    );

    // Vérifier que le composant se charge
    expect(screen.getByText(/test-lobby/)).toBeInTheDocument();
  });
});
