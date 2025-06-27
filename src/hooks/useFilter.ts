import type { GeoJsonProperties } from "geojson";
import { useEffect, useState } from "react";

export const useFilter = (countries: GeoJsonProperties[]) => {
  const [filter, setFilter] = useState<string[]>([]);
  const [filteredCountries, setFilteredCountries] = useState<
    GeoJsonProperties[]
  >([]);
  console.log(filter);

  useEffect(() => {
    setFilteredCountries(
      countries.filter(
        (country) => !filter.includes(country?.properties.continent)
      )
    );
  }, [filter, countries]);

  return { filteredCountries, filter, setFilter };
};
