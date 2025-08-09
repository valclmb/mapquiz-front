import { GameContext } from "@/context/GameContext";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Form } from "../Form";

// Mock des composants UI
vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, className, ...props }: any) => (
    <button onClick={onClick} className={className} {...props}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/card", () => ({
  Card: ({ children, className }: any) => (
    <div className={className} data-testid="card">
      {children}
    </div>
  ),
  CardContent: ({ children, className }: any) => (
    <div className={className} data-testid="card-content">
      {children}
    </div>
  ),
}));

vi.mock("@/components/ui/input", () => ({
  Input: ({ ref, autoFocus, ...props }: any) => (
    <input ref={ref} autoFocus={autoFocus} {...props} />
  ),
}));

vi.mock("@/components/ui/label", () => ({
  Label: ({ children, htmlFor }: any) => (
    <label htmlFor={htmlFor}>{children}</label>
  ),
}));

vi.mock("lucide-react", () => ({
  Delete: () => <span data-testid="delete-icon">Delete</span>,
}));

describe("Form - Logique Métier de Validation", () => {
  let mockGameContext: any;
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    vi.clearAllMocks();
    user = userEvent.setup();

    mockGameContext = {
      currentCountry: {
        name: { value: "", valid: false },
        capital: { value: "", valid: false },
      },
      handleChange: vi.fn(),
      refs: {
        countryRef: { current: null },
        capitalRef: { current: null },
      },
      changeIndex: vi.fn(),
      countries: [],
      validatedCountries: [],
      incorrectCountries: [],
      randomIndex: 0,
      activeCountries: [],
      score: 0,
      gameEnded: false,
      resetGame: vi.fn(),
    };
  });

  const renderFormWithContext = (gameContext = mockGameContext) => {
    return render(
      <GameContext.Provider value={gameContext}>
        <Form />
      </GameContext.Provider>
    );
  };

  describe("🎯 Logique Métier de Désactivation Conditionnelle", () => {
    it("devrait désactiver les champs quand les réponses sont validées", () => {
      // Arrange - Contexte avec réponses validées (logique métier critique)
      const contextWithValidAnswers = {
        ...mockGameContext,
        currentCountry: {
          name: { value: "France", valid: true },
          capital: { value: "Paris", valid: true },
        },
      };

      // Act
      renderFormWithContext(contextWithValidAnswers);

      // Assert - Logique métier : empêcher modification après validation
      const countryInput = screen.getByRole("textbox", { name: /pays/i });
      const capitalInput = screen.getByRole("textbox", { name: /capitale/i });

      expect(countryInput).toBeDisabled();
      expect(capitalInput).toBeDisabled();
    });

    it("devrait permettre saisie séquentielle : pays → capitale", () => {
      // Arrange - Contexte avec nom validé, capitale en cours
      const contextWithPartialValidation = {
        ...mockGameContext,
        currentCountry: {
          name: { value: "France", valid: true },
          capital: { value: "Par", valid: false },
        },
      };

      // Act
      renderFormWithContext(contextWithPartialValidation);

      // Assert - Logique métier : progression séquentielle
      const countryInput = screen.getByRole("textbox", { name: /pays/i });
      const capitalInput = screen.getByRole("textbox", { name: /capitale/i });

      expect(countryInput).toBeDisabled(); // Déjà validé
      expect(capitalInput).not.toBeDisabled(); // En cours de validation
    });
  });

  describe("🔄 Logique de Validation en Temps Réel", () => {
    it("devrait marquer aria-invalid pour validation échouée", () => {
      // Arrange - Contexte avec validation partielle échouée
      const contextWithFailedValidation = {
        ...mockGameContext,
        currentCountry: {
          name: { value: "France", valid: true },
          capital: { value: "Wrong", valid: false },
        },
      };

      // Act
      renderFormWithContext(contextWithFailedValidation);

      // Assert - Logique métier : feedback utilisateur immédiat
      const capitalInput = screen.getByRole("textbox", { name: /capitale/i });
      expect(capitalInput).toHaveAttribute("aria-invalid", "true");
    });

    it("devrait maintenir cohérence états UI avec logique business", () => {
      // Arrange - Contexte complexe réaliste
      const complexBusinessContext = {
        ...mockGameContext,
        currentCountry: {
          name: { value: "United Kingdom", valid: true },
          capital: { value: "London", valid: true },
        },
        validatedCountries: ["UK"],
        score: 1,
      };

      // Act
      renderFormWithContext(complexBusinessContext);

      // Assert - Cohérence état business ↔ UI
      const countryInput = screen.getByRole("textbox", { name: /pays/i });
      const capitalInput = screen.getByRole("textbox", { name: /capitale/i });

      expect(countryInput).toBeDisabled();
      expect(capitalInput).toBeDisabled();
      expect(countryInput).toHaveValue("United Kingdom");
      expect(capitalInput).toHaveValue("London");
    });
  });

  describe("🚀 Logique de Progression de Jeu", () => {
    it("devrait maintenir bouton 'passer' fonctionnel après validation", () => {
      // Arrange - État final de validation (cas critique)
      const contextWithCompleteValidation = {
        ...mockGameContext,
        currentCountry: {
          name: { value: "France", valid: true },
          capital: { value: "Paris", valid: true },
        },
      };

      // Act
      renderFormWithContext(contextWithCompleteValidation);

      // Assert - Logique métier : permettre progression même après validation
      const skipButton = screen.getByRole("button", {
        name: /passer au pays suivant/i,
      });
      expect(skipButton).not.toBeDisabled();
    });

    it("devrait déclencher changement d'index via bouton passer", async () => {
      // Arrange
      renderFormWithContext();

      // Act - Clic sur bouton progression
      const skipButton = screen.getByRole("button", {
        name: /passer au pays suivant/i,
      });
      await user.click(skipButton);

      // Assert - Logique métier : progression forcée
      expect(mockGameContext.changeIndex).toHaveBeenCalledTimes(1);
    });
  });

  describe("🎮 Validation Business des Entrées", () => {
    it("devrait empêcher autocomplétion pour intégrité du jeu", () => {
      // Act
      renderFormWithContext();

      // Assert - Logique métier anti-triche : pas d'indices navigateur
      const countryInput = screen.getByRole("textbox", { name: /pays/i });
      const capitalInput = screen.getByRole("textbox", { name: /capitale/i });

      expect(countryInput).toHaveAttribute("autoComplete", "off");
      expect(capitalInput).toHaveAttribute("autoComplete", "off");
    });
  });
});
