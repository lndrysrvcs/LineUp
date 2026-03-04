// App.tsx
import "@/App.css";
import Topbar from "@/components/Topbar";
import Error from "@/pages/Error";
import Home from "@/pages/Home";
import NewSchedule from "@/pages/NewSchedule";
import Schedule from "@/pages/Schedule";
import ViewEditSchedule from "@/pages/ViewEditSchedule";
import { createBrowserRouter, Navigate, Outlet, RouterProvider, type LoaderFunctionArgs } from "react-router";

// Wrap Topbar as a layout route so it wraps all pages
function Layout() {
  return (
    <Topbar>
      <Outlet />
    </Topbar>
  );
}

async function scheduleLoader({ params }: LoaderFunctionArgs) {
  const res = await fetch(`/api/schedule/${params.guid}`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Response("Schedule not found", { status: res.status, statusText: res.statusText });
  }

  return res.json();
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
            element: <Schedule />,
            loader: scheduleLoader,
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
