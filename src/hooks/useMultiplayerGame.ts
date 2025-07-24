import { useWebSocketContext } from "@/context/WebSocketContext";
import { authClient } from "@/lib/auth-client";
import type { PlayerScore, Ranking } from "@/types/game";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

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
  const [gameFinished, setGameFinished] = useState(false);
  const [playerScores, setPlayerScores] = useState<PlayerScore[]>(
    initialGameState?.players?.map((p) => ({
      id: p.id,
      name: p.name,
      score: p.score,
      progress: p.progress,
      // Suppression du statut pendant le jeu - pas besoin de l'afficher
      // status: p.status,
      validatedCountries: p.validatedCountries,
      incorrectCountries: p.incorrectCountries,
    })) || []
  );
  const [rankings, setRankings] = useState<Ranking[]>([]);
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
      // Mettre à jour l'état local
      setMyProgress({
        validatedCountries,
        incorrectCountries,
      });

      // Envoyer au backend
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

  // Mettre à jour les playerScores quand le gameState initial change (après refresh)
  useEffect(() => {
    if (initialGameState?.players) {
      const updatedPlayerScores = initialGameState.players.map((p) => ({
        id: p.id,
        name: p.name,
        score: p.score,
        progress: p.progress,
        // Suppression du statut pendant le jeu - pas besoin de l'afficher
        // status: p.status,
        validatedCountries: p.validatedCountries,
        incorrectCountries: p.incorrectCountries,
      }));
      setPlayerScores(updatedPlayerScores);
      console.log(
        "PlayerScores mis à jour depuis le gameState:",
        updatedPlayerScores
      );

      // Mettre à jour myProgress avec les données du joueur actuel
      if (currentUserId) {
        const myPlayerData = updatedPlayerScores.find(
          (p) => p.id === currentUserId
        );
        if (myPlayerData) {
          setMyProgress({
            validatedCountries: myPlayerData.validatedCountries || [],
            incorrectCountries: myPlayerData.incorrectCountries || [],
          });
          console.log("myProgress mis à jour depuis le gameState:", {
            validatedCountries: myPlayerData.validatedCountries || [],
            incorrectCountries: myPlayerData.incorrectCountries || [],
          });
        }
      }
    }
  }, [initialGameState?.players, currentUserId]);

  // Écouter les mises à jour des joueurs
  useEffect(() => {
    // Gérer les messages de mise à jour de progression des joueurs (payload field)
    if (
      lastMessage?.type === "player_progress_update" &&
      (lastMessage.payload?.lobbyId === lobbyId ||
        lastMessage.data?.lobbyId === lobbyId)
    ) {
      console.log("useMultiplayerGame - Traitement player_progress_update:", {
        message: lastMessage,
        payload: lastMessage.payload,
        data: lastMessage.data,
        players: lastMessage.payload?.players || lastMessage.data?.players,
      });

      const { players } = lastMessage.payload || lastMessage.data || {};
      if (players && Array.isArray(players)) {
        const playerScoresData = players as PlayerScore[];
        console.log(
          "🔍 Frontend - Données reçues (player_progress_update):",
          playerScoresData.map((p) => ({
            id: p.id,
            name: p.name,
            status: p.status,
            score: p.score,
            progress: p.progress,
          }))
        );
        setPlayerScores(playerScoresData);

        // Mettre à jour myProgress avec les données du joueur actuel
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

        // Vérifier si le jeu est terminé (tous les joueurs ont 100% de progression)
        const allFinished = playerScoresData.every(
          (player) => player.progress >= 100
        );
        console.log("useMultiplayerGame - Vérification fin de jeu:", {
          playerScoresData: playerScoresData.map((p) => ({
            id: p.id,
            name: p.name,
            progress: p.progress,
          })),
          allFinished,
          gameFinished,
        });
        if (allFinished && !gameFinished) {
          console.log("useMultiplayerGame - Fin de jeu déclenchée !");
          setGameFinished(true);
          toast.success("Partie terminée !");
        }
      }
    }

    // Gérer les messages de mise à jour de score (data field)
    if (
      lastMessage?.type === "score_update" &&
      lastMessage.data?.lobbyId === lobbyId
    ) {
      console.log("useMultiplayerGame - Traitement score_update:", {
        message: lastMessage,
        data: lastMessage.data,
        players: lastMessage.data?.players,
      });

      const { players } = lastMessage.data;
      if (players && Array.isArray(players)) {
        const playerScoresData = players as PlayerScore[];
        console.log(
          "useMultiplayerGame - Mise à jour des scores:",
          playerScoresData
        );
        setPlayerScores(playerScoresData);

        // Vérifier si le jeu est terminé (tous les joueurs ont 100% de progression)
        const allFinished = playerScoresData.every(
          (player) => player.progress >= 100
        );
        console.log(
          "useMultiplayerGame - Vérification fin de jeu (score_update):",
          {
            playerScoresData: playerScoresData.map((p) => ({
              id: p.id,
              name: p.name,
              progress: p.progress,
            })),
            allFinished,
            gameFinished,
          }
        );
        if (allFinished && !gameFinished) {
          console.log(
            "useMultiplayerGame - Fin de jeu déclenchée (score_update) !"
          );
          setGameFinished(true);
          toast.success("Partie terminée !");
        }
      }
    }

    if (
      lastMessage?.type === "game_results" &&
      (lastMessage.payload?.lobbyId === lobbyId ||
        lastMessage.data?.lobbyId === lobbyId)
    ) {
      const { rankings: gameRankings } =
        lastMessage.payload || lastMessage.data || {};
      if (gameRankings && Array.isArray(gameRankings)) {
        console.log(
          "useMultiplayerGame - Rankings reçus (game_results):",
          gameRankings
        );
        setRankings(gameRankings);
        setGameFinished(true);
      }
    }

    if (
      lastMessage?.type === "game_end" &&
      (lastMessage.payload?.lobbyId === lobbyId ||
        lastMessage.data?.lobbyId === lobbyId)
    ) {
      const { rankings: gameRankings } =
        lastMessage.payload || lastMessage.data || {};
      if (gameRankings && Array.isArray(gameRankings)) {
        console.log(
          "useMultiplayerGame - Rankings reçus (game_end):",
          gameRankings
        );
        setRankings(gameRankings);
        setGameFinished(true);
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
  }, [lastMessage, lobbyId, gameFinished]);

  // Restaurer la progression depuis le localStorage au chargement
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

  // Sauvegarder la progression dans le localStorage
  useEffect(() => {
    if (currentUserId && lobbyId && myProgress) {
      localStorage.setItem(
        `multiplayer_progress_${lobbyId}_${currentUserId}`,
        JSON.stringify(myProgress)
      );
    }
  }, [myProgress, currentUserId, lobbyId]);

  // Nettoyer le localStorage quand le jeu est terminé
  useEffect(() => {
    if (gameFinished && currentUserId && lobbyId) {
      localStorage.removeItem(
        `multiplayer_progress_${lobbyId}_${currentUserId}`
      );
    }
  }, [gameFinished, currentUserId, lobbyId]);

  // Gérer la déconnexion pendant la game
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (currentUserId && lobbyId) {
        console.log(
          "useMultiplayerGame - Marquage comme absent avant fermeture"
        );
        sendMessage({
          type: "set_player_absent",
          payload: {
            lobbyId,
            absent: true,
          },
        });
      }
    };

    // PENDANT UNE PARTIE, on ne marque PAS les joueurs comme absents
    // quand ils changent d'onglet ou minimisent la fenêtre
    // Ils restent en statut 'playing' même s'ils ne sont pas visibles
    const handleVisibilityChange = () => {
      if (currentUserId && lobbyId) {
        // Ne rien faire pendant la partie - les joueurs restent "playing"
        console.log(
          `useMultiplayerGame - Changement de visibilité ignoré pendant la partie (hidden: ${document.hidden})`
        );
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
    gameFinished,
    playerScores,
    rankings,
    myProgress,
    myPlayer,
    syncProgressWithBackend,
    sendMessage,
  };
}
