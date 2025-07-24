import { Badge } from "@/components/ui/badge";
import { Toggle } from "@/components/ui/toggle";
import { CONTINENTS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Continent } from "@/types/continent";

type ContinentSelectorProps = {
  selectedContinents: string[];
  isEditable?: boolean;
  onChange: (regions: Continent[]) => void;
  className?: string;
  inverted?: boolean;
  isLoading?: boolean;
  compact?: boolean;
};

export const ContinentSelector = ({
  selectedContinents,
  onChange,
  className,
  inverted = false,
  isLoading = false,
  isEditable = true,
}: ContinentSelectorProps) => {
  const handleToggle = (region: string) => {
    const newSelectedRegions = selectedContinents.includes(region)
      ? selectedContinents.filter((r) => r !== region)
      : [...selectedContinents, region];

    onChange(newSelectedRegions);
  };

  if (!isEditable)
    return (
      <div className="flex flex-wrap gap-2">
        {selectedContinents.map((region: string) => (
          <Badge
            key={region}
            // className="text-sm px-4 py-2 rounded-xl"
            variant="secondary"
          >
            {region}
          </Badge>
        ))}
      </div>
    );

  return (
    <div className={cn("flex flex-wrap gap-2 mb-4", className)}>
      {CONTINENTS.map((continent) => {
        // En mode inversé, le bouton est pressé quand la région n'est PAS sélectionnée
        const isPressed = inverted
          ? !selectedContinents.includes(continent)
          : selectedContinents.includes(continent);

        return (
          <Toggle
            key={continent}
            aria-label={continent}
            pressed={isPressed}
            onPressedChange={() => {
              if (!isLoading) handleToggle(continent);
            }}
            disabled={isLoading}
            className="text-sm hover:cursor-pointer"
          >
            {continent}
          </Toggle>
        );
      })}
    </div>
  );
};
