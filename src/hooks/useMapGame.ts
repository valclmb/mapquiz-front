import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { toast } from "sonner";
import { useGameLogic, type Country } from "./game/useGameLogic";

type Value = {
  value: string;
  valid: boolean;
};

type Values = {
  name: Value;
  capital: Value;
};

type GameMode = "quiz" | "practice";

type GameOptions = {
  mode: GameMode;
  onGameEnd?: (score: number, total: number) => void;
  onCorrectAnswer?: (countryCode: string) => void;
  onIncorrectAnswer?: () => void;
  initialValidatedCountries?: string[];
  initialIncorrectCountries?: string[];
  isMultiplayer?: boolean;
  onMultiplayerGameEnd?: () => void;
  onProgressSync?: (
    validatedCountries: string[],
    incorrectCountries: string[],
    score: number,
    totalQuestions: number
  ) => void;
};

export const useMapGame = (countries: Country[], options: GameOptions) => {
  const {
    mode,
    onGameEnd,
    onCorrectAnswer,
    onIncorrectAnswer,
    initialValidatedCountries = [],
    initialIncorrectCountries = [],
    onProgressSync,
    isMultiplayer = false,
  } = options;

  const [validatedCountries, setValidatedCountries] = useState<string[]>(
    initialValidatedCountries
  );
  const [incorrectCountries, setIncorrectCountries] = useState<string[]>(
    initialIncorrectCountries
  );
  const [gameEnded, setGameEnded] = useState(false);
  const [randomIndex, setRandomIndex] = useState(0);
  const hasRestoredState = useRef(false);

  const defaultValues = useMemo(
    () => ({
      name: { value: "", valid: false },
      capital: { value: "", valid: false },
    }),
    []
  );

  const [currentCountry, setCurrentCountry] = useState<Values>(defaultValues);

  const countryRef = useRef<HTMLInputElement>(null);
  const capitalRef = useRef<HTMLInputElement>(null);

  // Utiliser la logique de jeu séparée
  const {
    activeCountries,
    shouldEndGame,
    findNextRandomIndex,
    validateAnswer,
  } = useGameLogic(countries, validatedCountries, incorrectCountries, mode, isMultiplayer);

  const score = validatedCountries.length;

  const endGame = useCallback(() => {
    if (isMultiplayer) {
      options.onMultiplayerGameEnd?.();
    } else if (mode === "quiz" && !gameEnded) {
      setGameEnded(true);
      onGameEnd?.(score, activeCountries.length);
    } else if (mode === "practice") {
      alert("Game Over");
    }
  }, [
    gameEnded,
    score,
    activeCountries.length,
    onGameEnd,
    mode,
    isMultiplayer,
    options,
  ]);

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const target = event.currentTarget;
    const field = target.id;
    const value = target.value;
    const currentCountryCode = activeCountries[randomIndex]?.properties.code;
    
    if (!currentCountryCode) return;

    const isValid = validateAnswer(currentCountryCode, field, value);

    setCurrentCountry((curr) => ({
      ...curr,
      [field]: {
        value,
        valid: isValid,
      },
    }));

    if (field === "name" && isValid) {
      setTimeout(() => {
        capitalRef.current?.focus();
      }, 100);
    }
  }, [activeCountries, randomIndex, validateAnswer]);

  const handleSubmit = useCallback(() => {
    const currentCountryCode = activeCountries[randomIndex]?.properties.code;
    if (!currentCountryCode) return;

    const isNameValid = currentCountry.name.valid;
    const isCapitalValid = currentCountry.capital.valid;

    if (isNameValid && isCapitalValid) {
      const updatedValidatedCountries = [...validatedCountries, currentCountryCode];
      setValidatedCountries(updatedValidatedCountries);
      onCorrectAnswer?.(currentCountryCode);

      // Synchroniser avec le backend si nécessaire
      if (onProgressSync) {
        onProgressSync(
          updatedValidatedCountries,
          incorrectCountries,
          updatedValidatedCountries.length,
          activeCountries.length
        );
      }

      // Vérifier si le jeu doit se terminer
      if (shouldEndGame) {
        endGame();
        return;
      }

      const newIndex = findNextRandomIndex();
      if (newIndex === -1 || newIndex === 404) {
        endGame();
        return;
      }

      setRandomIndex(newIndex);
      setCurrentCountry(defaultValues);
      
      setTimeout(() => {
        countryRef.current?.focus();
      }, 100);
    } else {
      const updatedIncorrectCountries = [...incorrectCountries, currentCountryCode];
      setIncorrectCountries(updatedIncorrectCountries);
      onIncorrectAnswer?.();

      if (mode === "quiz") {
        toast.error("Mauvaise réponse !");
      }

      // Synchroniser avec le backend si nécessaire
      if (onProgressSync) {
        onProgressSync(
          validatedCountries,
          updatedIncorrectCountries,
          validatedCountries.length,
          activeCountries.length
        );
      }

      // Passer au pays suivant
      const newIndex = findNextRandomIndex();
      if (newIndex === -1 || newIndex === 404) {
        endGame();
        return;
      }

      setRandomIndex(newIndex);
      setCurrentCountry(defaultValues);
      
      setTimeout(() => {
        countryRef.current?.focus();
      }, 100);
    }
  }, [
    activeCountries,
    randomIndex,
    currentCountry,
    validatedCountries,
    incorrectCountries,
    onCorrectAnswer,
    onIncorrectAnswer,
    onProgressSync,
    shouldEndGame,
    endGame,
    findNextRandomIndex,
    defaultValues,
    mode,
  ]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  const reset = useCallback(() => {
    setValidatedCountries([]);
    setIncorrectCountries([]);
    setGameEnded(false);
    setCurrentCountry(defaultValues);
    
    const newIndex = findNextRandomIndex();
    setRandomIndex(newIndex !== -1 && newIndex !== 404 ? newIndex : 0);
    
    setTimeout(() => {
      countryRef.current?.focus();
    }, 100);
  }, [defaultValues, findNextRandomIndex]);

  // Initialisation du jeu
  useEffect(() => {
    if (activeCountries.length > 0 && !hasRestoredState.current) {
      const newIndex = findNextRandomIndex();
      setRandomIndex(newIndex !== -1 && newIndex !== 404 ? newIndex : 0);
      hasRestoredState.current = true;
    }
  }, [activeCountries, findNextRandomIndex]);

  // Synchronisation des états restaurés
  useEffect(() => {
    if (initialValidatedCountries.length > 0 || initialIncorrectCountries.length > 0) {
      const newIndex = findNextRandomIndex();
      if (newIndex !== -1 && newIndex !== 404) {
        setRandomIndex(newIndex);
      } else {
        endGame();
      }
    }
  }, [initialValidatedCountries, initialIncorrectCountries, findNextRandomIndex, endGame]);

  return {
    currentCountry,
    randomIndex,
    validatedCountries,
    incorrectCountries,
    score,
    gameEnded,
    activeCountries,
    handleChange,
    handleSubmit,
    handleKeyDown,
    reset,
    countryRef,
    capitalRef,
  };
};

// Re-export types
export type { Country };
