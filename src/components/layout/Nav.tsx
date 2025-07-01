import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Earth, LogOut, UserPlus } from "lucide-react";
import { toast } from "sonner";

export const Nav = () => {
  const { data, isPending } = authClient.useSession();

  const signIn = () => {
    authClient.signIn.social({
      provider: "google",
    });
  };

  const signOut = () => {
    authClient.signOut().then((res) => {
      if (res.data?.success) {
        toast("Déconnexion réussie");
      }
    });
  };
  return (
    <nav className="absolute top-2 left-1/2 -translate-x-1/2 z-40 w-11/12 flex items-center justify-between px-5 py-2 border border-secondary rounded-xl bg-background/50 backdrop-blur-md">
      <Link to="/" className="flex items-center gap-2">
        <Earth />
        <span className="font-bold">Map Quiz</span>
      </Link>

      {isPending ? (
        <Button variant="outline">Chargement...</Button>
      ) : data?.user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="relative h-9 w-9 rounded-full p-0 overflow-hidden"
            >
              <img
                src={data.user.image ?? ""}
                alt={data.user.name}
                className="w-full h-full object-cover size-10"
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>{data.user.name}</DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                to="/social"
                className="cursor-pointer flex items-center gap-2"
              >
                <UserPlus className="h-4 w-4" />
                <span>Amis</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={signOut} className="cursor-pointer">
              <LogOut className="h-4 w-4 mr-2" />
              <span>Déconnexion</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button onClick={signIn} disabled={isPending}>
          Se connecter
        </Button>
      )}
    </nav>
  );
};
