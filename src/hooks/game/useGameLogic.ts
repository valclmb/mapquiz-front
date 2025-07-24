import { useCallback, useMemo } from "react";

export type Country = {
  properties: {
    name: string;
    capital: string;
    code: string;
    continent: string;
  };
  filtered?: boolean;
};

type GameMode = "quiz" | "practice";

export function useGameLogic(
  countries: Country[],
  validatedCountries: string[],
  incorrectCountries: string[],
  mode: GameMode,
  isMultiplayer: boolean = false
) {
  // Filtrer les pays actifs (non filtrés)
  const activeCountries = useMemo(() => {
    return countries.filter(
      (country) => !("filtered" in country && country.filtered)
    );
  }, [countries]);

  // Calculer si le jeu doit se terminer
  const shouldEndGame = useMemo(() => {
    if (isMultiplayer) {
      // Mode multijoueur : finir quand tous les pays actifs sont traités
      const allActiveCountriesProcessed = activeCountries.every(
        (country) =>
          validatedCountries.includes(country.properties.code) ||
          incorrectCountries.includes(country.properties.code)
      );

      const totalAnswered = validatedCountries.length + incorrectCountries.length;
      const allAnswered = totalAnswered >= activeCountries.length;

      return allActiveCountriesProcessed || allAnswered;
    } else {
      // Mode solo : finir quand tous les pays sont traités
      const allCountriesProcessed = countries.every(
        (country) =>
          validatedCountries.includes(country.properties.code) ||
          incorrectCountries.includes(country.properties.code)
      );

      return (
        allCountriesProcessed ||
        validatedCountries.length === countries.length
      );
    }
  }, [
    activeCountries,
    countries,
    validatedCountries,
    incorrectCountries,
    isMultiplayer,
  ]);

  // Trouver un nouvel index aléatoire pour un pays non validé
  const findNextRandomIndex = useCallback(() => {
    if (shouldEndGame) {
      return mode === "quiz" ? -1 : 404;
    }

    const availableCountries = activeCountries.filter(
      (country) => !validatedCountries.includes(country.properties.code)
    );

    if (availableCountries.length === 0) {
      return mode === "quiz" ? -1 : 404;
    }

    // Trouver l'index dans le tableau original
    const randomAvailableCountry =
      availableCountries[Math.floor(Math.random() * availableCountries.length)];
    
    return activeCountries.findIndex(
      (country) => country.properties.code === randomAvailableCountry.properties.code
    );
  }, [activeCountries, validatedCountries, shouldEndGame, mode]);

  // Valider une réponse
  const validateAnswer = useCallback(
    (countryCode: string, field: string, value: string) => {
      const country = activeCountries.find(
        (c) => c.properties.code === countryCode
      );
      
      if (!country) return false;
      
      const propertyValue = country.properties[field as keyof typeof country.properties]?.toLowerCase();
      return propertyValue === value.toLowerCase();
    },
    [activeCountries]
  );

  return {
    activeCountries,
    shouldEndGame,
    findNextRandomIndex,
    validateAnswer,
  };
}