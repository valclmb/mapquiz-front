import { Grid } from "@/components/layout/Grid";
import { LobbyRoom } from "@/components/multiplayer/LobbyRoom";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/multiplayer/$lobbyId")({
  component: LobbyDetailPage,
});

function LobbyDetailPage() {
  const { lobbyId } = Route.useParams();
  const [isHost, setIsHost] = useState(false);

  // Déterminer si l'utilisateur est l'hôte du lobby
  useEffect(() => {
    // Pour simplifier, on considère que l'utilisateur est l'hôte s'il vient de créer le lobby
    // Dans une implémentation complète, il faudrait vérifier avec le backend
    const checkIfHost = async () => {
      // Logique pour vérifier si l'utilisateur est l'hôte
      setIsHost(true);
    };

    checkIfHost();
  }, [lobbyId]);

  return (
    <main className="flex w-11/12 m-auto flex-grow min-w-screen h-full overflow-hidden flex-col items-center justify-between">
      <Grid>
        <LobbyRoom lobbyId={lobbyId} isHost={isHost} />
      </Grid>
    </main>
  );
}
