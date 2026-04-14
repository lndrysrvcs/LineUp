import * as authModule from "@/utils/api/auth-token";
import { toast } from "react-hot-toast";
import type { Mock } from "vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { addToasts, authorizedLoaderQuery, unauthorizedLoaderQuery } from "../utils/db";

vi.mock("@/utils/api/auth-token", () => ({ getToken: vi.fn(), logout: vi.fn() }));
vi.mock("react-hot-toast", () => ({ toast: { promise: vi.fn() } }));

describe("db", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.useRealTimers();
  });

  it("addToasts calls toast.promise with provided promise and config", () => {
    const p = Promise.resolve("ok");
    addToasts(p);
    expect(toast.promise).toHaveBeenCalledWith(p, expect.objectContaining({ loading: "Submitting..." }));
  });

  it("addToasts handles rejected promise", async () => {
    const rejectedPromise = Promise.reject({ message: "Test Error" });
    addToasts(rejectedPromise);
    const call = (toast.promise as Mock).mock.calls[0][1];
    const jsx = call.error({ message: "Test Error" });
    expect(jsx.props.children).toEqual(["Error: ", "Test Error"]);
    await rejectedPromise.catch(() => {});
  });

  describe("unauthorizedLoaderQuery", () => {
    it("returns queryKey and queryFn resolves on successful fetch", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: "ok" }),
      });

      const q = unauthorizedLoaderQuery("/api/schedule/{}", "123");
      expect(q.queryKey).toEqual(["availabilities", "/api/schedule/{}", "123"]);

      const res = await q.queryFn();
      expect(res).toEqual({ data: "ok" });
      expect(globalThis.fetch).toHaveBeenCalledWith(
        "/api/schedule/123",
        expect.objectContaining({
          signal: expect.any(Object),
        }),
      );
    });

    it("throws Response with original status when fetch returns non-ok", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: "Not Found",
      });

      const q = unauthorizedLoaderQuery("/api/schedule/{}", "x");
      await expect(q.queryFn()).rejects.toHaveProperty("status", 404);
    });

    it("throws 504 Response when fetch is aborted", async () => {
      globalThis.fetch = vi.fn().mockImplementation(() => {
        return Promise.reject(new DOMException("Aborted", "AbortError"));
      });
      const q = unauthorizedLoaderQuery("/api/schedule/{}", "z");
      await expect(q.queryFn()).rejects.toHaveProperty("status", 504);
    });

    it("throws 503 Response when fetch throws unexpected error", async () => {
      globalThis.fetch = vi.fn().mockImplementation(() => {
        throw new Error("Network failure");
      });
      const q = unauthorizedLoaderQuery("/api/schedule/{}", "y");
      try {
        await q.queryFn();
      } catch (err: unknown) {
        expect(err).toBeInstanceOf(Response);
        expect((err as Response).status).toBe(503);
        expect((err as Response).statusText).toBe("Service Unavailable");
      }
    });
  });

  describe("authorizedLoaderQuery", () => {
    it("returns queryKey and queryFn resolves on successful fetch", async () => {
      (authModule.getToken as unknown as Mock).mockResolvedValue("TEST_TOKEN");
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: "ok" }),
      });

      const q = authorizedLoaderQuery("/api/schedule/{}/details", "123");
      expect(q.queryKey).toEqual(["schedules", "/api/schedule/{}/details", "123"]);

      const res = await q.queryFn();
      expect(res).toEqual({ data: "ok" });
      expect(globalThis.fetch).toHaveBeenCalledWith(
        "/api/schedule/123/details",
        expect.objectContaining({
          signal: expect.any(Object),
        }),
      );
    });

    it("throws Response with original status when fetch returns non-ok", async () => {
      (authModule.getToken as unknown as Mock).mockResolvedValue("TEST_TOKEN");
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: "Not Found",
      });

      const q = authorizedLoaderQuery("/api/schedule/{}/details", "x");
      await expect(q.queryFn()).rejects.toHaveProperty("status", 404);
    });

    it("throws 504 Response when fetch is aborted", async () => {
      (authModule.getToken as unknown as Mock).mockResolvedValue("TEST_TOKEN");
      globalThis.fetch = vi.fn().mockImplementation(() => {
        return Promise.reject(new DOMException("Aborted", "AbortError"));
      });
      const q = authorizedLoaderQuery("/api/schedule/{}/details", "z");
      await expect(q.queryFn()).rejects.toHaveProperty("status", 504);
    });

    it("throws 503 Response when fetch throws unexpected error", async () => {
      (authModule.getToken as unknown as Mock).mockResolvedValue("TEST_TOKEN");
      globalThis.fetch = vi.fn().mockImplementation(() => {
        throw new Error("Network failure");
      });
      const q = authorizedLoaderQuery("/api/schedule/{}/details", "y");
      try {
        await q.queryFn();
      } catch (err: unknown) {
        expect(err).toBeInstanceOf(Response);
        expect((err as Response).status).toBe(503);
        expect((err as Response).statusText).toBe("Service Unavailable");
      }
    });

    it("logs the user out if it's missing a refresh token", async () => {
      (authModule.getToken as unknown as Mock).mockRejectedValue(new Error("Missing Refresh Token"));

      const q = authorizedLoaderQuery("/api/schedule/{}/details", "y");
      try {
        await q.queryFn();
      } catch (err: unknown) {
        expect(authModule.logout).toHaveBeenCalledWith({ logoutParams: { returnTo: window.location.href } });
        expect(err).toBeInstanceOf(Response);
        expect((err as Response).status).toBe(401);
      }
    });
  });
});
