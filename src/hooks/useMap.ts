import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

type Value = {
  value: string;
  valid: boolean;
};

type Values = {
  name: Value;
  capital: Value;
};

const randomize = (max: number) => {
  return Math.floor(Math.random() * max);
};

export const useMap = (countries: any) => {
  const [validatedCountries, setValidatedCountries] = useState<string[]>([]);

  const defineRandomIndex = useCallback(() => {
    let index = randomize(countries.length);

    if (validatedCountries.length === countries.length - 1) {
      return 404;
    }

    if (validatedCountries.includes(countries[index]?.properties.code)) {
      while (validatedCountries.includes(countries[index]?.properties.code)) {
        index = Math.floor(Math.random() * countries.length);
      }
    }

    return index;
  }, [countries, validatedCountries]);

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
  const country = countries[randomIndex];
  const name = countries[randomIndex]?.properties?.name;
  const capital = countries[randomIndex]?.properties?.capital;
  const score = validatedCountries.length;

  useEffect(() => {
    setRandomIndex(defineRandomIndex());
  }, [defineRandomIndex]);

  const changeIndex = useCallback(
    (valid = false) => {
      const rand = defineRandomIndex();
      if (rand === 404) {
        endGame();
      }

      setRandomIndex(rand);

      setCurrentCountry(defaultValues);
      setTimeout(() => {
        countryRef.current?.focus();
      }, 100);

      if (!valid) {
        toast.error(`La bonne réponse était ${name} - ${capital}`);
      }
    },
    [capital, name, defaultValues, defineRandomIndex]
  );

  const endGame = () => {
    alert("Game Over");
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Backspace" && e.ctrlKey) {
        changeIndex();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [changeIndex]);

  const handleChange = (event: any) => {
    const target = event.currentTarget;

    const id = target.id;
    const propertieValue = country?.properties?.[id].toLowerCase();
    const valid = propertieValue === target.value.toLowerCase();

    setCurrentCountry((curr) => {
      const result = {
        ...curr,
        [id]: {
          value: target.value,
          valid: valid,
        },
      };
      return result;
    });

    if (id === "name" && valid) {
      setTimeout(() => {
        capitalRef.current?.focus();
      }, 100);
    }
    handleValidation();
  };

  const handleValidation = () => {
    const properties = country?.properties;
    const countryValid =
      countryRef.current?.value.toLowerCase() === properties.name.toLowerCase();
    const capitalValid =
      capitalRef.current?.value.toLowerCase() ===
      properties.capital.toLowerCase();

    if (countryValid && capitalValid) {
      toast(`Bravo ! Vous avez trouvé ${name} - ${capital} 🎉🎉🎉`);
      setTimeout(() => {
        // Problème : Le validated countries n'est pas encore mis à jour dans le changeIndex
        // Le pays reste rouge alors qu'il a été validé
        setValidatedCountries((curr) => [...curr, country?.properties.code]);

        changeIndex(true);
      }, 200);
    }
  };

  useEffect(() => {
    if (validatedCountries.includes(country?.properties.code)) {
      setRandomIndex(defineRandomIndex());
    }
  }, [validatedCountries, country, countries, defineRandomIndex]);

  return {
    countries,
    randomIndex,
    currentCountry,
    changeIndex,
    handleChange,
    refs: {
      capitalRef,
      countryRef,
    },
    validatedCountries,
    score,
  };
};
