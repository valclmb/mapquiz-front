import { BugReportForm } from "@/components/BugReportForm";
import Typography from "@/components/ui/Typography";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/bug-report")({
  component: BugReportPage,
});

export default function BugReportPage() {
  const searchParams = new URLSearchParams(window.location.search);
  const fromUrl = searchParams.get("from") || "/";

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Typography variant="h1" className="mb-4 text-center ">
        Signaler un problème
      </Typography>
      <Typography variant="p" className="text-muted-foreground text-center ">
        Aidez-nous à améliorer l'application en signalant les bugs que vous
        rencontrez. Votre retour est précieux pour nous !
      </Typography>

      <BugReportForm initialUrl={fromUrl} />
    </div>
  );
}
