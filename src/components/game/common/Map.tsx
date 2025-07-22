import { GameContext } from "@/context/GameContext";
import { useTheme } from "@/context/ThemeProvider";
import { useContext } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";

export const Map = () => {
  const { theme } = useTheme();
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
      return "#ec4899";
    }
    if (validatedCountries.includes(countries[key]?.properties.code)) {
      return "#10b981";
    }
    if (incorrectCountries.includes(countries[key]?.properties.code)) {
      return "var(--color-destructive)";
    }
    if (countries[key]?.filtered) {
      return "var(--color-secondary)";
    }

    return "var(--color-primary)";
  };

  return (
    <ComposableMap
      className="h-[750px] w-full rounded-4xl border-2 border-secondary "
      projection="geoMercator"
      projectionConfig={{
        scale: 140,
        center: [0, 40],
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
                strokeWidth={0.6}
                fill={countryStyle(key)}
                style={{
                  default: {
                    outline: "none",
                    stroke: theme === "dark" ? "black" : "white",
                  },
                  hover: {
                    outline: "none",
                    stroke: theme === "dark" ? "black" : "white",
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
