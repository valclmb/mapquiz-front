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

// import { UserSummary } from "@/src/components/User/UserSummary";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const { useSession } = authClient;
  const session = useSession();
  console.log(session);
  return (
    <main className="flex w-11/12 m-auto flex-grow min-w-screen h-full overflow-hidden flex-col items-center justify-between">
      <Grid>
        <div className="flex gap-8 w-full max-w-7xl mx-auto">
          <div className="flex flex-col gap-5 w-2/3">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-2xl">Entrainement</CardTitle>
                <CardDescription>
                  Entrainez-vous à identifier les pays et leurs capitales !
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Link to="/training">
                  <Button>Lancer </Button>
                </Link>
              </CardFooter>
            </Card>
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-2xl">Quiz</CardTitle>
                <CardDescription>
                  Défiez-vous sur les pays et leurs capitales !
                  <br /> Connectez-vous pour suivre votre progression et
                  conserver l{"'"}historique de vos scores.
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-2">
                <Typography variant="h4">Selectionnez vos régions</Typography>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Toggle aria-label="Afrique" defaultPressed>
                    Afrique
                  </Toggle>
                  <Toggle aria-label="Amérique du Nord" defaultPressed>
                    Amérique du Nord
                  </Toggle>
                  <Toggle aria-label="Amérique du Sud " defaultPressed>
                    Amérique du Sud
                  </Toggle>
                  <Toggle aria-label="Europe" defaultPressed>
                    Europe
                  </Toggle>
                  <Toggle aria-label="Océanie" defaultPressed>
                    Océanie
                  </Toggle>
                </div>
                <Link to="/quiz">
                  <Button>Lancer</Button>
                </Link>
              </CardFooter>
            </Card>
          </div>

          {/* {session?.user && (
            <div className="w-1/3">
              <UserSummary />
            </div>
          )} */}
        </div>
      </Grid>
    </main>
  );
}
