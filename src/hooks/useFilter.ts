import { useMemo, useState } from "react";
import type { Country } from "./useMapGame";

export type FilteredCountry = Country & { filtered?: boolean };

export const useFilter = (
  countries: Country[],
  selectedRegions: string[] = []
) => {
  const [filter, setFilter] = useState<string[]>([]);

  const filteredCountries = useMemo(() => {
    // Si les pays ont déjà la propriété filtered (venant du backend), l'utiliser directement
    // Sinon, appliquer la logique de filtrage côté frontend
    return countries.map((country) => {
      // Si le pays a déjà la propriété filtered, l'utiliser
      if ("filtered" in country) {
        return country;
      }

      // Sinon, appliquer la logique de filtrage côté frontend
      return {
        ...country,
        // Un pays est filtré si:
        // 1. Il est dans une région filtrée par l'utilisateur OU
        // 2. Il n'est pas dans les régions sélectionnées (si des régions sont sélectionnées)
        // Si selectedRegions est vide, aucun pays n'est filtré
        filtered:
          filter.includes(country?.properties?.continent) ||
          (selectedRegions.length > 0 &&
            !selectedRegions.includes(country?.properties?.continent)),
      };
    });
  }, [filter, countries, selectedRegions]);

  // Pour la compatibilité avec le code existant, nous filtrons également les pays
  // pour les fonctionnalités qui nécessitent uniquement les pays actifs
  const activeCountries = useMemo(() => {
    return filteredCountries.filter((country) => !country.filtered);
  }, [filteredCountries]);

  return { filteredCountries, activeCountries, filter, setFilter };
};
