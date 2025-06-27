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
  const { countries, validatedCountries, randomIndex } = gameContext;

  const countryStyle = (key: number) => {
    if (key === randomIndex) {
      return "red";
    }
    if (validatedCountries.includes(countries[key]?.properties.code)) {
      return "green";
    }

    return "black";
  };

  // europe : { scale: 150, center: [70, 50], rotate: [-10, 0, 0] }
  // africa : { scale: 200, center: [0, -25], rotate: [-10, 0, 0] }
  // North america : { scale: 120, center: [-80, 30], rotate: [-10, 0, 0] }
  // South america : { scale: 200, center: [-80, -50], rotate: [-10, 0, 0] }
  // Asia : { scale: 225, center: [80, 0], rotate: [-10, 0, 0] }
  // Oceania : { scale: 275, center: [125, -40], rotate: [-10, 0, 0] }

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
                  default: { outline: "none" },
                  hover: { outline: "none" },
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
