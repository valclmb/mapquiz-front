import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GameContext } from "@/context/GameContext";
import { Delete } from "lucide-react";
import { useContext } from "react";

export const Form = () => {
  const gameContext = useContext(GameContext);

  if (!gameContext) throw new Error("Game context not defined");

  const { currentCountry, handleChange, refs, changeIndex } = gameContext;

  return (
    <Card className="absolute right-1/2 bottom-2 translate-x-1/2 z-40 bg-background/90 backdrop-blur-md">
      <CardContent className="px-5 space-y-2">
        <div className="flex flex-col">
          <Label htmlFor="name">Pays</Label>
          <Input
            ref={refs.countryRef}
            autoFocus
            disabled={currentCountry.name.valid}
            id="name"
            type="text"
            className="p-1 mt-1 text-black rounded-sm border disabled:bg-green-100 disabled:border disabled:border-green-500"
            value={currentCountry.name.value}
            onChange={handleChange}
          />
        </div>
        <div className="flex flex-col">
          <Label htmlFor="capital">Capitale</Label>
          <Input
            ref={refs.capitalRef}
            disabled={currentCountry.capital.valid}
            id="capital"
            type="text"
            className="p-1 mt-1 text-black rounded-sm border disabled:bg-green-100 disabled:border disabled:border-green-500"
            value={currentCountry.capital.value}
            onChange={handleChange}
          />
        </div>
        <Button
          onClick={() => changeIndex()}
          variant="ghost"
          className="flex mt-0 gap-1"
        >
          Passer au pays suivant Ctrl + <Delete strokeWidth={1.5} size={20} />
        </Button>
      </CardContent>
    </Card>
  );
};
