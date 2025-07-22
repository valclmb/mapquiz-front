import { MultiplayerCard } from "@/components/home/MultiplayerCard";
import { QuizCard } from "@/components/home/QuizCard";
import { TrainingCard } from "@/components/home/TrainingCard";
import { UserSummary } from "@/components/social/UserSummary";
import { authClient } from "@/lib/auth-client";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const { useSession } = authClient;
  const { data } = useSession();

  return (
    <section className="flex flex-col lg:flex-row gap-8 w-full">
      <div className="flex flex-col gap-5 w-full lg:w-2/3">
        <TrainingCard />
        <QuizCard />
        <MultiplayerCard />
      </div>

      {data?.user && (
        <div className="w-full lg:w-1/3">
          <UserSummary />
        </div>
      )}
    </section>
  );
}
