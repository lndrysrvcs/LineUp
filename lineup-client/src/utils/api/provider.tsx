import { useAuth0 } from "@auth0/auth0-react";
import React, { useCallback, useEffect } from "react";
import { registerGetToken, registerLogout } from "./auth-token";
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
  const { isAuthenticated, isLoading, getAccessTokenSilently, logout } = useAuth0();

  // used so the loader functions can get the token without needing to use the hook
  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated) {
      registerGetToken(getAccessTokenSilently);
    } else {
      registerGetToken(() => Promise.resolve(""));
    }
    registerLogout(logout);
  }, [isAuthenticated, getAccessTokenSilently, isLoading, logout]);

  const fetchWithAuth = useCallback(
    async (path: string, init?: RequestInit) => {
      if (!isAuthenticated) {
        return await fetchWithoutAuth(path, init);
      }

      try {
        const token = await getAccessTokenSilently();
        const res = await fetch(path, {
          ...init,
          headers: {
            ...init?.headers,
            Authorization: `Bearer ${token}`,
          },
        });

        return res;
      } catch (err: unknown) {
        if (err instanceof Error && err.message.includes("Missing Refresh Token")) {
          logout({
            logoutParams: {
              returnTo: window.location.origin,
            },
          });

          throw new Response(null, { status: 401 });
        }

        throw err;
      }
    },
    [isAuthenticated, getAccessTokenSilently, logout],
  );

  const value: AuthContextValue = {
    fetchWithAuth,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
