import { MultiplayerGame } from "@/components/multiplayer/MultiplayerGame";
import type { Country } from "@/hooks/useMapGame";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/multiplayer/game/$lobbyId")({
  component: MultiplayerGamePage,
});

type GameState = {
  countries: Country[];
  settings: {
    selectedRegions: string[];
  };
};

function MultiplayerGamePage() {
  const { lobbyId } = Route.useParams();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Récupérer le gameState du localStorage
    const storedGameState = localStorage.getItem(`gameState_${lobbyId}`);
    if (storedGameState) {
      try {
        const parsedGameState = JSON.parse(storedGameState);
        setGameState(parsedGameState);
      } catch (error) {
        console.error("Erreur lors du parsing du gameState:", error);
      }
    }
    setLoading(false);
  }, [lobbyId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Chargement...
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold mb-4">Erreur</h1>
        <p>Impossible de charger l'état du jeu.</p>
      </div>
    );
  }

  return <MultiplayerGame lobbyId={lobbyId} gameState={gameState} />;
}
