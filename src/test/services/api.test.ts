import type { Mock } from "vitest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiFetch } from "../../lib/api";

// Mock fetch globalement
global.fetch = vi.fn() as Mock;

describe("API Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock des variables d'environnement
    vi.stubEnv("VITE_API_URL", "http://localhost:3000/api");
  });

  it("should make a successful GET request", async () => {
    const mockResponse = { data: "test" };
    (fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const result = await apiFetch("/test");

    expect(fetch).toHaveBeenCalledWith("http://localhost:3000/api/test", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    expect(result).toEqual(mockResponse);
  });

  it("should make a successful POST request with body", async () => {
    const mockResponse = { success: true };
    const requestBody = { name: "test" };

    (fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const result = await apiFetch("/test", {
      method: "POST",
      body: requestBody,
    });

    expect(fetch).toHaveBeenCalledWith("http://localhost:3000/api/test", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(requestBody),
    });
    expect(result).toEqual(mockResponse);
  });

  it("should handle API errors correctly", async () => {
    const errorMessage = "API Error";
    (fetch as Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: errorMessage }),
    } as Response);

    await expect(apiFetch("/test")).rejects.toThrow(errorMessage);
  });

  it("should handle network errors correctly", async () => {
    (fetch as Mock).mockRejectedValueOnce(new Error("Network error"));

    await expect(apiFetch("/test")).rejects.toThrow("Network error");
  });

  it("should use custom headers when provided", async () => {
    const customHeaders = { Authorization: "Bearer token" };
    (fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    } as Response);

    await apiFetch("/test", { headers: customHeaders });

    expect(fetch).toHaveBeenCalledWith("http://localhost:3000/api/test", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...customHeaders,
      },
      credentials: "include",
    });
  });

  it("should handle different HTTP methods", async () => {
    const methods = ["PUT", "PATCH", "DELETE"] as const;

    for (const method of methods) {
      (fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as Response);

      await apiFetch("/test", { method });

      expect(fetch).toHaveBeenCalledWith("http://localhost:3000/api/test", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
    }
  });
});
