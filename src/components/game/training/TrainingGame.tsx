"use client";

import Typography from "@/components/ui/Typography";
import { GameContext } from "@/context/GameContext";
import { useFilter } from "@/hooks/useFilter";

import { useMapGame } from "@/hooks/useMapGame";
import { CONTINENTS } from "@/lib/constants";
import type { Country } from "@/lib/data";
import { GameControls } from "../common/GameControls";
import { Map } from "../common/Map";

type GameProps = {
  countries: Country[];
};

export const TrainingGame = ({ countries }: GameProps) => {
  const { filteredCountries, filter, setFilter } = useFilter(countries);

  const selectedRegions = CONTINENTS.filter(
    (region) => !filter.includes(region)
  );

  const map = useMapGame(filteredCountries, {
    mode: "practice",
  });

  return (
    <GameContext.Provider value={map}>
      <Typography variant="h2" className="text-center ">
        ENTRAINEMENT
      </Typography>
      <Map selectedRegions={selectedRegions} />
      <GameControls filter={filter} setFilter={setFilter} />
    </GameContext.Provider>
  );
};
