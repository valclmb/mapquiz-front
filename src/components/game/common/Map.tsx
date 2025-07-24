import { GameContext } from "@/context/GameContext";
import { useTheme } from "@/context/ThemeProvider";
import { useContext, useEffect, useRef, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";

const REGION_CONFIG: Record<
  string,
  { center: [number, number]; zoom: number }
> = {
  Europe: { center: [20, 55], zoom: 2.5 },
  Asie: { center: [100, 40], zoom: 1.8 },
  Afrique: { center: [20, 0], zoom: 2 },
  Océanie: { center: [150, -20], zoom: 2 },
  "Amérique du Sud": { center: [-60, -15], zoom: 2 },
  "Amérique du Nord": { center: [-100, 50], zoom: 2 },
  Monde: { center: [0, 40], zoom: 1 },
};

const ALL_REGIONS = [
  "Europe",
  "Asie",
  "Afrique",
  "Océanie",
  "Amérique du Sud",
  "Amérique du Nord",
];

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

// Fonction d'easing pour une animation plus naturelle
function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

export const Map = ({
  selectedRegions = ["Monde"],
}: {
  selectedRegions?: string[];
}) => {
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

  // Nouvelle logique de zoom/centre
  const isWorld =
    selectedRegions.length === ALL_REGIONS.length &&
    ALL_REGIONS.every((region) => selectedRegions.includes(region));

  let selectedRegion: string;
  if (isWorld || selectedRegions.length === 0) {
    selectedRegion = "Monde";
  } else if (selectedRegions.length === 1) {
    selectedRegion = selectedRegions[0];
  } else {
    selectedRegion = "Monde";
  }
  const { center, zoom } =
    REGION_CONFIG[selectedRegion] || REGION_CONFIG["Monde"];

  // Animation manuelle du zoom et du center
  const [currentZoom, setCurrentZoom] = useState(zoom);
  const [currentCenter, setCurrentCenter] = useState(center);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (
      currentZoom === zoom &&
      currentCenter[0] === center[0] &&
      currentCenter[1] === center[1]
    ) {
      return;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    let start: number | null = null;
    const duration = 500; // ms
    const initialZoom = currentZoom;
    const initialCenter = [...currentCenter];
    function animate(ts: number) {
      if (start === null) start = ts;
      const elapsed = ts - start;
      const t = Math.min(1, elapsed / duration);
      const easedT = easeInOut(t);
      setCurrentZoom(lerp(initialZoom, zoom, easedT));
      setCurrentCenter([
        lerp(initialCenter[0], center[0], easedT),
        lerp(initialCenter[1], center[1], easedT),
      ]);
      if (t < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    }
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom, center]);

  const countryStyle = (key: number) => {
    // Utiliser le code du pays au lieu de l'index
    if (countries[key]?.properties.code === currentCountryCode) {
      return "#60a5fa";
    }
    if (validatedCountries.includes(countries[key]?.properties.code)) {
      return "#22c55e";
    }
    if (incorrectCountries.includes(countries[key]?.properties.code)) {
      return "var(--color-destructive)";
    }
    if (countries[key]?.filtered) {
      return "var(--color-secondary)";
    }

    return theme === "light" ? "black" : "white";
  };

  return (
    <ComposableMap
      className="h-[500px] lg:h-[750px] z-10 w-full rounded-4xl border-2 border-secondary transition-all "
      projection="geoMercator"
      projectionConfig={{
        scale: 140,
        center: [0, 40],
        rotate: [-10, 0, 0],
      }}
    >
      <ZoomableGroup center={currentCenter} zoom={currentZoom}>
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
                    transition: "fill 0.3s ease",
                  },
                  hover: {
                    outline: "none",
                    stroke: theme === "dark" ? "black" : "white",
                    transition: "fill 0.3s ease",
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
