import type { PlayerScore, Ranking } from "@/types/game";
import { useEffect, useState } from "react";
// Remplacer l'import de useWebSocket par useWebSocketContext
import { useWebSocketContext } from "@/context/WebSocketContext";

export function useMultiplayerGame(lobbyId: string) {
  const [gameFinished, setGameFinished] = useState(false);
  const [playerScores, setPlayerScores] = useState<PlayerScore[]>([]);
  const [rankings, setRankings] = useState<Ranking[]>([]);
  // Utiliser le contexte WebSocket au lieu du hook useWebSocket
  const { sendMessage, lastMessage } = useWebSocketContext();

  // Écouter les mises à jour des scores
  useEffect(() => {
    if (
      lastMessage?.type === "score_update" &&
      lastMessage.payload &&
      lastMessage.payload.lobbyId === lobbyId
    ) {
      try {
        // Vérifier que players existe et est un tableau avant de l'assigner
        if (Array.isArray(lastMessage.payload.players)) {
          setPlayerScores(lastMessage.payload.players as PlayerScore[]);
        }
      } catch (error) {
        console.error("Erreur lors de la mise à jour des scores:", error);
      }
    }
    if (
      lastMessage?.type === "game_end" &&
      lastMessage.payload?.lobbyId === lobbyId
    ) {
      try {
        // Vérifier que rankings existe et est un tableau avant de l'assigner
        if (Array.isArray(lastMessage.payload.rankings)) {
          setRankings(lastMessage.payload.rankings);
        }
        setGameFinished(true);
      } catch (error) {
        console.error("Erreur lors de la fin de partie:", error);
      }
    }
  }, [lastMessage, lobbyId]);

  return {
    gameFinished,
    playerScores,
    rankings,
    sendMessage,
  };
}
