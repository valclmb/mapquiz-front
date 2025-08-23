import type { Country } from "@/lib/data";
import { createContext, type ChangeEvent } from "react";

// Étendre le type Country pour inclure la propriété filtered
type FilteredCountry = Country & { filtered?: boolean };

type GameContext = {
  countries: FilteredCountry[]; // Mise à jour du type
  activeCountries: Country[];
  changeIndex: (valid?: boolean) => void;
  validatedCountries: string[];
  incorrectCountries: string[];
  randomIndex: number;
  currentCountry: {
    name: { value: string; valid: boolean };
    capital: { value: string; valid: boolean };
  };
  refs: {
    countryRef: React.RefObject<HTMLInputElement | null>;
    capitalRef: React.RefObject<HTMLInputElement | null>;
  };
  handleChange: (event: ChangeEvent<HTMLInputElement>) => void;
  score: number;
};

export const GameContext = createContext<GameContext | null>(null);
