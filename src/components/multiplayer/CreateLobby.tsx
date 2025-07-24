import { ContinentSelector } from "@/components/game/common/ContinentSelector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWebSocketContext } from "@/context/WebSocketContext";
import { DEFAULT_CONTINENT } from "@/lib/constants";
import type { Continent } from "@/types/continent";
import { useState } from "react";
import { toast } from "sonner";

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
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Créer un lobby multijoueur</CardTitle>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
};
