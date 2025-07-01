"use client";

import { Grid } from "@/components/layout/Grid";
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
  const map = useMapGame(filteredCountries, {
    mode: "practice",
  });
  console.log(map);

  return (
    <GameContext.Provider value={map}>
      <Filter filter={filter} setFilter={setFilter} />
      <Grid>
        <Map />
      </Grid>
      <Form />
      <Score />
    </GameContext.Provider>
  );
};
