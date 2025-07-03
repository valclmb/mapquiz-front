import { Toggle } from "@/components/ui/toggle";
import { CONTINENTS } from "@/lib/constants";

type RegionSelectorProps = {
  selectedRegions: string[];
  onChange: (regions: string[]) => void;
  className?: string;
  inverted?: boolean;
};

export const RegionSelector = ({
  selectedRegions,
  onChange,
  className = "flex flex-wrap gap-2 mb-4",
  inverted = false,
}: RegionSelectorProps) => {
  const handleRegionToggle = (region: string) => {
    const newSelectedRegions = selectedRegions.includes(region)
      ? selectedRegions.filter((r) => r !== region)
      : [...selectedRegions, region];

    onChange(newSelectedRegions);
  };

  return (
    <div className={className}>
      {CONTINENTS.map((continent) => {
        // En mode inversé, le bouton est pressé quand la région n'est PAS sélectionnée
        const isPressed = inverted
          ? !selectedRegions.includes(continent)
          : selectedRegions.includes(continent);

        return (
          <Toggle
            key={continent}
            aria-label={continent}
            pressed={isPressed}
            onPressedChange={() => handleRegionToggle(continent)}
            className="text-sm"
          >
            {continent}
          </Toggle>
        );
      })}
    </div>
  );
};
