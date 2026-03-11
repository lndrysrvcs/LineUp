import { useEffect } from "react";
import toast from "react-hot-toast";
import { isRouteErrorResponse, Link, useRouteError } from "react-router";

export default function ErrorPage() {
  const error = useRouteError();

  useEffect(() => {
    toast.dismiss();
  }, []);

  if (isRouteErrorResponse(error)) {
    return (
      <div>
        <h1>
          {error.status} - {error.statusText ?? error.data}
        </h1>
        {error.status === 404 && <p>The resource you're looking for doesn't exist.</p>}
        <Link to="/">Go Home</Link>
      </div>
    );
  }

  // Fallback for unexpected errors
  return (
    <div>
      <h1>Oops! Something went wrong.</h1>
    </div>
  );
}
