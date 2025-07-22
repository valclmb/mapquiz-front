import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@tanstack/react-router";

export const MultiplayerCard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl sm:text-2xl">Multijoueur</CardTitle>
        <CardDescription>
          Défiez vos amis dans une partie multijoueur et comparez vos scores en
          temps réel !
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <Link to="/multiplayer">
          <Button className="w-full sm:w-auto">Créer un lobby</Button>
        </Link>
      </CardFooter>
    </Card>
  );
};
