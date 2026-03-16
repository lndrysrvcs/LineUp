/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MousePopup } from "../components/MousePopup";

vi.mock("@/utils/useMousePosition", () => ({
  default: () => ({ x: 100, y: 200 }),
}));

describe("MousePopup", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    cleanup();
  });

  it("does not render when initially closed", () => {
    render(
      <MousePopup isOpen={false}>
        <div>Test 1</div>
      </MousePopup>,
    );

    expect(screen.queryByText("Test 1")).toBeNull();
  });

  it("becomes visible when opened", () => {
    render(
      <MousePopup isOpen={true}>
        <div>Test 2</div>
      </MousePopup>,
    );

    vi.advanceTimersByTime(0);
    const popup = screen.getByText("Test 2").parentElement!;
    expect(popup).toBeInTheDocument();

    vi.advanceTimersByTime(10);
    expect(popup.style.opacity).toBe("1");
  });

  it("positions popup at mouse coordinates", () => {
    render(
      <MousePopup isOpen={true}>
        <div>Test 3</div>
      </MousePopup>,
    );

    vi.advanceTimersByTime(10);
    const popup = screen.getByText("Test 3").parentElement!;
    expect(popup.style.left).toBe("100px");
    expect(popup.style.top).toBe("200px");
  });

  it("hides then unmounts when closed", () => {
    const { rerender } = render(
      <MousePopup isOpen={true} fadeDuration={150}>
        <div>Test 4</div>
      </MousePopup>,
    );

    act(() => {
      vi.advanceTimersByTime(10);
    });

    rerender(
      <MousePopup isOpen={false} fadeDuration={150}>
        <div>Test 4</div>
      </MousePopup>,
    );

    const popup = screen.getByText("Test 4").parentElement!;

    act(() => {
      vi.advanceTimersByTime(0);
    });
    expect(popup.style.opacity).toBe("0");

    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(screen.queryByText("Test 4")).toBeNull();
  });

  it("applies width and height paramaters", () => {
    render(
      <MousePopup isOpen={true} width={100} height={200}>
        <div>Test 5</div>
      </MousePopup>,
    );

    vi.advanceTimersByTime(10);
    const popup = screen.getByText("Test 5").parentElement!;
    expect(popup.style.width).toBe("100px");
    expect(popup.style.height).toBe("200px");
  });
});
