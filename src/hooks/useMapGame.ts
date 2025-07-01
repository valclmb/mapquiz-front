import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { toast } from "sonner";

type Value = {
  value: string;
  valid: boolean;
};

type Values = {
  name: Value;
  capital: Value;
};

type CountryProperties = {
  name: string;
  capital: string;
  code: string;
  continent: string;
};

export type Country = {
  properties: CountryProperties;
};

type GameMode = "quiz" | "practice";

type GameOptions = {
  mode: GameMode;
  onGameEnd?: (score: number, total: number) => void;
};

export const useMapGame = (countries: Country[], options: GameOptions) => {
  const { mode, onGameEnd } = options;

  // Filtrer les pays pour ne garder que ceux qui ne sont pas marqués comme filtrés
  const activeCountries = useMemo(() => {
    return countries.filter(
      (country) => !("filtered" in country && country.filtered)
    );
  }, [countries]);

  const [validatedCountries, setValidatedCountries] = useState<string[]>([]);
  const [incorrectCountries, setIncorrectCountries] = useState<string[]>([]);
  const [gameEnded, setGameEnded] = useState(false);

  const defaultValues = useMemo(
    () => ({
      name: { value: "", valid: false },
      capital: { value: "", valid: false },
    }),
    []
  );

  const [currentCountry, setCurrentCountry] = useState<Values>(defaultValues);
  const [randomIndex, setRandomIndex] = useState(0);

  const countryRef = useRef<HTMLInputElement>(null);
  const capitalRef = useRef<HTMLInputElement>(null);

  const score = validatedCountries.length;

  const defineRandomIndex = useCallback(() => {
    if (validatedCountries.length === activeCountries.length) {
      return mode === "quiz" ? -1 : 404;
    }

    let index;
    do {
      index = Math.floor(Math.random() * activeCountries.length);
    } while (
      validatedCountries.includes(activeCountries[index]?.properties.code)
    );

    return index;
  }, [activeCountries, validatedCountries, mode]);

  const endGame = useCallback(() => {
    if (mode === "quiz" && !gameEnded) {
      setGameEnded(true);
      onGameEnd?.(score, activeCountries.length); // <-- CORRECTION ICI
    } else if (mode === "practice") {
      alert("Game Over");
    }
  }, [gameEnded, score, activeCountries.length, onGameEnd, mode]); // <-- CORRECTION ICI

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const target = event.currentTarget;
    const id = target.id as keyof CountryProperties;
    const country = activeCountries[randomIndex];
    const propertyValue = country?.properties?.[id]?.toLowerCase();
    const valid = propertyValue === target.value.toLowerCase();

    setCurrentCountry((curr) => ({
      ...curr,
      [id]: {
        value: target.value,
        valid: valid,
      },
    }));

    if (id === "name" && valid) {
      setTimeout(() => {
        capitalRef.current?.focus();
      }, 100);
    }

    // Vérifier si les deux réponses sont correctes
    const countryValid = id === "name" ? valid : currentCountry.name.valid;
    const capitalValid =
      id === "capital" ? valid : currentCountry.capital.valid;

    if (countryValid && capitalValid) {
      const countryName = country.properties.name;
      const capitalName = country.properties.capital;
      const countryCode = country.properties.code;

      const message =
        mode === "quiz"
          ? `Bravo ! ${countryName} - ${capitalName} 🎉`
          : `Bravo ! Vous avez trouvé ${countryName} - ${capitalName} 🎉🎉🎉`;

      toast.success(message);

      // Ajouter le pays aux validés immédiatement pour éviter qu'il soit sélectionné à nouveau
      const newValidatedCountries = [...validatedCountries, countryCode];
      setValidatedCountries(newValidatedCountries);

      setTimeout(
        () => {
          // Utiliser la nouvelle liste de pays validés pour la sélection du prochain pays
          changeIndexWithValidated(true, newValidatedCountries);
        },
        mode === "quiz" ? 500 : 200
      );
    }
  };

  // Nouvelle fonction pour changer l'index avec une liste de pays validés à jour
  const changeIndexWithValidated = useCallback(
    (valid = false, updatedValidatedCountries = validatedCountries) => {
      // Vérifier si tous les pays ont été traités (validés ou incorrects)
      const allCountriesProcessed = activeCountries.every(
        (country) =>
          updatedValidatedCountries.includes(country.properties.code) ||
          incorrectCountries.includes(country.properties.code)
      );

      if (
        allCountriesProcessed ||
        updatedValidatedCountries.length === activeCountries.length
      ) {
        endGame();
        return;
      }

      let newIndex;
      let attempts = 0;
      const maxAttempts = activeCountries.length * 2; // Éviter une boucle infinie

      do {
        newIndex = Math.floor(Math.random() * activeCountries.length);
        attempts++;
        if (attempts > maxAttempts) {
          console.error(
            "Impossible de trouver un pays non validé après plusieurs tentatives"
          );
          endGame(); // Terminer le jeu si on ne trouve pas de pays disponible
          return;
        }
      } while (
        updatedValidatedCountries.includes(
          activeCountries[newIndex]?.properties.code
        ) ||
        (mode === "quiz" &&
          incorrectCountries.includes(
            activeCountries[newIndex]?.properties.code
          ))
      );

      // Ajouter le pays actuel aux incorrects si la réponse est fausse
      if (!valid && activeCountries[randomIndex] && mode === "quiz") {
        setIncorrectCountries((prev) => {
          const code = activeCountries[randomIndex].properties.code;
          return prev.includes(code) ? prev : [...prev, code];
        });
      }

      setRandomIndex(newIndex);
      setCurrentCountry(defaultValues);

      setTimeout(() => {
        countryRef.current?.focus();
      }, 100);

      if (!valid && activeCountries[randomIndex]) {
        const country = activeCountries[randomIndex];
        toast.error(
          `La bonne réponse était ${country.properties.name} - ${country.properties.capital}`
        );
      }
    },
    [
      activeCountries,
      validatedCountries,
      incorrectCountries,
      randomIndex,
      defaultValues,
      mode,
      endGame,
    ]
  );

  const resetGame = () => {
    setValidatedCountries([]);
    setIncorrectCountries([]);
    setCurrentCountry(defaultValues);
    setGameEnded(false);
    setRandomIndex(defineRandomIndex());
  };

  const changeIndex = useCallback(
    (valid = false) => {
      changeIndexWithValidated(valid);
    },
    [changeIndexWithValidated]
  );

  // Raccourcis clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Backspace" && e.ctrlKey) {
        changeIndex();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [changeIndex]);

  // Corriger le useEffect d'initialisation
  useEffect(() => {
    if (activeCountries.length > 0) {
      // Appeler directement la logique au lieu de defineRandomIndex()
      const index = Math.floor(Math.random() * activeCountries.length);
      setRandomIndex(index);
    }
  }, [activeCountries.length]); // Utiliser activeCountries.length au lieu de countries

  return {
    countries,
    activeCountries,
    randomIndex,
    currentCountry,
    changeIndex,
    handleChange,
    refs: {
      capitalRef,
      countryRef,
    },
    validatedCountries,
    incorrectCountries,
    score,
    resetGame,
    gameEnded,
  };
};
