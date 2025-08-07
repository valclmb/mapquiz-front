import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreateLobby } from "../multiplayer/CreateLobby";
import Typography from "../ui/Typography";

export const MultiplayerCard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Typography variant="h3">Multijoueur</Typography>
        </CardTitle>
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
