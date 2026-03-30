/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CopyableLink from "../components/CopyableLink";

describe("CopyableLink component", () => {
  const testUrl = "https://example.com";

  beforeEach(() => {
    vi.useFakeTimers();
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn(),
      },
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.restoreAllMocks();
  });

  it("renders the URL initially", () => {
    render(<CopyableLink url={testUrl} />);
    const button = screen.getByRole("button", { name: testUrl });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent(testUrl);
  });

  it("copies the URL to clipboard and shows 'Copied'", async () => {
    const button = screen.getByRole("button");

    await act(async () => {
      fireEvent.click(button);
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(testUrl);
    expect(button).toHaveTextContent("Copied");
  });

  it("resets the text back to the URL after 1.5 seconds", async () => {
    const button = screen.getByRole("button");

    await act(async () => {
      fireEvent.click(button);
    });

    expect(button).toHaveTextContent("Copied");

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(button).toHaveTextContent(testUrl);
  });
});
