import { QuizGame } from "@/components/game/quiz/QuizGame";
import { DEFAULT_CONTINENT } from "@/lib/constants";
import { getCountries } from "@/lib/data";
import type { Continent } from "@/types/continent";
import { createFileRoute } from "@tanstack/react-router";

type QuizSearch = {
  regions?: Continent[];
};

export const Route = createFileRoute("/quiz")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): QuizSearch => {
    return {
      regions: Array.isArray(search.regions)
        ? search.regions
        : [DEFAULT_CONTINENT],
    };
  },
  loader: async () => {
    const countries = await getCountries();
    return { countries };
  },
});

function RouteComponent() {
  const { regions } = Route.useSearch();
  const { countries } = Route.useLoaderData();

  return (
    <QuizGame
      countries={countries ?? []}
      selectedRegions={regions || [DEFAULT_CONTINENT]}
    />
  );
}
