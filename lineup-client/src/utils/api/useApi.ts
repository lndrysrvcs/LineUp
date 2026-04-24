import { useContext } from "react";
import { AuthContext, type AuthContextValue } from "./context";

/** A hook that allows a function to call authenticated functions.
 * @returns The functions that useApi provides.
 */
export function useApi(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useApi must be used within AuthProvider");
  return ctx;
}
