import { RegionSelector } from "./RegionSelector";

type FilterProps = {
  filter: string[];
  setFilter: React.Dispatch<React.SetStateAction<string[]>>;
};

export const Filter = ({ filter, setFilter }: FilterProps) => {
  return (
    <nav className="z-50 p-1 absolute right-1/2 top-3 translate-x-1/2 rounded-sm">
      <RegionSelector
        selectedRegions={filter}
        onChange={setFilter}
        inverted={true}
      />
    </nav>
  );
};
