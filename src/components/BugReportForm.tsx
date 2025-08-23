import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";

interface BugReportFormProps {
  initialUrl?: string;
}

interface FormData {
  title: string;
  description: string;
  stepsToReproduce: string;
  location: string;
}

export const BugReportForm = ({ initialUrl }: BugReportFormProps) => {
  const navigate = useNavigate();
  const form = useForm<FormData>({
    defaultValues: {
      title: "",
      description: "",
      stepsToReproduce: "",
      location: "",
    },
  });

  // Collecte automatique des informations d'environnement
  const getEnvironmentInfo = () => {
    const userAgent = navigator.userAgent;
    const browser = getBrowserInfo(userAgent);
    const os = getOSInfo(userAgent);
    const screenResolution = `${screen.width}x${screen.height}`;
    const deviceType = getDeviceType();

    return {
      browser: browser.name,
      browserVersion: browser.version,
      operatingSystem: os,
      deviceType,
      screenResolution,
    };
  };

  const getBrowserInfo = (userAgent: string) => {
    if (userAgent.includes("Chrome"))
      return {
        name: "Chrome",
        version: userAgent.match(/Chrome\/(\d+)/)?.[1] || "Unknown",
      };
    if (userAgent.includes("Firefox"))
      return {
        name: "Firefox",
        version: userAgent.match(/Firefox\/(\d+)/)?.[1] || "Unknown",
      };
    if (userAgent.includes("Safari"))
      return {
        name: "Safari",
        version: userAgent.match(/Safari\/(\d+)/)?.[1] || "Unknown",
      };
    if (userAgent.includes("Edge"))
      return {
        name: "Edge",
        version: userAgent.match(/Edge\/(\d+)/)?.[1] || "Unknown",
      };
    return { name: "Unknown", version: "Unknown" };
  };

  const getOSInfo = (userAgent: string) => {
    if (userAgent.includes("Windows")) return "Windows";
    if (userAgent.includes("Mac")) return "macOS";
    if (userAgent.includes("Linux")) return "Linux";
    if (userAgent.includes("Android")) return "Android";
    if (userAgent.includes("iOS")) return "iOS";
    return "Unknown";
  };

  const getDeviceType = () => {
    if (window.innerWidth < 768) return "Mobile";
    if (window.innerWidth < 1024) return "Tablet";
    return "Desktop";
  };

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const environment = getEnvironmentInfo();
      const url = initialUrl || window.location.href;

      const bugReportData = {
        ...data,
        environment,
        userAgent: navigator.userAgent,
        url,
      };

      return await apiFetch("/bug-reports", {
        method: "POST",
        body: bugReportData,
        showErrorToast: false,
      });
    },
    onSuccess: () => {
      toast.success("Rapport de bug envoyé avec succès !", {
        description: "Merci de votre retour !",
      });
      form.reset();
      navigate({ to: "/" });
    },
    onError: () => {
      toast.error("Erreur lors de l'envoi du rapport de bug");
    },
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
            aria-labelledby="bug-report-title"
          >
            <h1 id="bug-report-title" className="sr-only">
              Rapport de bug
            </h1>

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre du problème *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Le bouton ne fonctionne pas"
                      {...form.register("title", {
                        required: "Le titre est requis",
                        minLength: {
                          value: 3,
                          message:
                            "Le titre doit contenir au moins 3 caractères",
                        },
                      })}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description du problème *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Décrivez le problème en détail..."
                      rows={4}
                      {...form.register("description", {
                        required: "La description est requise",
                        minLength: {
                          value: 10,
                          message:
                            "La description doit contenir au moins 10 caractères",
                        },
                      })}
                      className={cn(
                        form.formState.errors.description &&
                          "border-destructive focus-visible:ring-destructive/30"
                      )}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="stepsToReproduce"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Étapes pour reproduire le problème (optionnel)
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="1. Aller sur la page...&#10;2. Cliquer sur...&#10;3. Le problème apparaît..."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Où avez-vous rencontré le problème ? (optionnel)
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Page d'accueil, Quiz, Mode multijoueur, etc."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div
              className="text-sm text-muted-foreground bg-muted p-3 rounded-xl border"
              role="region"
              aria-labelledby="environment-info-title"
            >
              <h2 id="environment-info-title" className="font-semibold mb-2">
                Informations automatiquement collectées :
              </h2>
              <ul className="space-y-1" role="list">
                <li>
                  • Navigateur : {getEnvironmentInfo().browser}{" "}
                  {getEnvironmentInfo().browserVersion}
                </li>
                <li>
                  • Système d'exploitation :{" "}
                  {getEnvironmentInfo().operatingSystem}
                </li>
                <li>• Type d'appareil : {getEnvironmentInfo().deviceType}</li>
                <li>• Résolution : {getEnvironmentInfo().screenResolution}</li>
                <li>• URL : {initialUrl || window.location.href}</li>
              </ul>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                aria-describedby={
                  form.formState.isSubmitting ? "submitting-help" : undefined
                }
              >
                {form.formState.isSubmitting
                  ? "Envoi..."
                  : "Envoyer le rapport"}
              </Button>
              {form.formState.isSubmitting && (
                <p id="submitting-help" className="sr-only">
                  Envoi du rapport en cours...
                </p>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
