import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { Link } from "@tanstack/react-router";

import googleIcon from "@/assets/google-icon.svg";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/ThemeProvider";
import { Earth, LogOut, Moon, Sun, UserPlus } from "lucide-react";
import { toast } from "sonner";
export const Nav = () => {
  const { data, isPending } = authClient.useSession();
  const { theme, setTheme } = useTheme();

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

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  };
  return (
    <nav className=" bg-card absolute top-2 left-1/2 -translate-x-1/2 z-40  w-full flex items-center justify-between px-5 py-3 border border-secondary rounded-2xl shadow-sm">
      <Link to="/" className="group flex items-center gap-2 ">
        <Earth className="group-hover:rotate-180 transition-all duration-300 " />

        <span className="font-bold ">Map Quiz</span>
      </Link>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={toggleTheme}>
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>

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
            <img
              src={googleIcon}
              alt="Google"
              className="w-5 h-5 dark:invert"
            />
            Se connecter{" "}
          </Button>
        )}
      </div>
    </nav>
  );
};
