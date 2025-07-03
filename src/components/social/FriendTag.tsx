import { useUserTag } from "@/hooks/queries/useUserTag";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";

export const FriendTag = () => {
  const { data: tag = "", isLoading } = useUserTag();

  // Copier le tag dans le presse-papier
  const copyTag = () => {
    console.log("test");
    navigator.clipboard.writeText(tag);
    toast("Tag copié", {
      description: "Votre tag a été copié dans le presse-papier",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Votre Tag d{"'"}Ami</CardTitle>
        <CardDescription>
          Partagez ce tag avec vos amis pour qu{"'"}ils puissent vous ajouter
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center gap-2">
        {isLoading ? (
          <div>Chargement...</div>
        ) : (
          <>
            <Input value={tag} readOnly className="font-mono text-lg" />
            <Button variant="outline" size="icon" onClick={copyTag}>
              <Copy className="h-4 w-4" />
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};
