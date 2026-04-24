import { getToken, logout } from "@/utils/api/auth-token";
import { toast } from "react-hot-toast";

/** Adds toasts to asynchronous functions to give user's updates on their API queries.
 *
 * @param promise - The Promise that updates the toast once resolved.
 * @param loadingMessage - The message to display while the Promise is still pending. Defaults to `"Submitting..."`
 * @param successMessage - The message to display if the Promise completes without error. Defaults to `"Success!"`
 * @example addToasts(mutationVar.mutateAsync(), "Working on it...", "Done!");
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function addToasts(promise: Promise<any>, loadingMessage?: string, successMessage?: string) {
  toast.promise(promise, {
    loading: loadingMessage ?? "Submitting...",
    success: <b>{successMessage ?? "Success!"}</b>,
    error: (err) => <b>Error: {err.message}</b>,
  });
}

/** A [React Router Loader](https://reactrouter.com/start/framework/data-loading) function for checking if a dynamic route exists and getting that page's associated data. Used for pages that users don't need to log in for (Availability and EditAvailability pages).
 * @param url - The API URL to fetch from. Replaces {} with param.
 * @param param - The specific param of the page a user navigated to.
 * @returns The data returned from the API.
 * @remarks To be used in conjunction with [useQuery (TanStack)](https://tanstack.com/query/v4/docs/framework/react/reference/useQuery).
 * @example // Queries "/api/schedule/12345/details"
 * useQuery(unauthorizedLoaderQuery("/api/schedule/{}/details", "12345"))
 */
function unauthorizedLoaderQuery(url: string, param: string) {
  // url should use {} for where the param should be

  return {
    queryKey: ["availabilities", url, param],
    queryFn: async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout

      try {
        const res = await fetch(url.replace("{}", param), {
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Response("Parameter not found", {
            status: res.status,
            statusText: res.statusText,
          });
        }

        return res.json();
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") {
          throw new Response("API request timed out", { status: 504, statusText: "Gateway Timeout" });
        }

        if (err instanceof Response) {
          throw err;
        }

        throw new Response("Failed to reach API", { status: 503, statusText: "Service Unavailable" });
      } finally {
        clearTimeout(timeout);
      }
    },
  };
}

/** A [React Router Loader](https://reactrouter.com/start/framework/data-loading) function for checking if a dynamic route exists and getting that page's associated data. Used for restrcted pages that require a user to be logged in (ViewEditSchedule).
 * @param url - The API URL to fetch from. Replaces {} with param.
 * @param param - The specific param of the page a user navigated to.
 * @returns The data returned from the API.
 * @remarks To be used in conjunction with [useQuery (TanStack)](https://tanstack.com/query/v4/docs/framework/react/reference/useQuery).
 * @example // Queries "/api/schedule/12345/details"
 * useQuery(authorizedLoaderQuery("/api/schedule/{}/details", "12345"))
 */
function authorizedLoaderQuery(url: string, param: string) {
  // url should use {} for where the param should be

  return {
    queryKey: ["schedules", url, param],
    queryFn: async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout

      try {
        const token = await getToken();

        const res = await fetch(url.replace("{}", param), {
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Response("Parameter not found", {
            status: res.status,
            statusText: res.statusText,
          });
        }

        return res.json();
      } catch (err: unknown) {
        if (err instanceof Error && err.message.includes("Missing Refresh Token")) {
          logout({
            logoutParams: {
              returnTo: window.location.href,
            },
          });

          throw new Response(null, { status: 401 });
        }

        if (err instanceof DOMException && err.name === "AbortError") {
          throw new Response("API request timed out", { status: 504, statusText: "Gateway Timeout" });
        }

        if (err instanceof Response) {
          throw err;
        }

        throw new Response("Failed to reach API", { status: 503, statusText: "Service Unavailable" });
      } finally {
        clearTimeout(timeout);
      }
    },
  };
}

export { addToasts, authorizedLoaderQuery, unauthorizedLoaderQuery };
