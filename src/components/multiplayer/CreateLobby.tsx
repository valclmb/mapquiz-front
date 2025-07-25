import { ContinentSelector } from "@/components/game/common/ContinentSelector";
import { Button } from "@/components/ui/button";
import { GoogleSignInButton } from "@/components/ui/google-sign-in-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWebSocketContext } from "@/context/WebSocketContext";
import { DEFAULT_CONTINENT } from "@/lib/constants";
import type { Continent } from "@/types/continent";
import { Lock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

export const CreateLobby = () => {
  const [lobbyName, setLobbyName] = useState("");
  const [selectedContinents, setSelectedContinents] = useState<Continent[]>([
    DEFAULT_CONTINENT,
  ]);

  // Utiliser uniquement le contexte WebSocket
  const { isAuthenticated, isConnected, sendMessage } = useWebSocketContext();

  const handleCreateLobby = () => {
    if (!isAuthenticated || !isConnected) {
      toast.error(
        "Connexion WebSocket non disponible. Veuillez vous connecter."
      );
      return;
    }

    sendMessage({
      type: "create_lobby",
      payload: {
        name: lobbyName || "Mon lobby",
        settings: {
          selectedRegions: selectedContinents,
          gameMode: "quiz",
        },
      },
    });
  };

  return (
    <div className="relative">
      <Dialog>
        <DialogTrigger asChild>
          <Button>Créer un lobby</Button>
        </DialogTrigger>
        <DialogContent className="overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center my-5">
              Créer un lobby multijoueur
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="lobbyName">Nom du lobby</Label>
              <Input
                id="lobbyName"
                placeholder="Mon lobby"
                value={lobbyName}
                onChange={(e) => setLobbyName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Sélectionner les continents</Label>
              <ContinentSelector
                selectedContinents={selectedContinents}
                onChange={setSelectedContinents}
                isEditable={isAuthenticated}
              />
            </div>

            <Button className="w-full" onClick={handleCreateLobby}>
              Créer le lobby
            </Button>

            {!isAuthenticated && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <div className="text-center p-6">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-accent flex items-center justify-center">
                    <Lock className="w-6 h-6 text-accent-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    Connexion requise
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Connectez-vous pour créer un lobby multijoueur
                  </p>
                  <GoogleSignInButton />
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
