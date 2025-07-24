import { useWebSocketContext } from "@/context/WebSocketContext";
import { authClient } from "@/lib/auth-client";
import type { PlayerScore } from "@/types/game";
import { useCallback, useEffect, useState } from "react";

export function useMultiplayerGame(
  lobbyId: string,
  initialGameState?: {
    players?: Array<{
      id: string;
      name: string;
      score: number;
      progress: number;
      // Suppression du statut pendant le jeu - pas besoin de l'afficher
      // status: string;
      validatedCountries: string[];
      incorrectCountries: string[];
    }>;
  }
) {
  // SUPPRESSION de gameFinished et rankings
  const [playerScores, setPlayerScores] = useState<PlayerScore[]>(
    initialGameState?.players?.map((p) => ({
      id: p.id,
      name: p.name,
      score: p.score,
      progress: p.progress,
      validatedCountries: p.validatedCountries,
      incorrectCountries: p.incorrectCountries,
    })) || []
  );
  const [myProgress, setMyProgress] = useState<{
    validatedCountries: string[];
    incorrectCountries: string[];
  } | null>(null);

  const { sendMessage, lastMessage } = useWebSocketContext();
  const { data: session } = authClient.useSession();
  const currentUserId = session?.user?.id;
  const myPlayer = playerScores.find((p) => p.id === currentUserId);

  // Fonction pour synchroniser la progression avec le backend
  const syncProgressWithBackend = useCallback(
    (
      validatedCountries: string[],
      incorrectCountries: string[],
      score: number,
      totalQuestions: number
    ) => {
      setMyProgress({
        validatedCountries,
        incorrectCountries,
      });
      sendMessage({
        type: "update_player_progress",
        payload: {
          lobbyId,
          validatedCountries,
          incorrectCountries,
          score,
          totalQuestions,
        },
      });
    },
    [lobbyId, sendMessage]
  );

  useEffect(() => {
    if (initialGameState?.players) {
      const updatedPlayerScores = initialGameState.players.map((p) => ({
        id: p.id,
        name: p.name,
        score: p.score,
        progress: p.progress,
        validatedCountries: p.validatedCountries,
        incorrectCountries: p.incorrectCountries,
      }));
      setPlayerScores(updatedPlayerScores);
      if (currentUserId) {
        const myPlayerData = updatedPlayerScores.find(
          (p) => p.id === currentUserId
        );
        if (myPlayerData) {
          setMyProgress({
            validatedCountries: myPlayerData.validatedCountries || [],
            incorrectCountries: myPlayerData.incorrectCountries || [],
          });
        }
      }
    }
  }, [initialGameState?.players, currentUserId]);

  useEffect(() => {
    if (
      lastMessage?.type === "player_progress_update" &&
      (lastMessage.payload?.lobbyId === lobbyId ||
        lastMessage.data?.lobbyId === lobbyId)
    ) {
      const { players } = lastMessage.payload || lastMessage.data || {};
      if (players && Array.isArray(players)) {
        const playerScoresData = players as PlayerScore[];
        setPlayerScores(playerScoresData);
        if (currentUserId) {
          const myPlayerData = playerScoresData.find(
            (p) => p.id === currentUserId
          );
          if (myPlayerData) {
            setMyProgress({
              validatedCountries: myPlayerData.validatedCountries || [],
              incorrectCountries: myPlayerData.incorrectCountries || [],
            });
          }
        }
      }
    }
    if (
      lastMessage?.type === "score_update" &&
      lastMessage.data?.lobbyId === lobbyId
    ) {
      const { players } = lastMessage.data;
      if (players && Array.isArray(players)) {
        const playerScoresData = players as PlayerScore[];
        setPlayerScores(playerScoresData);
      }
    }
    if (
      lastMessage?.type === "player_joined" &&
      (lastMessage.payload?.lobbyId === lobbyId ||
        lastMessage.data?.lobbyId === lobbyId)
    ) {
      const { player } = lastMessage.payload || lastMessage.data || {};
      if (player) {
        const playerData = player as PlayerScore;
        setPlayerScores((prev) => {
          const existing = prev.find((p) => p.id === playerData.id);
          if (existing) {
            return prev.map((p) =>
              p.id === playerData.id ? { ...p, ...playerData } : p
            );
          }
          return [...prev, playerData];
        });
      }
    }
    if (
      lastMessage?.type === "player_left" &&
      (lastMessage.payload?.lobbyId === lobbyId ||
        lastMessage.data?.lobbyId === lobbyId)
    ) {
      const { playerId } = lastMessage.payload || lastMessage.data || {};
      if (playerId) {
        setPlayerScores((prev) => prev.filter((p) => p.id !== playerId));
      }
    }
  }, [lastMessage, lobbyId, currentUserId]);

  useEffect(() => {
    if (currentUserId && lobbyId) {
      const savedProgress = localStorage.getItem(
        `multiplayer_progress_${lobbyId}_${currentUserId}`
      );
      if (savedProgress) {
        try {
          const progress = JSON.parse(savedProgress);
          setMyProgress(progress);
        } catch (error) {
          console.error(
            "Erreur lors de la restauration de la progression:",
            error
          );
        }
      }
    }
  }, [currentUserId, lobbyId]);

  useEffect(() => {
    if (currentUserId && lobbyId && myProgress) {
      localStorage.setItem(
        `multiplayer_progress_${lobbyId}_${currentUserId}`,
        JSON.stringify(myProgress)
      );
    }
  }, [myProgress, currentUserId, lobbyId]);

  // Nettoyage du localStorage à la fin de la partie SUPPRIMÉ (car plus de gameFinished)

  // Gérer la déconnexion pendant la game
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (currentUserId && lobbyId) {
        sendMessage({
          type: "set_player_absent",
          payload: {
            lobbyId,
            absent: true,
          },
        });
      }
    };
    const handleVisibilityChange = () => {
      if (currentUserId && lobbyId) {
        // Ne rien faire pendant la partie
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [currentUserId, lobbyId, sendMessage]);

  return {
    playerScores,
    myProgress,
    myPlayer,
    syncProgressWithBackend,
    sendMessage,
  };
}
