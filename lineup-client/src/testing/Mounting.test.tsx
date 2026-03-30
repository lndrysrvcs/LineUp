/**
 * @vitest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@testing-library/jest-dom/vitest";
import { cleanup, render } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { afterEach, describe, it, vi } from "vitest";

import App from "../App";
import Availability from "../pages/Availability";
import Error from "../pages/Error";
import Home from "../pages/Home";
import LoggedInHome from "../pages/LoggedInHome";
import LoggedOutHome from "../pages/LoggedOutHome";
import NewSchedule from "../pages/NewSchedule";
import ViewEditSchedule from "../pages/ViewEditSchedule";

vi.mock("@auth0/auth0-react", () => ({
  useAuth0: () => ({
    isAuthenticated: true,
    user: { name: "Test User", email: "test@test.com" },
    loginWithRedirect: vi.fn(),
    logout: vi.fn(),
  }),
  Auth0Provider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("react-router", async () => {
  const actual = await vi.importActual<typeof import("react-router")>("react-router");
  return {
    ...actual,
    useRouteError: () => ({ message: "Test error" }),
  };
});

vi.mock("../utils/api", async () => {
  const actual = await vi.importActual<typeof import("../utils/api")>("../utils/api");

  return {
    ...actual,
    useApi: () => ({
      fetchWithAuth: vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          name: "Test Schedule",
          startTime: "09:00",
          endTime: "17:00",
          availabilities: [{ availabilitySlots: ["2026-01-01T09:00:00"], userName: "Test User" }],
          dateCoverage: ["2026-01-01"],
          schedulePreferences: { minutesPerSlot: 15, usersPerShift: 1 },
          shiftAssignments: [],
        }),
      }),
    }),
  };
});

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        retryOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchInterval: false,
        staleTime: Infinity,
      },
    },
  });

const renderWithProviders = (
  component: React.ReactElement,
  {
    route = "/",
    path = "/",
  }: {
    route?: string;
    path?: string;
  } = {},
) => {
  const queryClient = createTestQueryClient();

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path={path} element={component} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("Pages mount correctly", () => {
  it("App mounts without crashing", () => {
    render(<App />);
  });

  it("Availability mounts without crashing", () => {
    renderWithProviders(<Availability />);
  });

  it("Error mounts without crashing", () => {
    renderWithProviders(<Error />);
  });

  it("Home mounts without crashing", () => {
    renderWithProviders(<Home />);
  });

  it("LoggedInHome mounts without crashing", () => {
    renderWithProviders(<LoggedInHome />);
  });

  it("LoggedOutHome mounts without crashing", () => {
    renderWithProviders(<LoggedOutHome />);
  });

  it("NewSchedule mounts without crashing", () => {
    renderWithProviders(<NewSchedule />);
  });

  it("ViewEditSchedule mounts without crashing", () => {
    renderWithProviders(<ViewEditSchedule />, { path: "/schedule/test-guid" });
  });
});
