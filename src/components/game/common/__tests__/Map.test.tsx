import { GameContext } from "@/context/GameContext";
import type { Country } from "@/lib/data";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Map } from "../Map";

// Mock de react-simple-maps
vi.mock("react-simple-maps", () => ({
  ComposableMap: ({ children, ...props }: any) => (
    <div data-testid="composable-map" {...props}>
      {children}
    </div>
  ),
  ZoomableGroup: ({ children, center, zoom }: any) => (
    <div data-testid="zoomable-group" data-center={center} data-zoom={zoom}>
      {children}
    </div>
  ),
  Geographies: ({ children, geography }: any) => (
    <div data-testid="geographies">{children({ geographies: geography })}</div>
  ),
  Geography: ({ geography, onClick, fill, ...props }: any) => (
    <div
      data-testid={`geography-${geography.properties.code}`}
      data-fill={fill}
      onClick={() => onClick?.(geography)}
      style={{ backgroundColor: fill }}
      {...props}
    >
      {geography.properties.name}
    </div>
  ),
}));

// Mock de lucide-react
vi.mock("lucide-react", () => ({
  ZoomIn: () => <div data-testid="zoom-icon">ZoomIn</div>,
}));

// Données de test pour les pays
const createMockCountry = (
  code: string,
  name: string,
  continent: string
): Country => ({
  type: "Feature",
  properties: {
    code,
    name,
    capital: `${name.toLowerCase()}-capital`,
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
  createMockCountry("FR", "France", "Europe"),
  createMockCountry("DE", "Germany", "Europe"),
  createMockCountry("IT", "Italy", "Europe"),
  createMockCountry("ES", "Spain", "Europe"),
  createMockCountry("PT", "Portugal", "Europe"),
];

describe("Map - Logique Métier de Visualisation", () => {
  let mockGameContext: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockGameContext = {
      countries: mockCountries,
      validatedCountries: [],
      incorrectCountries: [],
      randomIndex: 0,
      activeCountries: mockCountries,
      score: 0,
      gameEnded: false,
      currentCountry: {
        name: { value: "", valid: false },
        capital: { value: "", valid: false },
      },
      changeIndex: vi.fn(),
      handleChange: vi.fn(),
      refs: { capitalRef: { current: null }, countryRef: { current: null } },
      resetGame: vi.fn(),
    };
  });

  const renderMapWithContext = (
    gameContext = mockGameContext,
    selectedRegions = ["Monde"]
  ) => {
    return render(
      <GameContext.Provider value={gameContext}>
        <Map selectedRegions={selectedRegions} />
      </GameContext.Provider>
    );
  };

  describe("🎨 Algorithme de Coloration Différentielle", () => {
    it("devrait appliquer l'algorithme de couleurs selon l'état business", () => {
      // Arrange - États business complexes simultanés
      const contextWithBusinessStates = {
        ...mockGameContext,
        validatedCountries: ["FR", "DE"], // Pays réussis
        incorrectCountries: ["IT"], // Pays échoués
        randomIndex: 3, // Espagne = pays actuel
      };

      // Act
      renderMapWithContext(contextWithBusinessStates);

      // Assert - Algorithme de coloration métier
      const franceElement = screen.getByTestId("geography-FR");
      const germanyElement = screen.getByTestId("geography-DE");
      const italyElement = screen.getByTestId("geography-IT");
      const spainElement = screen.getByTestId("geography-ES");

      // Logique métier : Succès = Vert
      expect(franceElement).toHaveAttribute("data-fill", "#22c55e");
      expect(germanyElement).toHaveAttribute("data-fill", "#22c55e");

      // Logique métier : Échec = Rouge
      expect(italyElement).toHaveAttribute(
        "data-fill",
        "var(--color-destructive)"
      );

      // Logique métier : Actuel = Bleu (priorité)
      expect(spainElement).toHaveAttribute("data-fill", "#60a5fa");
    });

    it("devrait prioriser couleur 'incorrect' sur état 'actuel'", () => {
      // Arrange - Conflit d'états : pays actuel déjà dans incorrects
      const contextWithStateConflict = {
        ...mockGameContext,
        incorrectCountries: ["FR"], // France déjà échouée
        randomIndex: 0, // Mais France est aussi pays actuel
      };

      // Act
      renderMapWithContext(contextWithStateConflict);

      // Assert - Logique métier : "incorrect" prioritaire sur "actuel" (ordre du code)
      const franceElement = screen.getByTestId("geography-FR");
      expect(franceElement).toHaveAttribute(
        "data-fill",
        "var(--color-destructive)"
      ); // Rouge prioritaire
    });
  });

  describe("🔄 Logique d'État et Robustesse", () => {
    it("devrait prioriser état 'incorrect' sur état normal quand pas de conflit", () => {
      // Arrange - Pays incorrect sans conflit avec "actuel"
      const contextWithIncorrect = {
        ...mockGameContext,
        incorrectCountries: ["DE"], // Allemagne incorrecte
        randomIndex: 0, // France actuelle (pas de conflit)
      };

      // Act
      renderMapWithContext(contextWithIncorrect);

      // Assert - Logique de priorité
      const franceElement = screen.getByTestId("geography-FR");
      const germanyElement = screen.getByTestId("geography-DE");

      expect(franceElement).toHaveAttribute("data-fill", "#60a5fa"); // Actuel (bleu)
      expect(germanyElement).toHaveAttribute(
        "data-fill",
        "var(--color-destructive)"
      ); // Incorrect (rouge)
    });
  });

  describe("🌍 Algorithme de Zoom Géographique Intelligent", () => {
    it("devrait calculer zoom optimal pour régions spécifiques", () => {
      // Test logique métier : zoom Europe
      renderMapWithContext(mockGameContext, ["Europe"]);

      // Assert - Zoom Europe (rapproché)
      const zoomableGroup = screen.getByTestId("zoomable-group");
      expect(zoomableGroup).toHaveAttribute("data-zoom", "2.5");
      expect(zoomableGroup).toHaveAttribute("data-center", "20,55");
    });

    it("devrait utiliser zoom monde par défaut", () => {
      // Test logique métier : zoom Monde
      renderMapWithContext(mockGameContext, ["Monde"]);

      // Assert - Zoom Monde (vue globale)
      const zoomableGroup = screen.getByTestId("zoomable-group");
      expect(zoomableGroup).toHaveAttribute("data-zoom", "1");
      expect(zoomableGroup).toHaveAttribute("data-center", "0,40");
    });

    it("devrait adapter zoom pour régions multiples", () => {
      // Arrange - Logique complexe : plusieurs régions sélectionnées
      renderMapWithContext(mockGameContext, ["Europe", "Asie"]);

      // Assert - Algorithme de zoom pour multi-régions
      const zoomableGroup = screen.getByTestId("zoomable-group");
      expect(zoomableGroup).toHaveAttribute("data-zoom", "1"); // Vue globale par défaut
    });
  });

  describe("🎮 Logique de Rendu de Pays", () => {
    it("devrait rendre tous les pays du contexte fourni", () => {
      // Arrange - Mix de pays européens et autres
      const mixedCountries = [
        ...mockCountries,
        createMockCountry("US", "United States", "Amérique du Nord"),
        createMockCountry("JP", "Japan", "Asie"),
      ];

      const contextWithMixedCountries = {
        ...mockGameContext,
        countries: mixedCountries,
        activeCountries: mixedCountries,
      };

      // Act
      renderMapWithContext(contextWithMixedCountries, ["Monde"]);

      // Assert - Tous les pays du contexte sont rendus
      expect(screen.getByTestId("geography-FR")).toBeInTheDocument();
      expect(screen.getByTestId("geography-DE")).toBeInTheDocument();
      expect(screen.getByTestId("geography-IT")).toBeInTheDocument();
      expect(screen.getByTestId("geography-ES")).toBeInTheDocument();
      expect(screen.getByTestId("geography-PT")).toBeInTheDocument();
      expect(screen.getByTestId("geography-US")).toBeInTheDocument();
      expect(screen.getByTestId("geography-JP")).toBeInTheDocument();
    });
  });

  describe("🔒 Logique de Robustesse Métier", () => {
    it("devrait gérer gracieusement randomIndex invalide", () => {
      // Arrange - Index hors limites (cas edge métier)
      const contextWithInvalidIndex = {
        ...mockGameContext,
        randomIndex: 999, // Index impossible
      };

      // Act & Assert - Pas d'erreur, comportement gracieux
      expect(() => {
        renderMapWithContext(contextWithInvalidIndex);
      }).not.toThrow();
    });

    it("devrait fonctionner avec liste pays vide", () => {
      // Arrange - Cas edge : pas de pays actifs
      const contextWithNoCountries = {
        ...mockGameContext,
        countries: [],
        activeCountries: [],
      };

      // Act & Assert - Robustesse métier
      expect(() => {
        renderMapWithContext(contextWithNoCountries);
      }).not.toThrow();

      expect(screen.getByTestId("composable-map")).toBeInTheDocument();
    });
  });
});
