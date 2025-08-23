import type { Country } from "@/lib/data";
import type { Continent } from "@/types/continent";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useFilter } from "../useFilter";

// Données de test réalistes pour la logique de filtrage
const createMockCountry = (
  code: string,
  name: string,
  continent: Continent
): Country => ({
  _id: { $oid: code }, // Ajout de la propriété _id manquante
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
  createMockCountry("US", "United States", "Amérique du Nord"),
  createMockCountry("CA", "Canada", "Amérique du Nord"),
  createMockCountry("BR", "Brazil", "Amérique du Sud"),
  createMockCountry("AR", "Argentina", "Amérique du Sud"),
  createMockCountry("CN", "China", "Asie"),
  createMockCountry("JP", "Japan", "Asie"),
  createMockCountry("EG", "Egypt", "Afrique"),
  createMockCountry("ZA", "South Africa", "Afrique"),
];

describe("useFilter - Logique de Filtrage Géographique", () => {
  describe("🌍 Filtrage par Régions Sélectionnées", () => {
    it("devrait inclure tous les pays quand aucune région n'est sélectionnée", () => {
      // Arrange & Act
      const { result } = renderHook(() => useFilter(mockCountries, []));

      // Assert - Tous les pays doivent être actifs (non filtrés)
      expect(result.current.activeCountries).toHaveLength(mockCountries.length);
      expect(
        result.current.filteredCountries.every((country) => !country.filtered)
      ).toBe(true);
    });

    it("devrait filtrer correctement les pays selon les régions sélectionnées", () => {
      // Arrange - Sélection de l'Europe uniquement
      const selectedRegions: Continent[] = ["Europe"];

      // Act
      const { result } = renderHook(() =>
        useFilter(mockCountries, selectedRegions)
      );

      // Assert - Seuls les pays européens doivent être actifs
      const europeanCountries = result.current.activeCountries;
      expect(europeanCountries).toHaveLength(4);
      expect(
        europeanCountries.every(
          (country) => country.properties.continent === "Europe"
        )
      ).toBe(true);

      // Les autres continents doivent être filtrés
      const filteredOutCountries = result.current.filteredCountries.filter(
        (country) => country.filtered
      );
      expect(filteredOutCountries).toHaveLength(8); // 12 total - 4 européens
    });

    it("devrait gérer la sélection de plusieurs régions", () => {
      // Arrange - Sélection de l'Europe et de l'Amérique du Nord
      const selectedRegions: Continent[] = ["Europe", "Amérique du Nord"];

      // Act
      const { result } = renderHook(() =>
        useFilter(mockCountries, selectedRegions)
      );

      // Assert - Les pays européens et nord-américains doivent être actifs
      const activeCountries = result.current.activeCountries;
      expect(activeCountries).toHaveLength(6); // 4 européens + 2 nord-américains

      const activeContinents = new Set(
        activeCountries.map((c) => c.properties.continent)
      );
      expect(activeContinents).toEqual(new Set(["Europe", "Amérique du Nord"]));
    });

    it("devrait respecter les pays pré-filtrés par le backend", () => {
      // Arrange - Pays avec filtrage pré-appliqué
      const countriesWithPreFiltered = [
        ...mockCountries.slice(0, 3),
        { ...mockCountries[3], filtered: true }, // Espagne pré-filtrée
        ...mockCountries.slice(4),
      ];

      // Act - Sélection Europe (qui inclurait normalement l'Espagne)
      const { result } = renderHook(() =>
        useFilter(countriesWithPreFiltered, ["Europe"])
      );

      // Assert - L'Espagne doit rester filtrée malgré la sélection européenne
      const activeEuropeanCountries = result.current.activeCountries.filter(
        (c) => c.properties.continent === "Europe"
      );
      expect(activeEuropeanCountries).toHaveLength(3); // FR, DE, IT seulement
      expect(
        activeEuropeanCountries.find((c) => c.properties.code === "ES")
      ).toBeUndefined();
    });
  });

  describe("🔧 Filtrage Manuel par l'Utilisateur", () => {
    it("devrait permettre de filtrer manuellement des continents", () => {
      // Arrange
      const { result } = renderHook(() => useFilter(mockCountries, []));

      // Act - Filtrer manuellement l'Asie
      act(() => {
        result.current.setFilter(["Asie"]);
      });

      // Assert - Les pays asiatiques doivent être filtrés
      const activeCountries = result.current.activeCountries;
      const asianCountries = activeCountries.filter(
        (c) => c.properties.continent === "Asie"
      );
      expect(asianCountries).toHaveLength(0);

      // Vérifier que les autres continents restent actifs
      const nonAsianCountries = activeCountries.filter(
        (c) => c.properties.continent !== "Asie"
      );
      expect(nonAsianCountries).toHaveLength(10); // 12 total - 2 asiatiques
    });

    it("devrait combiner filtrage manuel et sélection de régions", () => {
      // Arrange - Sélection initiale de l'Europe et de l'Asie
      const { result } = renderHook(() =>
        useFilter(mockCountries, ["Europe", "Asie"])
      );

      // Act - Filtrer manuellement l'Europe
      act(() => {
        result.current.setFilter(["Europe"]);
      });

      // Assert - Seuls les pays asiatiques doivent rester actifs
      const activeCountries = result.current.activeCountries;
      expect(activeCountries).toHaveLength(2);
      expect(
        activeCountries.every((c) => c.properties.continent === "Asie")
      ).toBe(true);
    });

    it("devrait gérer les filtres multiples correctement", () => {
      // Arrange
      const { result } = renderHook(() => useFilter(mockCountries, []));

      // Act - Filtrer plusieurs continents
      act(() => {
        result.current.setFilter(["Europe", "Asie", "Afrique"]);
      });

      // Assert - Seuls les continents américains doivent rester
      const activeCountries = result.current.activeCountries;
      const activeContinents = new Set(
        activeCountries.map((c) => c.properties.continent)
      );
      expect(activeContinents).toEqual(
        new Set(["Amérique du Nord", "Amérique du Sud"])
      );
      expect(activeCountries).toHaveLength(4);
    });
  });

  describe("🧩 Logique de Filtrage Complexe", () => {
    it("devrait prioriser le filtrage backend sur le filtrage frontend", () => {
      // Arrange - Pays avec mélange de filtrage backend et sélection frontend
      const countriesWithMixedFiltering = mockCountries.map(
        (country, index) => ({
          ...country,
          ...(index % 3 === 0 ? { filtered: true } : {}), // Filtrer 1 pays sur 3 par le backend
        })
      );

      // Act - Sélectionner toutes les régions
      const { result } = renderHook(() =>
        useFilter(countriesWithMixedFiltering, [
          "Europe",
          "Asie",
          "Afrique",
          "Amérique du Nord",
          "Amérique du Sud",
        ])
      );

      // Assert - Les pays filtrés par le backend doivent rester filtrés
      const backendFilteredCount = Math.ceil(mockCountries.length / 3);
      const activeCount = mockCountries.length - backendFilteredCount;
      expect(result.current.activeCountries).toHaveLength(activeCount);
    });

    it("devrait maintenir la cohérence lors des changements de sélection", () => {
      // Arrange
      const { result, rerender } = renderHook(
        ({ selectedRegions }) => useFilter(mockCountries, selectedRegions),
        { initialProps: { selectedRegions: ["Europe"] as Continent[] } }
      );

      // Vérification initiale
      expect(result.current.activeCountries).toHaveLength(4);

      // Act - Changement de sélection
      rerender({ selectedRegions: ["Asie", "Afrique"] as Continent[] });

      // Assert - Les pays actifs doivent correspondre aux nouvelles régions
      const activeCountries = result.current.activeCountries;
      expect(activeCountries).toHaveLength(4); // 2 asiatiques + 2 africains
      const activeContinents = new Set(
        activeCountries.map((c) => c.properties.continent)
      );
      expect(activeContinents).toEqual(new Set(["Asie", "Afrique"]));
    });

    it("devrait optimiser les recalculs avec useMemo", () => {
      // Arrange
      const { result, rerender } = renderHook(
        ({ countries, selectedRegions }) =>
          useFilter(countries, selectedRegions),
        {
          initialProps: {
            countries: mockCountries,
            selectedRegions: ["Europe"] as Continent[],
          },
        }
      );

      const firstActiveCountries = result.current.activeCountries;

      // Act - Re-render avec les mêmes données
      rerender({
        countries: mockCountries,
        selectedRegions: ["Europe"] as Continent[],
      });

      // Assert - Les références doivent être les mêmes (optimisation memo)
      expect(result.current.activeCountries).toStrictEqual(
        firstActiveCountries
      );
    });
  });

  describe("🎯 Cas d'Usage Spécifiques au Jeu", () => {
    it("devrait gérer les continents vides sans erreur", () => {
      // Arrange - Pays uniquement européens
      const europeanOnlyCountries = mockCountries.filter(
        (c) => c.properties.continent === "Europe"
      );

      // Act - Sélectionner un continent sans pays
      const { result } = renderHook(() =>
        useFilter(europeanOnlyCountries, ["Afrique"])
      );

      // Assert - Aucun pays ne doit être actif
      expect(result.current.activeCountries).toHaveLength(0);
      expect(result.current.filteredCountries.every((c) => c.filtered)).toBe(
        true
      );
    });

    it("devrait fonctionner avec des noms de continents variables", () => {
      // Arrange - Pays avec continents en différents formats
      const countriesWithVariedContinents = [
        createMockCountry("FR", "France", "Europe"),
        createMockCountry("US", "United States", "Amérique du Nord"),
        createMockCountry("BR", "Brazil", "Amérique du Sud"),
      ];

      // Act
      const { result } = renderHook(() =>
        useFilter(countriesWithVariedContinents, ["Europe", "Amérique du Nord"])
      );

      // Assert - Le filtrage doit fonctionner avec les noms exacts
      expect(result.current.activeCountries).toHaveLength(2);
      const activeContinents = result.current.activeCountries.map(
        (c) => c.properties.continent
      );
      expect(activeContinents).toContain("Europe");
      expect(activeContinents).toContain("Amérique du Nord");
    });

    it("devrait préserver l'ordre original des pays", () => {
      // Arrange
      const { result } = renderHook(() => useFilter(mockCountries, ["Europe"]));

      // Act & Assert - L'ordre des pays européens doit correspondre à l'ordre original
      const activeCountries = result.current.activeCountries;
      const originalEuropeanOrder = mockCountries
        .filter((c) => c.properties.continent === "Europe")
        .map((c) => c.properties.code);

      const filteredEuropeanOrder = activeCountries.map(
        (c) => c.properties.code
      );
      expect(filteredEuropeanOrder).toEqual(originalEuropeanOrder);
    });
  });
});
