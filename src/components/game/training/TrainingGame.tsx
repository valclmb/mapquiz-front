"use client";

import Typography from "@/components/ui/Typography";
import { GameContext } from "@/context/GameContext";
import { useFilter } from "@/hooks/useFilter";
import type { Country } from "@/hooks/useMapGame";
import { useMapGame } from "@/hooks/useMapGame";
import { Filter } from "../common/Filter";
import { Form } from "../common/Form";
import { Map } from "../common/Map";
import { Score } from "../common/Score";

type GameProps = {
  countries: Country[];
};

export const TrainingGame = ({ countries }: GameProps) => {
  const { filteredCountries, filter, setFilter } = useFilter(countries);

  const ALL_REGIONS = [
    "Europe",
    "Asie",
    "Afrique",
    "Océanie",
    "Amérique du Sud",
    "Amérique du Nord",
  ];
  const selectedRegions = ALL_REGIONS.filter(
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
      <Form />
      <div className="flex items-center gap-4 ml-8 mt-4">
        <Filter filter={filter} setFilter={setFilter} />
        <Score />
      </div>
    </GameContext.Provider>
  );
};
