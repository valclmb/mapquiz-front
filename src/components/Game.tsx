"use client";

import { GameContext } from "@/context/GameContext";
import { useFilter } from "@/hooks/useFilter";
import { useMap } from "@/hooks/useMap";
import type { GeoJsonProperties } from "geojson";
import { Filter } from "./Filter";
import { Form } from "./Form";
import { Map } from "./Map";
import { Score } from "./Score";
import { Grid } from "./ui-custom/Grid";

type GameProps = {
  countries: GeoJsonProperties[];
};

export const Game = ({ countries }: GameProps) => {
  const { filteredCountries, filter, setFilter } = useFilter(countries);
  const map = useMap(filteredCountries);

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
