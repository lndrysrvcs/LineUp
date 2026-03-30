// App.tsx
import "@/App.css";
import Topbar from "@/components/Topbar";
import Availability from "@/pages/Availability";
import Error from "@/pages/Error";
import Home from "@/pages/Home";
import NewSchedule from "@/pages/NewSchedule";
import ViewEditSchedule from "@/pages/ViewEditSchedule";
import { queryClient } from "@/utils/api";
import { loaderQuery } from "@/utils/db";
import { createBrowserRouter, Navigate, Outlet, RouterProvider, type LoaderFunctionArgs } from "react-router";

// Wrap Topbar as a layout route so it wraps all pages
function Layout() {
  return (
    <Topbar>
      <Outlet />
    </Topbar>
  );
}

async function availabilityLoader({ params }: LoaderFunctionArgs) {
  return queryClient.ensureQueryData(loaderQuery("/api/schedule/{}", params.guid!));
}

async function scheduleLoader({ params }: LoaderFunctionArgs) {
  return queryClient.ensureQueryData(loaderQuery("/api/schedule/{}/details", params.guid!));
}

const router = createBrowserRouter([
  {
    element: <Layout />,
    errorElement: <Error />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/newschedule",
        element: <NewSchedule />,
      },
      {
        path: "/schedule",
        children: [
          {
            index: true, // matches exactly /schedule
            element: <Navigate to="/" replace />,
          },
          {
            path: ":guid", // matches /schedule/:guid
            element: <Availability />,
            loader: availabilityLoader,
          },
          {
            path: ":guid/edit", // matches /schedule/:guid/edit
            element: <ViewEditSchedule />,
            loader: scheduleLoader,
          },
        ],
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
