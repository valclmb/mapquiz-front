import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { Link, useLocation } from "@tanstack/react-router";
import { BugIcon } from "lucide-react";
export const Footer = () => {
  const location = useLocation();
  return (
    <footer className="pt-5 flex flex-col-reverse gap-3 md:flex-row  items-center justify-between  text-muted-foreground transition-colors">
      <div className="flex-1" />
      <div className="flex flex-1 items-center justify-center gap-1 hover:text-foreground ">
        <GitHubLogoIcon className="size-5" />
        <a href="https://github.com/valclmb">valclmb</a>
      </div>
      <Link
        className="flex flex-1 items-center justify-end gap-1 hover:text-foreground "
        to="/bug-report"
        search={{ from: location.pathname }}
      >
        <BugIcon className="size-5" />
        Remonter un bug
      </Link>
    </footer>
  );
};
