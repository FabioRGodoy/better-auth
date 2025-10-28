import { createAuthClient } from "better-auth/react";

const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_AUTH_SERVER_URL,
  fetchOptions: { credentials: "include" },
});

const { useSession, signIn, signOut } = authClient;

export { authClient, useSession, signIn, signOut };
