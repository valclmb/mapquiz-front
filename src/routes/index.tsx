import { MultiplayerCard } from "@/components/home/MultiplayerCard";
import { QuizCard } from "@/components/home/QuizCard";
import { TrainingCard } from "@/components/home/TrainingCard";
import { UserSummary } from "@/components/social/UserSummary";
import { authClient } from "@/lib/auth-client";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const { useSession } = authClient;
  const { data } = useSession();

  return (
    <section
      className="flex flex-col lg:flex-row gap-8 w-full"
      aria-labelledby="home-title"
    >
      <h1 id="home-title" className="sr-only">
        Map Quiz - Accueil
      </h1>

      <div
        className="flex flex-col gap-5 w-full lg:w-2/3"
        role="region"
        aria-labelledby="games-title"
      >
        <h2 id="games-title" className="sr-only">
          Modes de jeu disponibles
        </h2>
        <TrainingCard />
        <QuizCard />
        <MultiplayerCard />
      </div>

      {data?.user && (
        <aside
          className="w-full lg:w-1/3"
          role="complementary"
          aria-labelledby="user-summary-title"
        >
          <h2 id="user-summary-title" className="sr-only">
            Résumé de votre profil
          </h2>
          <UserSummary />
        </aside>
      )}

      <Outlet />
    </section>
  );
}
