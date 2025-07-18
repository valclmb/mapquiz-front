import { QuizGame } from "@/components/game/quiz/QuizGame";
import { useMapGame } from "@/hooks/useMapGame";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestWrapper } from "../utils/TestWrapper";

// Mock des hooks et services
vi.mock("@/hooks/useMapGame");
vi.mock("@/hooks/useWebSocket", () => ({
  useWebSocket: () => ({
    isConnected: true,
    sendMessage: vi.fn(),
  }),
}));

const mockUseMapGame = vi.mocked(useMapGame);

describe("QuizGame Component", () => {
  const mockCountries = [
    {
      properties: {
        name: "France",
        capital: "Paris",
        code: "FR",
        continent: "Europe",
      },
    },
    {
      properties: {
        name: "Germany",
        capital: "Berlin",
        code: "DE",
        continent: "Europe",
      },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseMapGame.mockReturnValue({
      countries: mockCountries,
      activeCountries: mockCountries,
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
      score: 0,
      gameEnded: false,
      resetGame: vi.fn(),
    });
  });

  it("should render quiz game interface", () => {
    render(
      <TestWrapper>
        <QuizGame countries={mockCountries} selectedRegions={[]} />
      </TestWrapper>
    );

    expect(screen.getByText(/Score :/)).toBeInTheDocument();
    expect(screen.getByText(/Question/)).toBeInTheDocument();
    expect(screen.getByText(/Temps restant/)).toBeInTheDocument();
  });

  it("should display current score and progress", () => {
    render(
      <TestWrapper>
        <QuizGame countries={mockCountries} selectedRegions={[]} />
      </TestWrapper>
    );

    const scoreElement = screen.getByText(/Score : 0 \/ 10/);
    expect(scoreElement).toBeInTheDocument();

    const questionElement = screen.getByText(/Question 1 \/ 10/);
    expect(questionElement).toBeInTheDocument();
  });

  it("should show timer countdown", () => {
    render(
      <TestWrapper>
        <QuizGame countries={mockCountries} selectedRegions={[]} />
      </TestWrapper>
    );

    const timerElement = screen.getByText(/Temps restant/);
    expect(timerElement).toBeInTheDocument();
  });

  it("should handle country selection", async () => {
    const mockHandleChange = vi.fn();
    mockUseMapGame.mockReturnValue({
      countries: mockCountries,
      activeCountries: mockCountries,
      randomIndex: 0,
      currentCountry: {
        name: { value: "", valid: false },
        capital: { value: "", valid: false },
      },
      changeIndex: vi.fn(),
      handleChange: mockHandleChange,
      refs: {
        capitalRef: { current: null },
        countryRef: { current: null },
      },
      validatedCountries: [],
      incorrectCountries: [],
      score: 0,
      gameEnded: false,
      resetGame: vi.fn(),
    });

    render(
      <TestWrapper>
        <QuizGame countries={mockCountries} selectedRegions={[]} />
      </TestWrapper>
    );

    // Simuler un clic sur un pays
    const countryElement = screen.getByText("France");
    fireEvent.click(countryElement);

    expect(mockHandleChange).toHaveBeenCalled();
  });

  it("should display game over state", () => {
    mockUseMapGame.mockReturnValue({
      countries: mockCountries,
      activeCountries: mockCountries,
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
    });

    render(
      <TestWrapper>
        <QuizGame countries={mockCountries} selectedRegions={[]} />
      </TestWrapper>
    );

    expect(screen.getByText(/Partie terminée/)).toBeInTheDocument();
    expect(screen.getByText(/Score final : 8 \/ 10/)).toBeInTheDocument();
  });

  it("should show restart button when game is finished", () => {
    mockUseMapGame.mockReturnValue({
      countries: mockCountries,
      activeCountries: mockCountries,
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
    });

    render(
      <TestWrapper>
        <QuizGame countries={mockCountries} selectedRegions={[]} />
      </TestWrapper>
    );

    const restartButton = screen.getByRole("button", { name: /Recommencer/i });
    expect(restartButton).toBeInTheDocument();
  });

  it("should be accessible with keyboard navigation", () => {
    render(
      <TestWrapper>
        <QuizGame countries={mockCountries} selectedRegions={[]} />
      </TestWrapper>
    );

    // Vérifier que les éléments sont focusables
    const scoreElement = screen.getByText(/Score :/);
    expect(scoreElement).toHaveAttribute("tabindex", "0");

    // Vérifier l'ordre de tabulation
    const elements = screen.getAllByRole("button");
    elements.forEach((element, index) => {
      expect(element).toHaveAttribute("tabindex", String(index + 1));
    });
  });

  it("should have proper ARIA labels", () => {
    render(
      <TestWrapper>
        <QuizGame countries={mockCountries} selectedRegions={[]} />
      </TestWrapper>
    );

    const scoreElement = screen.getByText(/Score :/);
    expect(scoreElement).toHaveAttribute("aria-label", "Score actuel");

    const timerElement = screen.getByText(/Temps restant/);
    expect(timerElement).toHaveAttribute("aria-label", "Temps restant");
  });
});
