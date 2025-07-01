import { useMemo, useState } from "react";
import type { Country } from "./useMapGame";

export type FilteredCountry = Country & { filtered?: boolean };

export const useFilter = (
  countries: Country[],
  selectedRegions: string[] = []
) => {
  const [filter, setFilter] = useState<string[]>([]);

  const filteredCountries = useMemo(() => {
    // Au lieu de filtrer les pays par région, on les marque tous comme filtrés ou non
    return countries.map((country) => ({
      ...country,
      // Un pays est filtré si:
      // 1. Il est dans une région filtrée par l'utilisateur OU
      // 2. Il n'est pas dans les régions sélectionnées (si des régions sont sélectionnées)
      filtered:
        filter.includes(country?.properties?.continent) ||
        (selectedRegions.length > 0 &&
          !selectedRegions.includes(country?.properties?.continent)),
    }));
  }, [filter, countries, selectedRegions]);

  // Pour la compatibilité avec le code existant, nous filtrons également les pays
  // pour les fonctionnalités qui nécessitent uniquement les pays actifs
  const activeCountries = useMemo(() => {
    return filteredCountries.filter((country) => !country.filtered);
  }, [filteredCountries]);

  return { filteredCountries, activeCountries, filter, setFilter };
};
