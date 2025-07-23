import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Friend } from "./queries/useFriends";

import type { LobbySettings, Player } from "@/types/game";

export interface WebSocketMessage {
  type: string;
  payload?: {
    friendId?: string;
    isOnline?: boolean;
    lastSeen?: string;
    action?: string;
    message?: string;
    request?: unknown;
    lobbyId?: string;
    players?: Player[];
    settings?: LobbySettings;
    hostId?: string;
    [key: string]: unknown;
  };
  message?: string;
  lobbyId?: string;
  data?: {
    lobby?: {
      id: string;
      [key: string]: unknown;
    };
    players?: Player[]; // Ajouter cette ligne
    settings?: LobbySettings; // Ajouter cette ligne
    [key: string]: unknown;
  };
}

interface UseWebSocketOptions {
  userId?: string;
  onFriendRequestReceived?: (request: unknown) => void;
  onFriendStatusChange?: (
    friendId: string,
    isOnline: boolean,
    lastSeen: string
  ) => void;
}

export function useWebSocket({
  userId,
  onFriendRequestReceived,
  onFriendStatusChange,
}: UseWebSocketOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const queryClient = useQueryClient();
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  // const maxReconnectAttempts = 5;

  // Stocke les callbacks externes (navigation, etc.)
  const externalCallbacksRef = useRef<{
    onLobbyJoined?: (lobbyId: string) => void;
    onGameStart?: (lobbyId: string) => void;
  }>({});
  const setExternalCallbacks = useCallback(
    (callbacks: {
      onLobbyJoined?: (lobbyId: string) => void;
      onGameStart?: (lobbyId: string) => void;
    }) => {
      externalCallbacksRef.current = callbacks;
    },
    []
  );

  // Fonction pour se déconnecter (déplacée avant connect)
  const disconnect = useCallback(() => {
    console.log("Déconnexion WebSocket");
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
    setIsAuthenticated(false);
  }, []);

  // Ne pas établir de connexion si userId n'existe pas
  const connect = useCallback(() => {
    console.log("OUVERTURE WEBSOCKET", new Date().toISOString());
    if (!userId) {
      setIsConnected(false);
      setIsAuthenticated(false);
      return;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const wsUrl =
        import.meta.env.VITE_WS_URL ||
        (process.env.NODE_ENV === "production"
          ? `wss://${window.location.host}/ws`
          : "ws://localhost:3000/ws");

      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log("WebSocket connecté");
        setIsConnected(true);
        setReconnectAttempts(0); // Réinitialiser les tentatives de reconnexion

        // Authentifier automatiquement si userId est disponible
        if (userId) {
          authenticate(userId);
        } else {
          // Si pas d'userId, fermer la connexion
          disconnect();
        }
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          handleMessage(message);
        } catch (error) {
          console.error("Erreur parsing message WebSocket:", error);
        }
      };

      wsRef.current.onclose = () => {
        console.log("WebSocket déconnecté");
        setIsConnected(false);
        setIsAuthenticated(false);

        // Réactiver la reconnexion automatique
        const maxReconnectAttempts = 5;
        if (reconnectAttempts < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
          console.log(
            `Tentative de reconnexion dans ${delay}ms... (${reconnectAttempts + 1}/${maxReconnectAttempts})`
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            setReconnectAttempts((prev) => prev + 1);
            connect();
          }, delay);
        } else {
          console.error("Nombre maximum de tentatives de reconnexion atteint");
          toast.error(
            "Connexion WebSocket perdue. Veuillez rafraîchir la page."
          );
        }
      };

      wsRef.current.onerror = (error) => {
        console.error("Erreur WebSocket détaillée:", {
          error,
          readyState: wsRef.current?.readyState,
          url: wsUrl,
        });
      };
    } catch (error) {
      console.error("Erreur lors de la connexion WebSocket:", error);
    }
  }, [userId, reconnectAttempts, disconnect]);

  // Fonction pour gérer les messages reçus
  const handleMessage = useCallback(
    (message: WebSocketMessage) => {
      // Ajouter un log pour tous les messages reçus
      console.log("Message WebSocket reçu:", message);

      // Mettre à jour le dernier message reçu
      setLastMessage(message);
      switch (message.type) {
        case "authenticated":
          setIsAuthenticated(true);
          console.log("Authentifié via WebSocket");
          break;

        case "auth_error":
          console.error("Erreur d'authentification:", message.message);
          setIsAuthenticated(false);
          break;

        case "connected":
          console.log("Connexion WebSocket établie:", message.message);
          // Pas besoin de changer l'état ici, car setIsConnected(true) est déjà appelé dans onopen
          break;

        case "friend_request_received":
          toast("Nouvelle demande d'ami reçue !", {
            action: {
              label: "Voir",
              onClick: () => {
                // Redirige vers l'onglet social
                // router.navigate("/social"); // This line was commented out in the original file
              },
            },
          });
          // Invalider la liste pour mise à jour en temps réel si déjà sur la page
          queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
          break;

        case "friend_request_sent":
          toast.success("Invitation envoyée!");
          break;

        case "send_friend_request_success":
          toast.success("Demande d'ami envoyée avec succès!");
          break;

        case "friend_request_accepted":
          toast.success("Votre demande d'ami a été acceptée!");

          // Invalider les requêtes pour mettre à jour l'UI
          queryClient.invalidateQueries({ queryKey: ["friends"] });
          queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
          break;

        case "friend_request_responded": {
          const action = message.payload?.action;
          toast.success(message.payload?.message);

          // Invalider les requêtes pour mettre à jour l'UI
          queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
          if (action === "accepted") {
            queryClient.invalidateQueries({ queryKey: ["friends"] });
          }
          break;
        }

        case "friend_status_change": {
          console.log("Changement de statut d'ami:", message.payload);

          // Mettre à jour le cache des amis
          queryClient.setQueryData(
            ["friends"],
            (oldData: Friend[] | undefined) => {
              if (!oldData) return oldData;

              return oldData.map((friend: Friend) => {
                if (friend.id === message.payload?.friendId) {
                  return {
                    ...friend,
                    isOnline: message.payload?.isOnline,
                    lastSeen: message.payload?.lastSeen,
                  };
                }
                return friend;
              });
            }
          );

          if (
            onFriendStatusChange &&
            message.payload?.friendId &&
            message.payload?.isOnline !== undefined &&
            message.payload?.lastSeen
          ) {
            onFriendStatusChange(
              message.payload.friendId,
              message.payload.isOnline,
              message.payload.lastSeen
            );
          }
          break;
        }

        case "pong":
          // Réponse au ping, connexion active
          break;

        case "error":
          console.error("Erreur WebSocket:", message.message);
          toast.error(message.message || "Erreur WebSocket");
          break;

        case "create_lobby_success":
          console.log("Lobby créé avec succès:", message);
          toast.success("Lobby créé avec succès!");

          // Transformer ce message en un message de type "lobby_update"
          // pour que le hook useLobbyRoom puisse le traiter
          if (message.data?.lobby?.id) {
            setLastMessage({
              type: "lobby_update",
              payload: {
                lobbyId: message.data.lobby.id,
                players: message.data.players,
                settings: message.data.settings,
                hostId: message.data.hostId as string, // Ajouter le hostId
                status: message.data.lobby.status,
              },
            });
            // Utilise le callback externe pour la navigation
            externalCallbacksRef.current.onLobbyJoined?.(message.data.lobby.id);
          }
          break;

        case "lobby_invitation":
          console.log("Invitation à un lobby reçue:", message.payload);
          toast(
            `Vous avez été invité à rejoindre le lobby "${message.payload?.lobbyName}" par ${message.payload?.hostName}`,
            {
              action: {
                label: "Rejoindre",
                onClick: () => {
                  if (message.payload?.lobbyId) {
                    // Envoyer un message pour rejoindre le lobby
                    sendMessage({
                      type: "join_lobby",
                      payload: {
                        lobbyId: message.payload.lobbyId,
                      },
                    });

                    // Rediriger vers la page du lobby
                    externalCallbacksRef.current.onLobbyJoined?.(
                      message.payload.lobbyId
                    );
                  }
                },
              },
            }
          );
          break;
        case "invite_to_lobby_success":
          // Transformer ce message en un message de type "lobby_update"
          // pour que le hook useLobbyRoom puisse le traiter
          if (message.payload?.lobbyId && message.payload?.players) {
            setLastMessage({
              type: "lobby_update",
              payload: {
                lobbyId: message.payload.lobbyId,
                players: message.payload.players,
                settings: message.payload.settings,
                hostId: message.payload.hostId as string, // Ajouter le hostId
              },
            });
            toast.success("Invitation envoyée avec succès");
          }
          break;

        case "join_lobby_success":
          // Ne faire le toast et la navigation que lors du join initial
          if (message.data?.lobby?.id) {
            setLastMessage({
              type: "lobby_update",
              payload: {
                lobbyId: message.data.lobby.id,
                players: message.data.players,
                settings: message.data.settings,
                hostId: message.data.hostId as string,
              },
            });
            toast.success("Lobby rejoint avec succès");
            externalCallbacksRef.current.onLobbyJoined?.(message.data.lobby.id);
          }
          break;

        case "lobby_update":
          // Ne faire que la mise à jour d'état, pas de toast/navigation
          setLastMessage(message);
          break;

        case "set_player_ready_success":
          // Afficher un toast de succès
          toast.success(String(message.data?.message || "Statut mis à jour"));
          break;

        case "start_game_success":
          // Afficher un toast de succès
          toast.success("Partie démarrée avec succès!");
          break;

        case "leave_game_success":
          toast.success("Vous avez quitté la partie");
          externalCallbacksRef.current.onLobbyJoined?.(""); // Redirige vers l'accueil si besoin
          break;

        case "leave_lobby_success":
          toast.success("Vous avez quitté le lobby");
          externalCallbacksRef.current.onLobbyJoined?.(""); // Redirige vers l'accueil si besoin
          break;

        case "remove_player_success":
          toast.success("Joueur supprimé avec succès");
          break;

        case "player_removed":
          toast.error("Vous avez été expulsé du lobby par l'hôte");
          // Rediriger vers l'accueil
          externalCallbacksRef.current.onLobbyJoined?.("");
          break;

        case "get_disconnected_players_success":
          // Ce message sera traité directement par useDisconnectedPlayers
          break;

        case "game_start": {
          console.log("Partie démarrée:", message.data);
          const gameStateData = message.data?.gameState as
            | { countries?: unknown[]; settings?: unknown }
            | undefined;
          console.log("game_start - détails du message:", {
            lobbyId: message.data?.lobbyId,
            gameState: message.data?.gameState,
            countriesCount: gameStateData?.countries?.length,
            settings: gameStateData?.settings,
          });

          // Si le message contient l'état du jeu, le traiter directement
          if (message.data?.gameState) {
            console.log(
              "game_start - traitement du gameState:",
              message.data.gameState
            );
            setLastMessage({
              type: "game_state_update",
              payload: {
                lobbyId: message.data.lobbyId as string,
                gameState: message.data.gameState,
              },
            });
          }

          // Rediriger vers la page du jeu
          if (
            message.data?.lobbyId &&
            typeof message.data.lobbyId === "string"
          ) {
            externalCallbacksRef.current.onGameStart?.(message.data.lobbyId);
          }
          break;
        }

        case "get_game_state_success":
          console.log("État du jeu reçu:", message.data);
          // Transformer ce message en un message de type "game_state_update"
          // pour que le hook useMultiplayerGame puisse le traiter
          if (message.data) {
            setLastMessage({
              type: "game_state_update",
              payload: {
                lobbyId: message.data.lobbyId as string,
                gameState: message.data.gameState,
              },
            });
          }
          break;

        case "get_lobby_state_success":
          console.log("État du lobby reçu:", message.data);
          // Ce message sera traité directement par useLobbyStatus
          break;

        case "score_update":
          console.log("Mise à jour de score reçue:", message.data);
          // Transformer ce message en un message de type "player_progress_update"
          // pour que le hook useMultiplayerGame puisse le traiter
          if (message.data) {
            setLastMessage({
              type: "player_progress_update",
              payload: {
                lobbyId: message.data.lobbyId as string,
                players: message.data.players,
                updatedPlayerId: message.data.updatedPlayerId,
              },
            });
          }
          break;

        case "update_game_progress_success":
          console.log("Mise à jour de progression confirmée:", message.data);
          // Ce message est juste une confirmation, pas besoin de traitement spécial
          break;

        case "update_lobby_settings_success":
          // toast.success("Paramètres du lobby mis à jour !");
          break;

        case "game_restarted": {
          console.log("Partie redémarrée par l'hôte:", message.payload);
          toast.success("Partie redémarrée par l'hôte !");
          // Rediriger vers le lobby
          const lobbyId = message.payload?.lobbyId;
          if (lobbyId && typeof lobbyId === "string") {
            externalCallbacksRef.current.onLobbyJoined?.(lobbyId);
          }
          break;
        }

        case "player_left_game":
          console.log("Un joueur a quitté la partie:", message.payload);
          toast.info(
            `${message.payload?.playerName || "Un joueur"} a quitté la partie`
          );

          // Transformer ce message en un message de type "lobby_update" pour mettre à jour l'UI
          if (message.payload?.lobbyId) {
            setLastMessage({
              type: "lobby_update",
              payload: {
                lobbyId: message.payload.lobbyId,
                playerLeft: true,
                leftPlayerId: message.payload.playerId,
                leftPlayerName: message.payload.playerName,
              },
            });
          }
          break;

        default:
          console.warn("Type de message WebSocket non géré:", message.type);
      }
    },
    [queryClient, onFriendRequestReceived, onFriendStatusChange]
  );

  // Fonction pour s'authentifier
  const authenticate = useCallback((userId: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "authenticate",
          payload: { userId },
        })
      );
    }
  }, []);

  // Ajouter ces fonctions à la fin du hook useWebSocket, avant le return

  // Fonction pour envoyer une demande d'ami
  const sendFriendRequest = useCallback(
    (receiverTag: string) => {
      if (wsRef.current?.readyState === WebSocket.OPEN && isAuthenticated) {
        wsRef.current.send(
          JSON.stringify({
            type: "send_friend_request",
            payload: { receiverTag },
          })
        );
      }
    },
    [isAuthenticated]
  );

  // Fonction pour répondre à une demande d'ami
  const respondToFriendRequest = useCallback(
    (requestId: string, action: "accept" | "reject") => {
      if (wsRef.current?.readyState === WebSocket.OPEN && isAuthenticated) {
        wsRef.current.send(
          JSON.stringify({
            type: "respond_friend_request",
            payload: { requestId, action },
          })
        );
      }
    },
    [isAuthenticated]
  );

  // Fonction pour envoyer un message
  const sendMessage = useCallback(
    (message: WebSocketMessage) => {
      if (wsRef.current?.readyState === WebSocket.OPEN && isAuthenticated) {
        wsRef.current.send(JSON.stringify(message));
      }
    },
    [isAuthenticated]
  );

  // Fonction pour envoyer un ping
  const ping = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "ping" }));
    }
  }, []);

  // Effet pour gérer la connexion
  useEffect(() => {
    if (userId) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [userId, connect, disconnect]);

  // Effet pour authentifier quand userId change ou après reconnexion
  useEffect(() => {
    if (userId && isConnected && !isAuthenticated) {
      console.log("Authentification automatique après connexion");
      authenticate(userId);
    }
  }, [userId, isConnected, isAuthenticated, authenticate]);

  // Effet pour réinitialiser l'authentification quand la connexion est perdue
  useEffect(() => {
    if (!isConnected) {
      setIsAuthenticated(false);
    }
  }, [isConnected]);

  // Ping périodique pour maintenir la connexion
  useEffect(() => {
    if (isConnected) {
      const pingInterval = setInterval(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          ping();
        }
        // Supprimer cette partie pour éviter la boucle infinie
        // else if (
        //   wsRef.current?.readyState === WebSocket.CLOSED ||
        //   wsRef.current?.readyState === WebSocket.CLOSING
        // ) {
        //   // Forcer une reconnexion si le WebSocket est fermé
        //   setIsConnected(false);
        //   connect();
        // }
      }, 15000); // Ping toutes les 15 secondes
      return () => clearInterval(pingInterval);
    }
  }, [isConnected, ping, connect]);

  return {
    isConnected,
    isAuthenticated,
    sendFriendRequest,
    respondToFriendRequest,
    disconnect,
    reconnect: connect,
    sendMessage,
    lastMessage,
    setExternalCallbacks,
  };
}
