import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Continent } from "@/types/continent";
import { FilterIcon } from "lucide-react";
import { ContinentSelector } from "./ContinentSelector";

type FilterProps = {
  filter: Continent[];
  setFilter: React.Dispatch<React.SetStateAction<Continent[]>>;
};

export const Filter = ({ filter, setFilter }: FilterProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          className="bg-card text-primary border border-secondary hover:bg-secondary cursor-pointer "
          aria-label="Filtrer par continent"
        >
          <FilterIcon className="size-5 text-primary " />
          Filtre
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <ContinentSelector
          className="mb-0"
          selectedContinents={filter}
          onChange={setFilter}
          inverted={true}
        />
      </PopoverContent>
    </Popover>
  );
};
