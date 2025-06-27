import { toast } from "sonner";

type ApiOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: Record<string, unknown>;
  headers?: Record<string, string>;
  showErrorToast?: boolean;
  customErrorMessage?: string;
};

export async function apiFetch<T = unknown>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const {
    method = "GET",
    body,
    headers = {},
    showErrorToast = true,
    customErrorMessage,
  } = options;

  const baseUrl = import.meta.env.VITE_API_URL;
  const url = `${baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const requestOptions: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    credentials: "include", // Pour inclure les cookies d'authentification
  };

  if (body && method !== "GET") {
    requestOptions.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, requestOptions);
    const data = await response.json();

    if (!response.ok) {
      const errorMessage =
        data.error || customErrorMessage || "Une erreur est survenue";

      if (showErrorToast) {
        toast.error("Erreur", {
          description: errorMessage,
        });
      }

      throw new Error(errorMessage);
    }

    return data as T;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Une erreur est survenue";

    if (showErrorToast) {
      toast.error("Erreur", {
        description: errorMessage,
      });
    }

    throw error; // On propage l'erreur pour que les hooks puissent la gérer
  }
}
