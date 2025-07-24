import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreateLobby } from "../multiplayer/CreateLobby";

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
        <CreateLobby />
      </CardFooter>
    </Card>
  );
};
