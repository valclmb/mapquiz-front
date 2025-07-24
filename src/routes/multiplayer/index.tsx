import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/multiplayer/")({
  component: MultiplayerModalRoute,
});

// Ce composant ne rend rien, la modale est gérée par le parent (__root.tsx)
export default function MultiplayerModalRoute() {
  return null;
}
