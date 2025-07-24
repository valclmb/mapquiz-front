import { GameContext } from "@/context/GameContext";
import { useFilter } from "@/hooks/useFilter";
import { useMapGame } from "@/hooks/useMapGame";
import { useMultiplayerGame } from "@/hooks/useMultiplayerGame";
import { authClient } from "@/lib/auth-client";
import type { Country } from "@/lib/data";
import type { LobbyState, MultiplayerPlayer } from "@/types/lobby";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Form } from "../game/common/Form";
import { Map } from "../game/common/Map";
import { Button } from "../ui/button";
import Typography from "../ui/Typography";
import { LobbyScoreList } from "./LobbyScoreList";

type MultiplayerGameProps = {
  lobby: LobbyState | null;
  countries: Country[];
  selectedRegions: string[];
};

export const MultiplayerGame = ({
  lobby,
  countries,
  selectedRegions,
}: MultiplayerGameProps) => {
  const lobbyId = lobby?.lobbyId || "";
  // Cast les joueurs en MultiplayerPlayer (si le backend ne les fournit pas déjà typés)
  const players: MultiplayerPlayer[] = (lobby?.players ??
    []) as MultiplayerPlayer[];
  // Crée un lobby adapté pour le hook
  const multiplayerLobby = lobby ? { ...lobby, players } : { players: [] };

  const { filteredCountries, activeCountries } = useFilter(
    countries,
    selectedRegions
  );
  const navigate = useNavigate();

  const { playerScores, sendMessage, myProgress, syncProgressWithBackend } =
    useMultiplayerGame(lobbyId, multiplayerLobby);

  // Récupérer ma progression depuis les players si disponible
  const { data: session } = authClient.useSession();
  const currentUserId = session?.user?.id;
  const myGameStateProgress = players.find((p) => p.id === currentUserId);

  const isGameActive =
    lobby?.status === "playing" || lobby?.status === "waiting";

  const initialValidatedCountries = isGameActive
    ? myProgress?.validatedCountries ||
      myGameStateProgress?.validatedCountries ||
      []
    : [];
  const initialIncorrectCountries = isGameActive
    ? myProgress?.incorrectCountries ||
      myGameStateProgress?.incorrectCountries ||
      []
    : [];

  console.log("[MultiplayerGame] status:", lobby?.status, {
    initialValidatedCountries,
    initialIncorrectCountries,
  });

  const map = useMapGame(filteredCountries, {
    mode: "quiz",
    isMultiplayer: true,
    initialValidatedCountries,
    initialIncorrectCountries,
    onProgressSync: syncProgressWithBackend,
    onMultiplayerGameEnd: () => {
      sendMessage({
        type: "update_player_progress",
        payload: {
          lobbyId,
          validatedCountries: map.validatedCountries,
          incorrectCountries: map.incorrectCountries,
          score: map.validatedCountries.length,
          totalQuestions: activeCountries.length,
        },
      });
      console.log("Fin de jeu multijoueur - message envoyé au backend");
    },
    onGameEnd: (score: number) => {
      sendMessage({
        type: "update_player_progress",
        payload: {
          lobbyId,
          validatedCountries: map.validatedCountries,
          incorrectCountries: map.incorrectCountries,
          score,
          totalQuestions: activeCountries.length,
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

  if (!lobby) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de la partie...</p>
        </div>
      </div>
    );
  }

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
          <Button onClick={() => window.location.reload()}>
            Rafraîchir la page
          </Button>
        </div>
      </div>
    );
  }

  if (!isGameActive) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">
            En attente du démarrage de la partie...
          </p>
        </div>
      </div>
    );
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
        <Map selectedRegions={selectedRegions} />
      </div>

      <Form />
    </GameContext.Provider>
  );
};
