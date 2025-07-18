import { LobbyRoom } from "@/components/multiplayer/LobbyRoom";
import { useLobbyRoom } from "@/hooks/useLobbyRoom";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock des hooks
vi.mock("@/hooks/useLobbyRoom");
vi.mock("@/hooks/useWebSocket", () => ({
  useWebSocket: () => ({
    isConnected: true,
    sendMessage: vi.fn(),
  }),
}));

const mockUseLobbyRoom = vi.mocked(useLobbyRoom);

describe("LobbyRoom Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseLobbyRoom.mockReturnValue({
      players: [
        { id: "player-1", name: "Player 1", status: "ready" },
        { id: "player-2", name: "Player 2", status: "joined" },
      ],
      settings: {
        selectedRegions: ["Europe"],
        gameMode: "quiz",
      },
      isReady: true,
      isHost: true,
      hostId: "host-user",
      allPlayersReady: false,
      inviteFriend: vi.fn(),
      updateSettings: vi.fn(),
      toggleReady: vi.fn(),
      startGame: vi.fn(),
      leaveLobby: vi.fn(),
    });
  });

  it("should render lobby information", () => {
    render(<LobbyRoom lobbyId="test-lobby" />);

    expect(screen.getByText("test-lobby")).toBeInTheDocument();
    expect(screen.getByText(/Code du lobby/)).toBeInTheDocument();
  });

  it("should display players list", () => {
    render(<LobbyRoom lobbyId="test-lobby" />);

    expect(screen.getByText("Player 1")).toBeInTheDocument();
    expect(screen.getByText("Player 2")).toBeInTheDocument();
    expect(screen.getByText("Prêt")).toBeInTheDocument();
    expect(screen.getByText("Rejoint")).toBeInTheDocument();
  });

  it("should show start game button for host", () => {
    render(<LobbyRoom lobbyId="test-lobby" />);

    const startButton = screen.getByRole("button", {
      name: /Démarrer la partie/i,
    });
    expect(startButton).toBeInTheDocument();
    expect(startButton).not.toBeDisabled();
  });

  it("should show waiting message for non-host", () => {
    mockUseLobbyRoom.mockReturnValue({
      players: [],
      settings: {
        selectedRegions: ["Europe"],
        gameMode: "quiz",
      },
      isReady: false,
      isHost: false,
      hostId: "other-user",
      allPlayersReady: false,
      inviteFriend: vi.fn(),
      updateSettings: vi.fn(),
      toggleReady: vi.fn(),
      startGame: vi.fn(),
      leaveLobby: vi.fn(),
    });

    render(<LobbyRoom lobbyId="test-lobby" />);

    expect(screen.getByText(/En attente de l'hôte/)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Démarrer la partie/i })
    ).not.toBeInTheDocument();
  });

  it("should handle start game action", () => {
    const mockStartGame = vi.fn();
    mockUseLobbyRoom.mockReturnValue({
      players: [],
      settings: {
        selectedRegions: ["Europe"],
        gameMode: "quiz",
      },
      isReady: true,
      isHost: true,
      hostId: "host-user",
      allPlayersReady: false,
      inviteFriend: vi.fn(),
      updateSettings: vi.fn(),
      toggleReady: vi.fn(),
      startGame: mockStartGame,
      leaveLobby: vi.fn(),
    });

    render(<LobbyRoom lobbyId="test-lobby" />);

    const startButton = screen.getByRole("button", {
      name: /Démarrer la partie/i,
    });
    fireEvent.click(startButton);

    expect(mockStartGame).toHaveBeenCalled();
  });

  it("should handle leave lobby action", () => {
    const mockLeaveLobby = vi.fn();
    mockUseLobbyRoom.mockReturnValue({
      players: [],
      settings: {
        selectedRegions: ["Europe"],
        gameMode: "quiz",
      },
      isReady: true,
      isHost: true,
      hostId: "host-user",
      allPlayersReady: false,
      inviteFriend: vi.fn(),
      updateSettings: vi.fn(),
      toggleReady: vi.fn(),
      startGame: vi.fn(),
      leaveLobby: mockLeaveLobby,
    });

    render(<LobbyRoom lobbyId="test-lobby" />);

    const leaveButton = screen.getByRole("button", {
      name: /Quitter le lobby/i,
    });
    fireEvent.click(leaveButton);

    expect(mockLeaveLobby).toHaveBeenCalled();
  });

  it("should show kick button for host", () => {
    render(<LobbyRoom lobbyId="test-lobby" />);

    const kickButtons = screen.getAllByRole("button", { name: /Expulser/i });
    expect(kickButtons.length).toBeGreaterThan(0);
  });

  it("should handle kick player action", () => {
    const mockKickPlayer = vi.fn();
    mockUseLobbyRoom.mockReturnValue({
      players: [{ id: "player-1", name: "Player 1", status: "ready" }],
      settings: {
        selectedRegions: ["Europe"],
        gameMode: "quiz",
      },
      isReady: true,
      isHost: true,
      hostId: "host-user",
      allPlayersReady: false,
      inviteFriend: vi.fn(),
      updateSettings: vi.fn(),
      toggleReady: vi.fn(),
      startGame: vi.fn(),
      leaveLobby: vi.fn(),
    });

    render(<LobbyRoom lobbyId="test-lobby" />);

    const kickButton = screen.getByRole("button", { name: /Expulser/i });
    fireEvent.click(kickButton);

    expect(mockKickPlayer).toHaveBeenCalledWith("player-1");
  });

  it("should show lobby status", () => {
    render(<LobbyRoom lobbyId="test-lobby" />);

    expect(screen.getByText(/Statut : En attente/)).toBeInTheDocument();
  });

  it("should be accessible", () => {
    render(<LobbyRoom lobbyId="test-lobby" />);

    // Vérifier les labels ARIA
    const lobbyName = screen.getByText("test-lobby");
    expect(lobbyName).toHaveAttribute("aria-label", "Nom du lobby");

    // Vérifier la navigation au clavier
    const buttons = screen.getAllByRole("button");
    buttons.forEach((button, index) => {
      expect(button).toHaveAttribute("tabindex", String(index));
    });
  });

  it("should show connection status", () => {
    render(<LobbyRoom lobbyId="test-lobby" />);

    const connectionStatus = screen.getByText(/Connecté/i);
    expect(connectionStatus).toBeInTheDocument();
  });
});
