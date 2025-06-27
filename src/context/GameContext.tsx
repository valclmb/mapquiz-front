import type { GeoJsonProperties } from "geojson";
import { createContext } from "react";

type GameContext = {
  countries: GeoJsonProperties[];
  changeIndex: (valid?: boolean) => void;
  validatedCountries: string[];
  randomIndex: number;
  currentCountry: {
    name: { value: string; valid: boolean };
    capital: { value: string; valid: boolean };
  };
  refs: {
    countryRef: React.RefObject<HTMLInputElement>;
    capitalRef: React.RefObject<HTMLInputElement>;
  };
  handleChange: (event: unknown) => void;
  score: number;
};

export const GameContext = createContext<GameContext | null>(null);
