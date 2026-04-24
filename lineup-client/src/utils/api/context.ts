import { QueryClient } from "@tanstack/react-query";
import { createContext } from "react";

/** The functions to be available to all children of an {@link utils/api/provider.AuthProvider | AuthProvider}. */
export type AuthContextValue = {
  fetchWithAuth: (path: string, init?: RequestInit) => Promise<Response>;
};

/** Creates a context for authentication, needed in a non-component file to be referenced anywhere. */
export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/** The TanStack Query Client, which manages all caching. */
export const queryClient = new QueryClient({});
