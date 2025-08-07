import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GameContext } from "@/context/GameContext";
import { useContext } from "react";

import { cn } from "@/lib/utils";
import { Delete } from "lucide-react";

type FormProps = { className?: string };
export const Form = ({ className }: FormProps) => {
  const gameContext = useContext(GameContext);

  if (!gameContext) throw new Error("Game context not defined");

  const { currentCountry, handleChange, refs, changeIndex } = gameContext;

  const inputClass =
    "mt-2  rounded-lg border min-w-40 shadow-sm disabled:bg-green-100 dark:disabled:bg-green-900 disabled:border disabled:border-green-500";
  return (
    <Card
      className={cn(
        " min-w-72  z-40 md:-mt-10  backdrop-blur-md border-secondary shadow-lg",
        className
      )}
    >
      <CardContent className="flex flex-col  md:flex-row items-center gap-3 px-9 space-y-2">
        <div className="flex flex-col w-full">
          <Label htmlFor="name">Pays</Label>
          <Input
            ref={refs.countryRef}
            autoFocus
            disabled={currentCountry.name.valid}
            id="name"
            type="text"
            autoComplete="off"
            className={inputClass}
            value={currentCountry.name.value}
            onChange={handleChange}
            aria-describedby="country-help"
          />
        </div>
        <div className="flex flex-col w-full">
          <Label htmlFor="capital">Capitale</Label>
          <Input
            ref={refs.capitalRef}
            disabled={currentCountry.capital.valid}
            id="capital"
            type="text"
            autoComplete="off"
            className={inputClass}
            value={currentCountry.capital.value}
            onChange={handleChange}
            aria-describedby="capital-help"
            aria-invalid={
              currentCountry.capital.value.length > 0 &&
              !currentCountry.capital.valid
            }
          />
        </div>
        <Button
          onClick={() => changeIndex(false)}
          className="w-full md:w-auto flex mt-3 gap-1"
          aria-label="Passer au pays suivant"
        >
          Passer <span className="sr-only">(raccourci: Ctrl + Backspace)</span>
          Ctrl + <Delete strokeWidth={1.5} size={20} />
        </Button>
      </CardContent>
    </Card>
  );
};
