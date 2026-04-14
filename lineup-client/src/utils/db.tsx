import { getToken, logout } from "@/utils/api/auth-token";
import { toast } from "react-hot-toast";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function addToasts(promise: Promise<any>, loadingMessage?: string, successMessage?: string) {
  toast.promise(promise, {
    loading: loadingMessage ?? "Submitting...",
    success: <b>{successMessage ?? "Success!"}</b>,
    error: (err) => <b>Error: {err.message}</b>,
  });
}

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
