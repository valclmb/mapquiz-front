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
          size="icon"
          className="p-6 bg-card border border-secondary hover:bg-secondary cursor-pointer "
        >
          <FilterIcon className="size-7 text-primary " />
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
