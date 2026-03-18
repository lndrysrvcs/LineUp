/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Topbar from "../components/Topbar";

const mockState = vi.hoisted(() => ({
  isAuthenticated: true,
  navigationState: "idle" as "idle" | "loading",
  logoutMock: vi.fn(),
  toastLoadingMock: vi.fn(),
  toastRemoveMock: vi.fn(),
}));

vi.mock("@auth0/auth0-react", () => ({
  useAuth0: () => ({
    isAuthenticated: mockState.isAuthenticated,
    logout: mockState.logoutMock,
  }),
}));

vi.mock("react-router", async () => {
  const actual = await vi.importActual<typeof import("react-router")>("react-router");

  return {
    ...actual,
    useNavigation: () => ({
      state: mockState.navigationState,
    }),
  };
});

vi.mock("react-hot-toast", () => ({
  default: {
    loading: mockState.toastLoadingMock,
    remove: mockState.toastRemoveMock,
  },
}));

function renderTopbar(children = <div>Child Content</div>) {
  return render(
    <MemoryRouter>
      <Topbar>{children}</Topbar>
    </MemoryRouter>,
  );
}

describe("Topbar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockState.isAuthenticated = true;
    mockState.navigationState = "idle";
  });

  afterEach(() => {
    cleanup();
  });

  it("renders logo and home link", () => {
    renderTopbar();
    const img = screen.getByAltText("LineUp Logo");
    expect(img).toBeInTheDocument();
    const link = img.closest("a");
    expect(link).toHaveAttribute("href", "/");
  });

  it("renders children content", () => {
    renderTopbar();
    expect(screen.getByText("Child Content")).toBeInTheDocument();
  });

  it("shows logout button when authenticated", () => {
    mockState.isAuthenticated = true;
    renderTopbar();
    expect(screen.getByRole("button", { name: /log out/i })).toBeInTheDocument();
  });

  it("hides logout button when not authenticated", () => {
    mockState.isAuthenticated = false;
    renderTopbar();
    expect(screen.queryByRole("button", { name: /log out/i })).toBeNull();
  });

  it("calls logout when logout button clicked", () => {
    renderTopbar();
    fireEvent.click(screen.getByRole("button", { name: /log out/i }));
    expect(mockState.logoutMock).toHaveBeenCalledWith({
      logoutParams: { returnTo: globalThis.location.origin },
    });
  });

  it("shows loading toast during navigation", () => {
    mockState.navigationState = "loading";
    renderTopbar();
    expect(mockState.toastLoadingMock).toHaveBeenCalledWith("Loading...", {
      id: "loading-navigation",
      duration: Infinity,
    });
  });

  it("removes loading toast when navigation finishes", () => {
    mockState.navigationState = "idle";
    renderTopbar();
    expect(mockState.toastRemoveMock).toHaveBeenCalledWith("loading-navigation");
  });
});
