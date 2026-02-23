import { QueryClient } from "@tanstack/react-query";
import { createContext } from "react";

export type User = { id: string; email: string; username: string };

export type AuthContextValue = {
  fetchWithAuth: (path: string, init?: RequestInit) => Promise<Response>;
};

// createContext in its own non-component file
export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const queryClient = new QueryClient({});
