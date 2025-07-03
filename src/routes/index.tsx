import { MultiplayerCard } from "@/components/home/MultiplayerCard";
import { QuizCard } from "@/components/home/QuizCard";
import { TrainingCard } from "@/components/home/TrainingCard";
import { Grid } from "@/components/layout/Grid";
import { UserSummary } from "../components/social/UserSummary";

import { authClient } from "@/lib/auth-client";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const { useSession } = authClient;
  const { data } = useSession();

  return (
    <main className="flex w-11/12 m-auto flex-grow min-w-screen h-full overflow-hidden flex-col items-center justify-between">
      <Grid>
        <div className="flex flex-col lg:flex-row gap-8 w-full max-w-7xl mx-auto">
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
        </div>
      </Grid>
    </main>
  );
}
