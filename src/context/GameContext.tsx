import type { Country } from "@/hooks/useMapGame";
import { createContext, type ChangeEvent } from "react";

// Étendre le type Country pour inclure la propriété filtered
type FilteredCountry = Country & { filtered?: boolean };

type GameContext = {
  countries: FilteredCountry[];
  activeCountries: Country[];
  validatedCountries: string[];
  incorrectCountries: string[];
  randomIndex: number;
  currentCountry: {
    name: { value: string; valid: boolean };
    capital: { value: string; valid: boolean };
  };
  countryRef: React.RefObject<HTMLInputElement | null>;
  capitalRef: React.RefObject<HTMLInputElement | null>;
  handleChange: (event: ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: () => void;
  handleKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  score: number;
  gameEnded: boolean;
  reset: () => void;
};

export const GameContext = createContext<GameContext | null>(null);
