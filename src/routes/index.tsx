import { UserSummary } from "@/components/Social/UserSummary";
import { Grid } from "@/components/ui-custom/Grid";
import Typography from "@/components/ui-custom/Typography";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Toggle } from "@/components/ui/toggle";
import { authClient } from "@/lib/auth-client";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const { useSession } = authClient;
  const { data } = useSession();

  return (
    <main className="flex w-11/12 m-auto flex-grow min-w-screen h-full overflow-hidden flex-col items-center justify-between">
      <Grid>
        <div className="flex flex-col lg:flex-row gap-8 w-11/12 mx-auto">
          <div className="flex flex-col gap-5 w-full lg:w-2/3">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl">
                  Entrainement
                </CardTitle>
                <CardDescription>
                  Entrainez-vous à identifier les pays et leurs capitales !
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Link to="/training">
                  <Button className="w-full sm:w-auto">Lancer </Button>
                </Link>
              </CardFooter>
            </Card>
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl">Quiz</CardTitle>
                <CardDescription>
                  Défiez-vous sur les pays et leurs capitales !
                  <br /> Connectez-vous pour suivre votre progression et
                  conserver l{"'"}historique de vos scores.
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-2">
                <Typography variant="h4" className="text-base sm:text-lg">
                  Selectionnez vos régions
                </Typography>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Toggle
                    aria-label="Afrique"
                    defaultPressed
                    className="text-sm"
                  >
                    Afrique
                  </Toggle>
                  <Toggle
                    aria-label="Amérique du Nord"
                    defaultPressed
                    className="text-sm"
                  >
                    Amérique du Nord
                  </Toggle>
                  <Toggle
                    aria-label="Amérique du Sud "
                    defaultPressed
                    className="text-sm"
                  >
                    Amérique du Sud
                  </Toggle>
                  <Toggle
                    aria-label="Europe"
                    defaultPressed
                    className="text-sm"
                  >
                    Europe
                  </Toggle>
                  <Toggle
                    aria-label="Océanie"
                    defaultPressed
                    className="text-sm"
                  >
                    Océanie
                  </Toggle>
                </div>
                <Link to="/quiz">
                  <Button className="w-full sm:w-auto">Lancer</Button>
                </Link>
              </CardFooter>
            </Card>
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
