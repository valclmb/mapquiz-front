import { QuizGame } from "@/components/game/quiz/QuizGame";
import { getCountries } from "@/lib/data";
import { createFileRoute } from "@tanstack/react-router";

type QuizSearch = {
  regions?: string[];
};

export const Route = createFileRoute("/quiz")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): QuizSearch => {
    return {
      regions: Array.isArray(search.regions) ? search.regions : ["Europe"],
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
      selectedRegions={regions || ["Europe"]}
    />
  );
}
