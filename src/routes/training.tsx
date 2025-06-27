import { Game } from "@/components/Game";
import { getCountries } from "@/lib/data";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/training")({
  component: RouteComponent,
});

async function RouteComponent() {
  const countries = await getCountries();

  return <Game countries={countries ?? []} />;
}
