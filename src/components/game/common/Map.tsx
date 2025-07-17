import { GameContext } from "@/context/GameContext";
import { useContext } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";

export const Map = () => {
  const gameContext = useContext(GameContext);
  if (!gameContext) throw new Error("gameContext is not defined");
  const { countries, validatedCountries, incorrectCountries, randomIndex } =
    gameContext;

  // Trouver le pays actif correspondant à l'index aléatoire
  const activeCountries = countries.filter(
    (country) => !("filtered" in country && country.filtered)
  );

  // Utiliser le code du pays actif sélectionné
  const currentCountryCode = activeCountries[randomIndex]?.properties.code;

  const countryStyle = (key: number) => {
    // Utiliser le code du pays au lieu de l'index
    if (countries[key]?.properties.code === currentCountryCode) {
      return "violet";
    }
    if (validatedCountries.includes(countries[key]?.properties.code)) {
      return "green";
    }
    if (incorrectCountries.includes(countries[key]?.properties.code)) {
      return "red";
    }

    return "black";
  };

  return (
    <ComposableMap
      className="max-h-screen w-full"
      projection="geoMercator"
      projectionConfig={{
        scale: 140,
        center: [0, 35],
        rotate: [-10, 0, 0],
      }}
    >
      <ZoomableGroup>
        <Geographies geography={countries} stroke="#FFFFFF">
          {({ geographies }) =>
            geographies.map((geo, key) => (
              <Geography
                tabIndex={-1}
                key={geo.rsmKey}
                geography={geo}
                strokeWidth={0.3}
                fill={countryStyle(key)}
                style={{
                  default: {
                    outline: "none",
                    opacity: countries[key]?.filtered ? 0.1 : 1,
                  },
                  hover: {
                    outline: "none",
                    // Garder la même opacité au survol pour les pays filtrés
                    opacity: countries[key]?.filtered ? 0.1 : 1,
                  },
                  pressed: { outline: "none" },
                }}
              />
            ))
          }
        </Geographies>
      </ZoomableGroup>
    </ComposableMap>
  );
};
