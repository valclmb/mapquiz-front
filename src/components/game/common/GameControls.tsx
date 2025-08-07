import { cn } from "@/lib/utils";
import type { Continent } from "@/types/continent";
import { Filter } from "./Filter";
import { Form } from "./Form";
import { Score } from "./Score";

type GameControlsProps = {
  filter?: Continent[];
  setFilter?: React.Dispatch<React.SetStateAction<Continent[]>>;
  showScore?: boolean;
  className?: string;
};

export const GameControls = ({
  filter,
  setFilter,
  showScore = true,
  className,
}: GameControlsProps) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center my-4 md:my-0 md:flex-row md:items-center gap-4 lg:ml-8",
        className
      )}
    >
      <div className="flex items-start gap-4">
        {filter && setFilter && (
          <Filter filter={filter} setFilter={setFilter} />
        )}
        {showScore && <Score />}
      </div>
      <Form />
    </div>
  );
};
