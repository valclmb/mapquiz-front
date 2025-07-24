import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GameContext } from "@/context/GameContext";
import { useContext, useMemo, useCallback } from "react";

import { cn } from "@/lib/utils";

type FormProps = { 
  className?: string;
};

export const Form = ({ className }: FormProps) => {
  const gameContext = useContext(GameContext);

  if (!gameContext) throw new Error("Game context not defined");

  const { 
    currentCountry, 
    handleChange, 
    handleSubmit,
    handleKeyDown,
    countryRef,
    capitalRef
  } = gameContext;

  // Mémoriser les classes CSS pour éviter les re-calculs
  const inputClass = useMemo(
    () =>
      "mt-2 rounded-lg border shadow-sm disabled:bg-green-100 dark:disabled:bg-green-900 disabled:border disabled:border-green-500",
    []
  );

  const cardClassName = useMemo(
    () =>
      cn(
        "absolute right-1/2 bottom-3 translate-x-1/2 min-w-72 z-40 backdrop-blur-md border-secondary shadow-lg",
        className
      ),
    [className]
  );

  // Optimiser la gestion des événements
  const handleCountryKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && currentCountry.name.valid) {
        capitalRef.current?.focus();
      } else {
        handleKeyDown(e);
      }
    },
    [handleKeyDown, currentCountry.name.valid, capitalRef]
  );

  const handleCapitalKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleSubmit();
      } else {
        handleKeyDown(e);
      }
    },
    [handleKeyDown, handleSubmit]
  );

  return (
    <Card className={cardClassName}>
      <CardContent className="flex items-center gap-3 px-9 space-y-2">
        <div className="flex flex-col w-full">
          <Label htmlFor="name">Pays</Label>
          <Input
            ref={countryRef}
            autoFocus
            disabled={currentCountry.name.valid}
            id="name"
            type="text"
            className={inputClass}
            value={currentCountry.name.value}
            onChange={handleChange}
            onKeyDown={handleCountryKeyDown}
          />
        </div>
        <div className="flex flex-col w-full">
          <Label htmlFor="capital">Capitale</Label>
          <Input
            ref={capitalRef}
            disabled={currentCountry.capital.valid}
            id="capital"
            type="text"
            className={inputClass}
            value={currentCountry.capital.value}
            onChange={handleChange}
            onKeyDown={handleCapitalKeyDown}
          />
        </div>
        <Button onClick={handleSubmit} className="flex mt-3 gap-1">
          Valider
        </Button>
      </CardContent>
    </Card>
  );
};
