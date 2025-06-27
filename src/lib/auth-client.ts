import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: `${import.meta.env.VITE_API_URL}/auth`,
});

export const { signIn, signOut, signUp, useSession, getSession } = authClient;
