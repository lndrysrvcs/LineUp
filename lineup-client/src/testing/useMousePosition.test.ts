/**
 * @vitest-environment jsdom
 */
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import useMousePosition from "../utils/useMousePosition";

describe("useMousePosition", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initializes mouse coords to 0, 0", () => {
    const { result } = renderHook(() => useMousePosition());
    expect(result.current).toEqual({ x: 0, y: 0 });
  });

  it("updates position on mousemove", () => {
    const { result } = renderHook(() => useMousePosition());

    act(() => {
      const event = new MouseEvent("mousemove", {
        clientX: 100,
        clientY: 200,
      });
      window.dispatchEvent(event);
    });

    expect(result.current).toEqual({ x: 100, y: 200 });
  });

  it("removes event listener on unmount", () => {
    const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");
    const { unmount } = renderHook(() => useMousePosition());
    unmount();
    expect(removeEventListenerSpy).toHaveBeenCalledWith("mousemove", expect.any(Function));
  });
});
