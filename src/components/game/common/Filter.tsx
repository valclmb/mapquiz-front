import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FilterIcon } from "lucide-react";
import { RegionSelector } from "./RegionSelector";

type FilterProps = {
  filter: string[];
  setFilter: React.Dispatch<React.SetStateAction<string[]>>;
};

export const Filter = ({ filter, setFilter }: FilterProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="p-6 bg-secondary border-secondary border hover:bg-secondary/60 cursor-pointer "
        >
          <FilterIcon className="size-7 text-primary " />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="max-w-[440px] w-full">
        <RegionSelector
          className="justify-center mb-0"
          selectedRegions={filter}
          onChange={setFilter}
          inverted={true}
        />
      </PopoverContent>
    </Popover>
  );
};
