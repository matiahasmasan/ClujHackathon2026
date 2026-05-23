import { createAuthClient } from "better-auth/react";

export const client = createAuthClient({
  baseURL: "http://localhost:8000", // FastAPI backend URL
  basePath: "/api/auth", // API prefix
});

export const useAuth = () => {
  return client.useSession();
};

export const { signUp, signIn, signOut, useSession } = client;
