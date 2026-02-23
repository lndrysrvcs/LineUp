import { useContext } from "react";
import { AuthContext, type AuthContextValue } from "./context";

export function useApi(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useApi must be used within AuthProvider");
  return ctx;
}
