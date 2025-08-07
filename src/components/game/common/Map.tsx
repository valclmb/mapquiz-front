import { Button } from "@/components/ui/button";
import { GameContext } from "@/context/GameContext";
import { CONTINENTS } from "@/lib/constants";
import { ZoomIn } from "lucide-react";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
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

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

// Fonction d'easing pour une animation plus naturelle
function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

// Fonction pour calculer le centre d'un pays à partir de ses coordonnées
function calculateCountryCenter(geometry: {
  type: string;
  coordinates: number[][][] | number[][][][];
}): [number, number] {
  if (!geometry || !geometry.coordinates) {
    return [0, 0];
  }

  let allCoords: [number, number][] = [];

  if (geometry.type === "Polygon") {
    // Pour un polygone simple, prendre le premier ring (externe)
    const coords = (geometry.coordinates as number[][][])[0];
    allCoords = coords.map((coord) => [coord[0], coord[1]] as [number, number]);
  } else if (geometry.type === "MultiPolygon") {
    // Pour un multipolygone, concaténer tous les rings
    (geometry.coordinates as number[][][][]).forEach(
      (polygon: number[][][]) => {
        polygon.forEach((ring: number[][]) => {
          const ringCoords = ring.map(
            (coord) => [coord[0], coord[1]] as [number, number]
          );
          allCoords = allCoords.concat(ringCoords);
        });
      }
    );
  }

  if (allCoords.length === 0) {
    return [0, 0];
  }

  // Calculer le centre en faisant la moyenne des coordonnées
  const sumLng = allCoords.reduce((sum, coord) => sum + coord[0], 0);
  const sumLat = allCoords.reduce((sum, coord) => sum + coord[1], 0);

  return [sumLng / allCoords.length, sumLat / allCoords.length];
}

export const Map = ({
  selectedRegions = ["Monde"],
}: {
  selectedRegions?: string[];
}) => {
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
  const currentCountry = activeCountries[randomIndex];

  // Nouvelle logique de zoom/centre
  const isWorld =
    selectedRegions.length === CONTINENTS.length &&
    CONTINENTS.every((region) => selectedRegions.includes(region));

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
  const previousRandomIndex = useRef<number | undefined>(undefined);
  const currentZoomRef = useRef(currentZoom);
  const currentCenterRef = useRef(currentCenter);

  // Mettre à jour les refs quand les états changent
  useEffect(() => {
    currentZoomRef.current = currentZoom;
    currentCenterRef.current = currentCenter;
  }, [currentZoom, currentCenter]);

  // Fonction d'animation réutilisable
  const animateToTarget = useCallback(
    (targetZoom: number, targetCenter: [number, number], duration: number) => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      let start: number | null = null;
      const initialZoom = currentZoomRef.current;
      const initialCenter = [...currentCenterRef.current];

      function animate(ts: number) {
        if (start === null) start = ts;
        const elapsed = ts - start;
        const t = Math.min(1, elapsed / duration);
        const easedT = easeInOut(t);
        setCurrentZoom(lerp(initialZoom, targetZoom, easedT));
        setCurrentCenter([
          lerp(initialCenter[0], targetCenter[0], easedT),
          lerp(initialCenter[1], targetCenter[1], easedT),
        ]);
        if (t < 1) {
          animationRef.current = requestAnimationFrame(animate);
        }
      }
      animationRef.current = requestAnimationFrame(animate);
    },
    [] // Pas de dépendances pour éviter la boucle infinie
  );

  // Effet pour gérer les changements de pays et de région
  useEffect(() => {
    const isNewCountry =
      previousRandomIndex.current !== undefined &&
      previousRandomIndex.current !== randomIndex;

    // Si c'est un nouveau pays, revenir à la vue globale
    if (isNewCountry) {
      animateToTarget(zoom, center, 600);
    } else {
      // Sinon, animation normale pour les changements de région
      animateToTarget(zoom, center, 500);
    }

    previousRandomIndex.current = randomIndex;
  }, [randomIndex, zoom, center, animateToTarget]);

  const countryStyle = (key: number) => {
    if (validatedCountries.includes(countries[key]?.properties.code)) {
      return "#22c55e";
    }
    if (incorrectCountries.includes(countries[key]?.properties.code)) {
      return "var(--color-destructive)";
    }

    if (countries[key]?.properties.code === currentCountryCode) {
      return "#60a5fa";
    }

    if (countries[key]?.filtered) {
      return "var(--color-background)";
    }

    return "var(--color-secondary)";
  };

  // Fonction pour zoomer sur le pays actuel
  const zoomToCurrentCountry = () => {
    if (!currentCountry) return;

    const countryCenter = calculateCountryCenter(currentCountry.geometry);
    const countryZoom = 4; // Zoom plus proche pour voir le pays

    animateToTarget(countryZoom, countryCenter, 800);
  };

  return (
    <div className="relative">
      {/* Bouton de zoom sur le pays actuel */}
      {currentCountry && (
        <Button
          onClick={zoomToCurrentCountry}
          variant="outline"
          size="sm"
          className="absolute top-4 right-4 z-20 bg-background/90 backdrop-blur-sm hover:bg-background shadow-lg"
          aria-label={`Zoomer sur le pays actuel pour mieux le localiser`}
          title={`Zoomer sur le pays actuel`}
        >
          <ZoomIn className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Zoomer sur le pays actuel</span>
          <span className="sm:hidden">Zoom</span>
        </Button>
      )}

      <ComposableMap
        className="h-[45vh]  md:h-[70vh] z-10 w-full rounded-4xl border-2 border-secondary transition-all"
        projection="geoMercator"
        projectionConfig={{
          scale: 140,
          center: [0, 40],
          rotate: [-10, 0, 0],
        }}
        aria-label="Carte du monde interactive pour le quiz géographique. Un pays est actuellement sélectionné et mis en surbrillance."
        role="img"
      >
        <ZoomableGroup center={currentCenter} zoom={currentZoom}>
          <Geographies geography={countries} stroke="#FFFFFF">
            {({ geographies }) =>
              geographies.map((geo, key) => (
                <Geography
                  tabIndex={-1}
                  key={geo.rsmKey}
                  geography={geo}
                  strokeWidth={geo.filtered ? 0.3 : 0.7}
                  fill={countryStyle(key)}
                  role="img"
                  aria-label={
                    geo.properties.code === currentCountryCode
                      ? "Pays actuellement sélectionné pour le quiz"
                      : "Pays sur la carte"
                  }
                  style={{
                    default: {
                      outline: "none",
                      stroke: "var(--color-primary)",
                      transition: "fill 0.3s ease",
                    },
                    hover: {
                      outline: "none",
                      stroke: "var(--color-primary)",
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
    </div>
  );
};
