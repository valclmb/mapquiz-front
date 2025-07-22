import { MultiplayerResults } from "@/components/multiplayer/MultiplayerResults";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/multiplayer/$lobbyId/result")({
  component: GameResultPage,
});

function GameResultPage() {
  // const { lobbyId } = Route.useParams();
  // Dummy data pour l'exemple
  const dummyRankings = [
    { id: "1", name: "Joueur 1", score: 100, rank: 1, completionTime: 120 },
    { id: "2", name: "Joueur 2", score: 80, rank: 2, completionTime: 150 },
  ];
  return <MultiplayerResults rankings={dummyRankings} onRestart={() => {}} />;
}
