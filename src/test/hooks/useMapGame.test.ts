import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useMapGame } from "../../hooks/useMapGame";

// Mock des dépendances
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("useMapGame Hook", () => {
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

  const mockOptions = {
    mode: "quiz" as const,
    onGameEnd: vi.fn(),
    onCorrectAnswer: vi.fn(),
    onIncorrectAnswer: vi.fn(),
  };

  it("should initialize with correct default values", () => {
    const { result } = renderHook(() => useMapGame(mockCountries, mockOptions));

    expect(result.current.countries).toEqual(mockCountries);
    expect(result.current.activeCountries).toEqual(mockCountries);
    expect(result.current.score).toBe(0);
    expect(result.current.gameEnded).toBe(false);
  });

  it("should filter active countries correctly", () => {
    const countriesWithFiltered = [
      ...mockCountries,
      {
        properties: {
          name: "Spain",
          capital: "Madrid",
          code: "ES",
          continent: "Europe",
        },
        filtered: true,
      },
    ];

    const { result } = renderHook(() =>
      useMapGame(countriesWithFiltered, mockOptions)
    );

    expect(result.current.activeCountries).toHaveLength(2);
    expect(result.current.activeCountries).toEqual(mockCountries);
  });

  it("should handle country validation correctly", () => {
    const { result } = renderHook(() => useMapGame(mockCountries, mockOptions));

    // Simuler une validation correcte
    act(() => {
      const event = {
        currentTarget: {
          id: "name",
          value: "France",
        },
      } as React.ChangeEvent<HTMLInputElement>;

      result.current.handleChange(event);
    });

    expect(result.current.validatedCountries).toContain("FR");
  });

  it("should calculate score correctly", () => {
    const { result } = renderHook(() => useMapGame(mockCountries, mockOptions));

    // Simuler plusieurs validations
    act(() => {
      const event1 = {
        currentTarget: {
          id: "name",
          value: "France",
        },
      } as React.ChangeEvent<HTMLInputElement>;

      const event2 = {
        currentTarget: {
          id: "name",
          value: "Germany",
        },
      } as React.ChangeEvent<HTMLInputElement>;

      result.current.handleChange(event1);
      result.current.handleChange(event2);
    });

    expect(result.current.score).toBeGreaterThan(0);
  });

  it("should reset game correctly", () => {
    const { result } = renderHook(() => useMapGame(mockCountries, mockOptions));

    // Simuler une validation
    act(() => {
      const event = {
        currentTarget: {
          id: "name",
          value: "France",
        },
      } as React.ChangeEvent<HTMLInputElement>;

      result.current.handleChange(event);
    });

    expect(result.current.score).toBeGreaterThan(0);

    // Reset
    act(() => {
      result.current.resetGame();
    });

    expect(result.current.score).toBe(0);
    expect(result.current.validatedCountries).toHaveLength(0);
  });
});
