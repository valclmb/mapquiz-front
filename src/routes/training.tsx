import { TrainingGame } from "@/components/game/training/TrainingGame";
import { getCountries } from "@/lib/data";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/training")({
  component: RouteComponent,
  loader: async () => {
    const countries = await getCountries();
    return { countries };
  },
});

function RouteComponent() {
  const { countries } = Route.useLoaderData();

  return <TrainingGame countries={countries ?? []} />;
}
