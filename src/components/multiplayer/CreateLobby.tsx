import { ContinentSelector } from "@/components/game/common/ContinentSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWebSocketContext } from "@/context/WebSocketContext";
import { DEFAULT_CONTINENT } from "@/lib/constants";
import type { Continent } from "@/types/continent";
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
    <Dialog>
      <DialogTrigger asChild>
        <Button>Créer un lobby</Button>
      </DialogTrigger>
      <DialogContent>
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
            />
          </div>

          <Button
            className="w-full"
            onClick={handleCreateLobby}
            disabled={!isAuthenticated || !isConnected}
          >
            Créer le lobby
          </Button>

          {!isAuthenticated && (
            <p className="text-sm text-red-500 mt-2">
              Vous devez être connecté pour créer un lobby.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
