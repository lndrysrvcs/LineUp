import { getToken } from "@/utils/api/auth-token";
import { toast } from "react-hot-toast";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function addToasts(promise: Promise<any>) {
  toast.promise(promise, {
    loading: "Submitting...",
    success: <b>Success!</b>,
    error: (err) => <b>Error: {err.message}</b>,
  });
}

function loaderQuery(url: string, param: string) {
  // url should use {} for where the param should be

  return {
    queryKey: ["schedules", url, param],
    queryFn: async () => {
      const token = await getToken();
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout

      try {
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

export { addToasts, loaderQuery };
