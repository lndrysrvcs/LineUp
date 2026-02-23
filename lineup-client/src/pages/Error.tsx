import { isRouteErrorResponse, Link, useRouteError } from "react-router";

export default function ErrorPage() {
  const error = useRouteError();

  console.log(error);

  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <div>
        <h1>404 - Page Not Found</h1>
        <p>The resource you're looking for doesn't exist.</p>
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
