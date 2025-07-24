import { UserList } from "@/components/social/UserList";
import { useLobby } from "@/context/LobbyProvider";
import { useWebSocketContext } from "@/context/WebSocketContext";
import { authClient } from "@/lib/auth-client";
import type { Continent } from "@/types/continent";
import type { Player } from "@/types/game";
import { useNavigate } from "@tanstack/react-router";
import { ContinentSelector } from "../game/common/ContinentSelector";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import Typography from "../ui/Typography";

type LobbyRoomProps = {
  lobbyId: string;
  isHost?: boolean;
};

export const LobbyRoom = ({ lobbyId }: LobbyRoomProps) => {
  const { lobby } = useLobby();
  const players = lobby?.players ?? [];
  const settings = lobby?.settings ?? { selectedRegions: [] };
  const hostId = lobby?.hostId;
  // Pour isHost, il faut récupérer l'utilisateur courant
  // (tu peux adapter selon ta logique d'auth)
  const { data: session } = authClient.useSession();
  const currentUserId = session?.user?.id;
  const isHost = currentUserId && hostId ? currentUserId === hostId : false;

  const { sendMessage } = useWebSocketContext();
  const navigate = useNavigate();

  // Trouver le joueur courant
  const me = players.find((p: Player) => p.id === currentUserId);
  const isReady = me?.status === "ready";

  // Fonction pour changer le statut prêt/pas prêt
  const toggleReady = () => {
    sendMessage({
      type: "update_player_status",
      payload: {
        lobbyId,
        status: isReady ? "joined" : "ready",
      },
    });
  };

  // Fonction pour quitter le lobby
  const leaveLobby = () => {
    sendMessage({
      type: "leave_lobby",
      payload: { lobbyId },
    });
    navigate({ to: "/" });
  };

  // Les joueurs du message lobby_update incluent maintenant les joueurs
  const allPlayers: Player[] = players;
  const currentPlayerIds = allPlayers.map((player: Player) => player.id);

  // Fonction pour supprimer un joueur (connecté ou déconnecté)
  const handleRemovePlayer = async (playerId: string) => {
    if (!isHost) return;

    try {
      // Envoyer un message WebSocket pour supprimer le joueur
      sendMessage({
        type: "remove_player",
        payload: {
          lobbyId,
          playerId,
        },
      });
    } catch (error) {
      console.error("Erreur lors de la suppression du joueur:", error);
    }
  };
  console.log("settings", settings);

  const handleUpdateContinents = (continents: Continent[]) => {
    sendMessage({
      type: "update_lobby_settings",
      payload: {
        lobbyId,
        settings: {
          selectedRegions: continents,
          gameMode: settings.gameMode,
        },
      },
    });
  };

  // Suppression de l'effet lié à lastMessage (plus utilisé)

  return (
    <div>
      <div className="w-full mx-auto space-y-6">
        <Typography variant="h1">Lobby Multijoueur</Typography>
        <Card>
          <CardContent className="space-y-3">
            <div className="space-y-4 ">
              <Typography variant="h3">Continents </Typography>
              <ContinentSelector
                isEditable={isHost}
                selectedContinents={settings.selectedRegions}
                onChange={handleUpdateContinents}
              />
            </div>

            {/* Colonne 1: Liste des joueurs */}
            <div className="flex flex-col md:flex-row gap-10 mt-14">
              <UserList
                title="Joueurs dans le lobby"
                className="w-full md:w-1/3 "
                customUsers={allPlayers}
                showStatus={true}
                hostId={hostId}
                isHost={isHost}
                onRemovePlayer={handleRemovePlayer}
              />

              <UserList
                title="Inviter des amis"
                className="w-full md:w-1/3"
                filterUsers={(friend) => !currentPlayerIds.includes(friend.id)}
                showInviteForOffline={true}
                onInvite={(friendId: string) => {
                  // Envoyer l'invitation au lobby via WebSocket
                  sendMessage({
                    type: "invite_to_lobby",
                    payload: {
                      lobbyId,
                      friendId,
                    },
                  });
                }}
              />
            </div>

            {/* Supprimer le composant DisconnectedPlayerActions car les joueurs déconnectés sont maintenant dans la liste principale */}

            <div className="flex gap-2">
              <Button
                onClick={toggleReady}
                variant={isReady ? "destructive" : "default"}
              >
                {isReady ? "Annuler prêt" : "Je suis prêt"}
              </Button>

              {/* Bouton pour quitter le lobby */}
              <Button onClick={leaveLobby} variant="destructive">
                Quitter le lobby
              </Button>
            </div>
            {/* allPlayersReady && (
              <div className="text-green-600 font-bold mt-4">
                Tous les joueurs sont prêts ! La partie va démarrer...
              </div>
            ) */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
