import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import Typography from "../ui/Typography";

export const TrainingCard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Typography variant="h3">Entrainement</Typography>
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
  );
};
