import googleIcon from "@/assets/google-icon.svg";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

interface GoogleSignInButtonProps {
  className?: string;
  disabled?: boolean;
  children?: React.ReactNode;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export const GoogleSignInButton = ({
  className = "",
  disabled = false,
  variant = "default",
  size = "default",
}: GoogleSignInButtonProps) => {
  const { isPending } = authClient.useSession();

  const handleSignIn = () => {
    authClient.signIn.social({
      provider: "google",
    });
  };

  return (
    <Button
      onClick={handleSignIn}
      disabled={disabled || isPending}
      className={className}
      variant={variant}
      size={size}
    >
      <img src={googleIcon} alt="Google" className="w-5 h-5 dark:invert mr-2" />
      Se connecter
    </Button>
  );
};
