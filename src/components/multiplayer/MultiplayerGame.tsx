import { Grid } from "@/components/layout/Grid";
import { GameContext } from "@/context/GameContext";
import { useAnswerTracking } from "@/hooks/useAnswerTracking";
import { useFilter } from "@/hooks/useFilter";
import { useMapGame, type Country } from "@/hooks/useMapGame";
import { useMultiplayerGame } from "@/hooks/useMultiplayerGame";
import { useEffect } from "react";
import { Form } from "../game/common/Form";
import { Map } from "../game/common/Map";
import { LobbyPlayerList } from "./LobbyPlayerList";
import { MultiplayerResults } from "./MultiplayerResults";
import { MultiplayerScore } from "./MultiplayerScore";

type MultiplayerGameProps = {
  lobbyId: string;
  gameState: {
    countries: Country[];
    settings: {
      selectedRegions: string[];
    };
  };
};

export const MultiplayerGame = ({
  lobbyId,
  gameState,
}: MultiplayerGameProps) => {
  const { countries } = gameState;
  const { filteredCountries, activeCountries } = useFilter(
    countries,
    gameState.settings.selectedRegions
  );

  const { gameFinished, playerScores, rankings, sendMessage } =
    useMultiplayerGame(lobbyId);
  const { trackCorrectAnswer, trackIncorrectAnswer } = useAnswerTracking();

  const map = useMapGame(filteredCountries, {
    mode: "quiz",
    onGameEnd: (score: number) => {
      // Envoyer le score final
      sendMessage({
        type: "update_game_progress",
        payload: {
          lobbyId,
          score,
          progress: 100, // 100% = terminé
        },
      });
    },
    onCorrectAnswer: () => {
      const { answerTime, isConsecutiveCorrect } = trackCorrectAnswer();

      // Envoyer les informations au serveur
      const progress =
        (map.validatedCountries.length / activeCountries.length) * 100;
      sendMessage({
        type: "update_game_progress",
        payload: {
          lobbyId,
          score: map.validatedCountries.length,
          progress,
          answerTime,
          isConsecutiveCorrect,
        },
      });
    },
    onIncorrectAnswer: () => {
      const { isConsecutiveCorrect } = trackIncorrectAnswer();

      // Envoyer les informations au serveur
      const progress =
        (map.validatedCountries.length / activeCountries.length) * 100;
      sendMessage({
        type: "update_game_progress",
        payload: {
          lobbyId,
          score: map.validatedCountries.length,
          progress,
          isConsecutiveCorrect,
        },
      });
    },
  });

  // Envoyer les mises à jour de progression
  useEffect(() => {
    const interval = setInterval(() => {
      if (!gameFinished) {
        const progress =
          (map.validatedCountries.length / activeCountries.length) * 100;
        sendMessage({
          type: "update_game_progress",
          payload: {
            lobbyId,
            score: map.validatedCountries.length,
            progress,
          },
        });
      }
    }, 1000); // Mise à jour toutes les secondes

    return () => clearInterval(interval);
  }, [
    map.validatedCountries.length,
    activeCountries.length,
    gameFinished,
    lobbyId,
    sendMessage,
  ]);

  // Nettoyer les ressources lors du démontage du composant
  useEffect(() => {
    return () => {
      // Supprimer le gameState du localStorage
      localStorage.removeItem(`gameState_${lobbyId}`);

      // Informer le serveur que le joueur quitte la partie
      sendMessage({
        type: "leave_game",
        payload: {
          lobbyId,
        },
      });
    };
  }, [lobbyId, sendMessage]);

  if (gameFinished) {
    return <MultiplayerResults rankings={rankings} onRestart={() => {}} />;
  }

  return (
    <GameContext.Provider value={map}>
      <div className="container mx-auto px-4 py-8">
        <Grid>
          <div className="col-span-12 lg:col-span-8">
            <Map />
          </div>
          <div className="col-span-12 lg:col-span-4 space-y-4">
            <MultiplayerScore
              playerScores={playerScores}
              totalCountries={activeCountries.length}
            />
            <LobbyPlayerList
              players={playerScores.map((player) => ({
                id: player.id,
                name: player.name,
                status: player.status,
              }))}
              title="Joueurs dans la partie"
            />
            <Form />
          </div>
        </Grid>
      </div>
    </GameContext.Provider>
  );
};
