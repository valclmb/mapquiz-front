import { GameContext } from "@/context/GameContext";
import { useFilter } from "@/hooks/useFilter";
import { useMapGame, type Country } from "@/hooks/useMapGame";
import { useMultiplayerGame } from "@/hooks/useMultiplayerGame";
import { authClient } from "@/lib/auth-client";
import { useEffect } from "react";
import { Form } from "../game/common/Form";
import { Map } from "../game/common/Map";
import Typography from "../ui/Typography";
import { LobbyScoreList } from "./LobbyScoreList";
import { MultiplayerResults } from "./MultiplayerResults";

type MultiplayerGameProps = {
  lobbyId: string;
  gameState: {
    countries: Country[];
    settings: {
      selectedRegions: string[];
    };
    players?: Array<{
      id: string;
      name: string;
      score: number;
      progress: number;
      status: string;
      validatedCountries: string[];
      incorrectCountries: string[];
    }>;
  };
};

export const MultiplayerGame = ({
  lobbyId,
  gameState,
}: MultiplayerGameProps) => {
  const { countries } = gameState;
  const { filteredCountries, activeCountries } = useFilter(
    countries || [],
    gameState.settings.selectedRegions
  );

  const {
    gameFinished,
    playerScores,
    rankings,
    sendMessage,
    myProgress,
    syncProgressWithBackend,
  } = useMultiplayerGame(lobbyId, gameState);

  // Récupérer ma progression depuis le gameState si disponible
  const { data: session } = authClient.useSession();
  const currentUserId = session?.user?.id;
  const myGameStateProgress = gameState.players?.find(
    (p) => p.id === currentUserId
  );

  // Utiliser la progression du hook en priorité, sinon celle du gameState
  const initialValidatedCountries =
    myProgress?.validatedCountries ||
    myGameStateProgress?.validatedCountries ||
    [];
  const initialIncorrectCountries =
    myProgress?.incorrectCountries ||
    myGameStateProgress?.incorrectCountries ||
    [];

  const map = useMapGame(filteredCountries, {
    mode: "quiz",
    isMultiplayer: true, // Activer la logique de fin de jeu multijoueur
    initialValidatedCountries,
    initialIncorrectCountries,
    onProgressSync: syncProgressWithBackend,
    onMultiplayerGameEnd: () => {
      // Envoyer le score final avec la progression complète
      sendMessage({
        type: "update_player_progress",
        payload: {
          lobbyId,
          validatedCountries: map.validatedCountries,
          incorrectCountries: map.incorrectCountries,
          score: map.validatedCountries.length,
          totalQuestions: activeCountries.length, // Utiliser les pays actifs
        },
      });
      console.log("Fin de jeu multijoueur - message envoyé au backend");
    },
    onGameEnd: (score: number) => {
      // Envoyer le score final avec la progression complète
      sendMessage({
        type: "update_player_progress",
        payload: {
          lobbyId,
          validatedCountries: map.validatedCountries,
          incorrectCountries: map.incorrectCountries,
          score,
          totalQuestions: activeCountries.length, // Utiliser les pays actifs
        },
      });
    },
    onCorrectAnswer: () => {
      // La progression est déjà synchronisée via onProgressSync dans useMapGame
    },
    onIncorrectAnswer: () => {
      // La progression est déjà synchronisée via onProgressSync dans useMapGame
    },
  });

  // Nettoyer les ressources lors du démontage du composant
  useEffect(() => {
    return () => {
      // Ne plus envoyer automatiquement le message leave_game
      // Cela causait des problèmes de synchronisation
      console.log(
        "MultiplayerGame - Composant démonté sans envoyer leave_game"
      );
    };
  }, []);

  // Protection contre countries undefined
  if (!countries || !Array.isArray(countries)) {
    console.error("MultiplayerGame - countries invalide:", countries);
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-600">Erreur</h1>
          <p className="text-gray-600 mb-4">
            Impossible de charger les données de pays. Veuillez rafraîchir la
            page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Rafraîchir la page
          </button>
        </div>
      </div>
    );
  }

  if (gameFinished) {
    return <MultiplayerResults rankings={rankings} onRestart={() => {}} />;
  }

  return (
    <GameContext.Provider value={map}>
      <Typography variant="h2" className="text-center">
        MULTIJOUEUR
      </Typography>
      <div className="relative flex items-start mt-4 " dir="ltr">
        <LobbyScoreList
          players={playerScores}
          totalCountries={activeCountries.length}
          className="border-secondary rounded-none rounded-s-2xl translate-x-[2px] shadow-none z-0 mt-10"
        />
        <Map />
      </div>

      <Form />
    </GameContext.Provider>
  );
};
