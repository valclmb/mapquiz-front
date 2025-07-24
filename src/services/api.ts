import { toast } from "sonner";

interface ApiError extends Error {
  status?: number;
  code?: string;
}

interface ApiResponse<T = unknown> {
  data: T;
  success: boolean;
  error?: string;
}

interface ApiOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: Record<string, unknown>;
  headers?: Record<string, string>;
  showErrorToast?: boolean;
  customErrorMessage?: string;
  timeout?: number;
}

class ApiService {
  private baseUrl: string;
  private defaultTimeout = 10000; // 10 secondes

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || "";
  }

  private async fetchWithTimeout(
    url: string,
    options: RequestInit,
    timeout: number
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private createUrl(endpoint: string): string {
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    return `${this.baseUrl}${cleanEndpoint}`;
  }

  private createRequestOptions(options: ApiOptions): RequestInit {
    const { method = "GET", body, headers = {} } = options;

    const requestOptions: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      credentials: "include",
    };

    if (body && method !== "GET") {
      requestOptions.body = JSON.stringify(body);
    }

    return requestOptions;
  }

  private handleError(
    error: unknown,
    showErrorToast: boolean,
    customErrorMessage?: string
  ): ApiError {
    const apiError: ApiError = new Error();

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        apiError.message = "Timeout: La requête a pris trop de temps";
        apiError.code = "TIMEOUT";
      } else {
        apiError.message = error.message;
      }
    } else {
      apiError.message = "Une erreur inattendue s'est produite";
    }

    const errorMessage = customErrorMessage || apiError.message;

    if (showErrorToast) {
      toast.error("Erreur", {
        description: errorMessage,
      });
    }

    return apiError;
  }

  async request<T = unknown>(
    endpoint: string,
    options: ApiOptions = {}
  ): Promise<T> {
    const {
      timeout = this.defaultTimeout,
      showErrorToast = true,
      customErrorMessage,
    } = options;

    const url = this.createUrl(endpoint);
    const requestOptions = this.createRequestOptions(options);

    try {
      const response = await this.fetchWithTimeout(url, requestOptions, timeout);
      const data: ApiResponse<T> = await response.json();

      if (!response.ok) {
        const error: ApiError = new Error(
          data.error || customErrorMessage || "Une erreur est survenue"
        );
        error.status = response.status;

        if (showErrorToast) {
          toast.error("Erreur", {
            description: error.message,
          });
        }

        throw error;
      }

      return data.data || (data as T);
    } catch (error) {
      throw this.handleError(error, showErrorToast, customErrorMessage);
    }
  }

  // Méthodes de convenance
  async get<T = unknown>(
    endpoint: string,
    options: Omit<ApiOptions, "method"> = {}
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  async post<T = unknown>(
    endpoint: string,
    body: Record<string, unknown>,
    options: Omit<ApiOptions, "method" | "body"> = {}
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "POST", body });
  }

  async put<T = unknown>(
    endpoint: string,
    body: Record<string, unknown>,
    options: Omit<ApiOptions, "method" | "body"> = {}
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "PUT", body });
  }

  async patch<T = unknown>(
    endpoint: string,
    body: Record<string, unknown>,
    options: Omit<ApiOptions, "method" | "body"> = {}
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "PATCH", body });
  }

  async delete<T = unknown>(
    endpoint: string,
    options: Omit<ApiOptions, "method"> = {}
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
}

// Instance singleton
export const apiService = new ApiService();

// Export des types pour l'utilisation externe
export type { ApiError, ApiOptions };

// Fonction legacy pour la compatibilité (deprecated)
export async function apiFetch<T = unknown>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  return apiService.request<T>(endpoint, options);
}