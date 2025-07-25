import { useTheme } from "@/context/ThemeProvider";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group rounded-2xl"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "!rounded-2xl !px-6 !py-5",
          actionButton:
            "!rounded-lg !px-4 !py-3 !bg-background !border !border-secondary  !text-current !text-primary",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
