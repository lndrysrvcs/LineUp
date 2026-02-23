import { useAuth0 } from "@auth0/auth0-react";
import React, { useCallback } from "react";
import { AuthContext, type AuthContextValue } from "./context";

async function fetchWithoutAuth(path: string, init?: RequestInit) {
  const res = await fetch(path, {
    ...init,
    headers: {
      ...init?.headers,
    },
  });

  return res;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();

  const fetchWithAuth = useCallback(
    async (path: string, init?: RequestInit) => {
      let res;
      if (!isAuthenticated) {
        res = await fetchWithoutAuth(path, init);
      } else {
        const token = await getAccessTokenSilently();
        res = await fetch(path, {
          ...init,
          headers: {
            ...init?.headers,
            Authorization: `Bearer ${token}`,
          },
        });
      }
      return res;
    },
    [isAuthenticated, getAccessTokenSilently],
  );

  const value: AuthContextValue = {
    fetchWithAuth,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
