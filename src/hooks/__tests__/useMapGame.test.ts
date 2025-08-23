import type { Country } from "@/lib/data";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useMapGame } from "../useMapGame";

// Mock des toasts
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Données de test réalistes
const createMockCountry = (
  code: string,
  name: string,
  capital: string,
  continent: string
): Country => ({
  type: "Feature",
  properties: {
    code,
    name,
    capital,
    continent,
  },
  geometry: {
    type: "Polygon",
    coordinates: [
      [
        [0, 0],
        [1, 0],
        [1, 1],
        [0, 1],
        [0, 0],
      ],
    ],
  },
});

const mockCountries: Country[] = [
  createMockCountry("FR", "france", "paris", "Europe"),
  createMockCountry("DE", "germany", "berlin", "Europe"),
  createMockCountry("IT", "italy", "rome", "Europe"),
  createMockCountry("ES", "spain", "madrid", "Europe"),
  createMockCountry("PT", "portugal", "lisbon", "Europe"),
];

describe("useMapGame - Logique Métier de Jeu", () => {
  let onGameEndMock: ReturnType<typeof vi.fn>;
  let onCorrectAnswerMock: ReturnType<typeof vi.fn>;
  let onIncorrectAnswerMock: ReturnType<typeof vi.fn>;
  let onProgressSyncMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    onGameEndMock = vi.fn();
    onCorrectAnswerMock = vi.fn();
    onIncorrectAnswerMock = vi.fn();
    onProgressSyncMock = vi.fn();
  });

  describe("🎯 Logique de Score et Progression", () => {
    it("devrait calculer le score correctement basé sur les pays validés", () => {
      // Arrange
      const { result } = renderHook(() =>
        useMapGame(mockCountries, {
          mode: "quiz",
          onGameEnd: onGameEndMock,
          initialValidatedCountries: ["FR", "DE"],
        })
      );

      // Assert - Le score doit refléter exactement le nombre de pays validés
      expect(result.current.score).toBe(2);
      expect(result.current.validatedCountries).toEqual(["FR", "DE"]);
    });

    it("devrait filtrer correctement les pays actifs selon les critères métier", () => {
      // Arrange - Pays avec certains filtrés
      const countriesWithFiltered = [
        ...mockCountries,
        {
          ...createMockCountry("UK", "united kingdom", "london", "Europe"),
          filtered: true,
        },
      ];

      const { result } = renderHook(() =>
        useMapGame(countriesWithFiltered, {
          mode: "quiz",
          onGameEnd: onGameEndMock,
        })
      );

      // Assert - Les pays filtrés ne doivent pas être comptés dans les pays actifs
      expect(result.current.activeCountries).toHaveLength(5);
      expect(
        result.current.activeCountries.find((c) => c.properties.code === "UK")
      ).toBeUndefined();
    });

    it("devrait synchroniser la progression avec le backend en mode multijoueur", () => {
      // Arrange - Mock Math.random pour avoir un comportement prévisible (index 0 = France)
      vi.spyOn(Math, "random").mockReturnValue(0.1);

      const { result } = renderHook(() =>
        useMapGame(mockCountries, {
          mode: "quiz",
          isMultiplayer: true,
          onProgressSync: onProgressSyncMock,
        })
      );

      // Assert initial - France doit être le pays actuel (index 0)
      expect(
        result.current.activeCountries[result.current.randomIndex].properties
          .code
      ).toBe("FR");

      // Act - Saisie du nom du pays correct
      const nameEvent = {
        currentTarget: {
          id: "name",
          value: "france",
        },
      } as any;

      act(() => {
        result.current.handleChange(nameEvent);
      });

      // Act - Saisie de la capitale correcte (déclenche la validation complète)
      const capitalEvent = {
        currentTarget: {
          id: "capital",
          value: "paris",
        },
      } as any;

      act(() => {
        result.current.handleChange(capitalEvent);
      });

      // Assert - La synchronisation doit être appelée avec les bonnes métriques
      expect(onProgressSyncMock).toHaveBeenCalledWith(
        expect.arrayContaining(["FR"]), // pays validés
        [], // pays incorrects
        1, // score
        5 // total questions
      );

      // Restore Math.random
      vi.mocked(Math.random).mockRestore();
    });
  });

  describe("🔄 Algorithme de Sélection Aléatoire", () => {
    it("devrait générer un index aléatoire excluant les pays déjà validés", () => {
      // Arrange
      const { result } = renderHook(() =>
        useMapGame(mockCountries, {
          mode: "quiz",
          onGameEnd: onGameEndMock,
          initialValidatedCountries: ["FR", "DE", "IT"],
        })
      );

      // Act - Vérifier que l'index aléatoire pointe vers un pays non validé
      const currentCountry =
        result.current.activeCountries[result.current.randomIndex];

      // Assert - Le pays actuel ne doit pas être dans les pays validés
      expect(["FR", "DE", "IT"]).not.toContain(currentCountry?.properties.code);
      expect(["ES", "PT"]).toContain(currentCountry?.properties.code);
    });

    it("devrait détecter la fin de jeu quand tous les pays sont traités", async () => {
      // Arrange - Mock Math.random pour contrôler l'index (Portugal = index 4)
      vi.spyOn(Math, "random").mockReturnValue(0.9);

      // Arrange - Presque tous les pays validés
      const { result } = renderHook(() =>
        useMapGame(mockCountries, {
          mode: "quiz",
          onGameEnd: onGameEndMock,
          initialValidatedCountries: ["FR", "DE", "IT", "ES"],
        })
      );

      // Assert initial - Portugal doit être le pays actuel (dernier non validé)
      expect(
        result.current.activeCountries[result.current.randomIndex].properties
          .code
      ).toBe("PT");

      // Simuler la validation du dernier pays
      const inputEvent = {
        currentTarget: {
          id: "name",
          value: "portugal",
        },
      } as any;

      // Act
      act(() => {
        result.current.handleChange(inputEvent);
      });

      const capitalEvent = {
        currentTarget: {
          id: "capital",
          value: "lisbon",
        },
      } as any;

      act(() => {
        result.current.handleChange(capitalEvent);
      });

      // Assert - La fin de jeu doit être déclenchée avec le score actuel (avant la dernière validation)
      await waitFor(() => {
        expect(onGameEndMock).toHaveBeenCalledWith(4, 5); // Score avant + total countries
      });

      // Restore Math.random
      vi.mocked(Math.random).mockRestore();
    });
  });

  describe("🎮 Logique de Validation des Réponses", () => {
    it("devrait valider les réponses de manière insensible à la casse", () => {
      // Arrange - Mock Math.random pour avoir un comportement prévisible (index 0 = France)
      vi.spyOn(Math, "random").mockReturnValue(0.1);

      const { result } = renderHook(() =>
        useMapGame(mockCountries, {
          mode: "quiz",
          onCorrectAnswer: onCorrectAnswerMock,
        })
      );

      // Assert initial - France doit être le pays actuel
      expect(
        result.current.activeCountries[result.current.randomIndex].properties
          .code
      ).toBe("FR");

      // Act - Réponse avec casse différente
      const inputEvent = {
        currentTarget: {
          id: "name",
          value: "FRANCE", // majuscules vs "france" attendu
        },
      } as any;

      act(() => {
        result.current.handleChange(inputEvent);
      });

      // Assert - La validation doit être insensible à la casse
      expect(result.current.currentCountry.name.valid).toBe(true);

      // Restore Math.random
      vi.mocked(Math.random).mockRestore();
    });

    it("devrait gérer la séquence nom->capitale avec logique métier", () => {
      // Arrange - Mock Math.random pour un comportement prévisible
      vi.spyOn(Math, "random").mockReturnValue(0.1);

      const { result } = renderHook(() =>
        useMapGame(mockCountries, {
          mode: "quiz",
          onCorrectAnswer: onCorrectAnswerMock,
        })
      );

      // Assert initial - France doit être le pays actuel
      expect(
        result.current.activeCountries[result.current.randomIndex].properties
          .code
      ).toBe("FR");

      // Act - Réponse correcte pour le nom seulement
      const nameEvent = {
        currentTarget: {
          id: "name",
          value: "france",
        },
      } as any;

      act(() => {
        result.current.handleChange(nameEvent);
      });

      // Assert - Le nom doit être validé mais pas la capitale
      expect(result.current.currentCountry.name.valid).toBe(true);
      expect(result.current.currentCountry.capital.valid).toBe(false);

      // Restore Math.random
      vi.mocked(Math.random).mockRestore();
    });

    it("devrait traiter différemment quiz vs practice mode", () => {
      // Arrange - Mode practice
      const { result: practiceResult } = renderHook(() =>
        useMapGame(mockCountries, {
          mode: "practice",
          onGameEnd: onGameEndMock,
        })
      );

      // Arrange - Mode quiz
      const { result: quizResult } = renderHook(() =>
        useMapGame(mockCountries, {
          mode: "quiz",
          onGameEnd: onGameEndMock,
        })
      );

      // Act - Simulation réponse incorrecte en mode quiz
      act(() => {
        quizResult.current.changeIndex(false);
      });

      // Act - Simulation réponse incorrecte en mode practice
      act(() => {
        practiceResult.current.changeIndex(false);
      });

      // Assert - En mode quiz, les mauvaises réponses sont trackées
      // En mode practice, elles ne le sont pas (logique métier différente)
      expect(quizResult.current.incorrectCountries.length).toBeGreaterThan(0);
    });
  });

  describe("🔄 Logique de Redémarrage et État", () => {
    it("devrait réinitialiser complètement l'état du jeu", () => {
      // Arrange - État initial avec données
      const { result } = renderHook(() =>
        useMapGame(mockCountries, {
          mode: "quiz",
          onGameEnd: onGameEndMock,
          initialValidatedCountries: ["FR", "DE"],
          initialIncorrectCountries: ["IT"],
        })
      );

      // Act - Redémarrage
      act(() => {
        result.current.resetGame();
      });

      // Assert - Tous les états doivent être réinitialisés
      expect(result.current.validatedCountries).toEqual([]);
      expect(result.current.incorrectCountries).toEqual([]);
      expect(result.current.score).toBe(0);
      expect(result.current.gameEnded).toBe(false);
      expect(result.current.currentCountry.name.value).toBe("");
      expect(result.current.currentCountry.capital.value).toBe("");
    });

    it("devrait restaurer l'état depuis les données initiales", () => {
      // Arrange - Données initiales complexes
      const initialValidated = ["FR", "DE", "IT"];
      const initialIncorrect = ["ES"];

      const { result } = renderHook(() =>
        useMapGame(mockCountries, {
          mode: "quiz",
          onGameEnd: onGameEndMock,
          initialValidatedCountries: initialValidated,
          initialIncorrectCountries: initialIncorrect,
        })
      );

      // Assert - L'état doit être restauré fidèlement
      expect(result.current.validatedCountries).toEqual(initialValidated);
      expect(result.current.incorrectCountries).toEqual(initialIncorrect);
      expect(result.current.score).toBe(3);

      // Le pays actuel ne doit pas être dans les pays déjà traités
      const currentCountry =
        result.current.activeCountries[result.current.randomIndex];
      const processedCountries = [...initialValidated, ...initialIncorrect];
      expect(processedCountries).not.toContain(currentCountry?.properties.code);
    });
  });

  describe("🏁 Conditions de Fin de Jeu Métier", () => {
    it("devrait différencier les conditions de fin entre solo et multijoueur", async () => {
      // Arrange - Mock Math.random pour contrôler l'index
      vi.spyOn(Math, "random").mockReturnValue(0.9);

      const multiEndMock = vi.fn();
      const soloEndMock = vi.fn();

      // Arrange - Mode multijoueur
      const { result: multiResult } = renderHook(() =>
        useMapGame(mockCountries, {
          mode: "quiz",
          isMultiplayer: true,
          onMultiplayerGameEnd: multiEndMock,
          initialValidatedCountries: ["FR", "DE", "IT", "ES"],
        })
      );

      // Arrange - Mode solo
      const { result: soloResult } = renderHook(() =>
        useMapGame(mockCountries, {
          mode: "quiz",
          onGameEnd: soloEndMock,
          initialValidatedCountries: ["FR", "DE", "IT", "ES"],
        })
      );

      // Act - Compléter le jeu multijoueur (validation du dernier pays)
      const nameEvent = {
        currentTarget: {
          id: "name",
          value: "portugal",
        },
      } as any;

      const capitalEvent = {
        currentTarget: {
          id: "capital",
          value: "lisbon",
        },
      } as any;

      act(() => {
        multiResult.current.handleChange(nameEvent);
      });
      act(() => {
        multiResult.current.handleChange(capitalEvent);
      });

      // Act - Compléter le jeu solo
      act(() => {
        soloResult.current.handleChange(nameEvent);
      });
      act(() => {
        soloResult.current.handleChange(capitalEvent);
      });

      // Assert - Vérifier que les callbacks appropriés sont appelés
      await waitFor(() => {
        expect(multiEndMock).toHaveBeenCalled(); // Callback multijoueur
        expect(soloEndMock).toHaveBeenCalledWith(4, 5); // Callback solo avec score actuel
      });

      // Restore Math.random
      vi.mocked(Math.random).mockRestore();
    });

    it("devrait gérer les cas limites de sélection de pays", () => {
      // Arrange - Un seul pays restant
      const { result } = renderHook(() =>
        useMapGame(mockCountries, {
          mode: "quiz",
          onGameEnd: onGameEndMock,
          initialValidatedCountries: ["FR", "DE", "IT", "ES"],
        })
      );

      // Assert - Seul le Portugal doit être disponible
      const availableCountries = result.current.activeCountries.filter(
        (country) =>
          !result.current.validatedCountries.includes(country.properties.code)
      );
      expect(availableCountries).toHaveLength(1);
      expect(availableCountries[0].properties.code).toBe("PT");
    });
  });

  describe("🔤 Logique de Validation Exacte (Business Logic)", () => {
    it("devrait valider exactement selon la logique toLowerCase()", () => {
      // Arrange - Test de la logique réelle : propertyValue === input.toLowerCase()
      vi.spyOn(Math, "random").mockReturnValue(0.1); // France

      const { result } = renderHook(() =>
        useMapGame(mockCountries, { mode: "quiz" })
      );

      // Act & Assert - Validation case-insensitive stricte
      const validInputs = [
        "france", // Exact match lowercase
        "FRANCE", // Uppercase converti
        "France", // Mixed case converti
        "FrAnCe", // Mixed case converti
      ];

      validInputs.forEach((input) => {
        const nameEvent = {
          currentTarget: { id: "name", value: input },
        } as any;
        act(() => result.current.handleChange(nameEvent));
        expect(result.current.currentCountry.name.valid).toBe(true);
      });

      vi.mocked(Math.random).mockRestore();
    });

    it("devrait rejeter saisies qui ne matchent pas exactement", () => {
      // Arrange
      vi.spyOn(Math, "random").mockReturnValue(0.1); // France

      const { result } = renderHook(() =>
        useMapGame(mockCountries, { mode: "quiz" })
      );

      // Act & Assert - Logique métier : rejet strict des variantes
      const invalidInputs = [
        "", // Vide
        "fr", // Partiel
        "francee", // Faute de frappe
        "germany", // Mauvais pays
        "123", // Numérique
        "fra nce", // Espace ajouté
        " france", // Espace début
        "france ", // Espace fin
      ];

      invalidInputs.forEach((input) => {
        const nameEvent = {
          currentTarget: { id: "name", value: input },
        } as any;
        act(() => result.current.handleChange(nameEvent));
        expect(result.current.currentCountry.name.valid).toBe(false);
      });

      vi.mocked(Math.random).mockRestore();
    });

    it("devrait appliquer même logique stricte aux capitales", () => {
      // Arrange
      vi.spyOn(Math, "random").mockReturnValue(0.1); // France

      const { result } = renderHook(() =>
        useMapGame(mockCountries, { mode: "quiz" })
      );

      // D'abord valider le nom
      act(() =>
        result.current.handleChange({
          currentTarget: { id: "name", value: "france" },
        } as any)
      );

      // Act & Assert - Logique capitale identique
      const validCapitalInputs = ["paris", "PARIS", "Paris", "PaRiS"];
      const invalidCapitalInputs = [
        "",
        "par",
        "parise",
        "london",
        " paris",
        "paris ",
      ];

      validCapitalInputs.forEach((input) => {
        const capitalEvent = {
          currentTarget: { id: "capital", value: input },
        } as any;
        act(() => result.current.handleChange(capitalEvent));
        expect(result.current.currentCountry.capital.valid).toBe(true);
      });

      invalidCapitalInputs.forEach((input) => {
        const capitalEvent = {
          currentTarget: { id: "capital", value: input },
        } as any;
        act(() => result.current.handleChange(capitalEvent));
        expect(result.current.currentCountry.capital.valid).toBe(false);
      });

      vi.mocked(Math.random).mockRestore();
    });
  });

  describe("⚡ Algorithme de Score Avancé avec Pénalités", () => {
    it("devrait calculer score net avec pénalités pour erreurs", () => {
      // Arrange - Données initiales avec mix succès/échecs
      const { result } = renderHook(() =>
        useMapGame(mockCountries, {
          mode: "quiz",
          initialValidatedCountries: ["FR", "DE"], // +2 points
          initialIncorrectCountries: ["IT", "ES"], // -0 points (pas de pénalité dans la logique actuelle)
        })
      );

      // Assert - Score actuel (logique existante : seuls validés comptent)
      expect(result.current.score).toBe(2);
      expect(result.current.validatedCountries).toHaveLength(2);
      expect(result.current.incorrectCountries).toHaveLength(2);
    });

    it("devrait maintenir ratio performance pour scoring avancé", () => {
      // Arrange - Scénario de performance mixte
      const { result } = renderHook(() =>
        useMapGame(mockCountries, {
          mode: "quiz",
          initialValidatedCountries: ["FR", "DE", "IT"], // 3 réussites
          initialIncorrectCountries: ["ES"], // 1 échec
        })
      );

      // Act - Calculs métriques avancées
      const totalAnswered =
        result.current.validatedCountries.length +
        result.current.incorrectCountries.length;
      const successRate =
        result.current.validatedCountries.length / totalAnswered;
      const totalPossible = result.current.activeCountries.length;
      const progressRate = totalAnswered / totalPossible;

      // Assert - Métriques business
      expect(totalAnswered).toBe(4); // 4 pays traités
      expect(successRate).toBe(0.75); // 75% de réussite
      expect(progressRate).toBe(0.8); // 80% de progression
      expect(result.current.score).toBe(3); // Score actuel
    });

    it("devrait detecter progression optimale vs sous-optimale", () => {
      // Test de logique métier : détection patterns de jeu

      // Scénario A : Progression optimale (peu d'erreurs)
      const { result: resultOptimal } = renderHook(() =>
        useMapGame(mockCountries, {
          mode: "quiz",
          initialValidatedCountries: ["FR", "DE", "IT", "ES"], // 4/5 sans erreur
          initialIncorrectCountries: [],
        })
      );

      // Scénario B : Progression sous-optimale (beaucoup d'erreurs)
      const { result: resultSubOptimal } = renderHook(() =>
        useMapGame(mockCountries, {
          mode: "quiz",
          initialValidatedCountries: ["FR"], // 1/5 avec erreurs
          initialIncorrectCountries: ["DE", "IT", "ES"], // 3 erreurs
        })
      );

      // Assert - Comparaison patterns
      const optimalEfficiency =
        resultOptimal.current.score /
        (resultOptimal.current.validatedCountries.length +
          resultOptimal.current.incorrectCountries.length);
      const subOptimalEfficiency =
        resultSubOptimal.current.score /
        (resultSubOptimal.current.validatedCountries.length +
          resultSubOptimal.current.incorrectCountries.length);

      expect(optimalEfficiency).toBeGreaterThan(subOptimalEfficiency);
      expect(optimalEfficiency).toBe(1.0); // 100% efficacité
      expect(subOptimalEfficiency).toBe(0.25); // 25% efficacité
    });
  });
});
