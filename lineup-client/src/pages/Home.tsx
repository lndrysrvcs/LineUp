import { useAuth0 } from "@auth0/auth0-react/";
import LoggedInHome from "./LoggedInHome";
import LoggedOutHome from "./LoggedOutHome";

const Home = () => {
  const { isAuthenticated, isLoading, error } = useAuth0();

  // If the user is authenticated, show the logged in homepage, otherwise show the logged out homepage
  // Don't show either if the authentication status is still loading or an error occurs
  return <>{(!isLoading || error) && <>{isAuthenticated ? <LoggedInHome /> : <LoggedOutHome />}</>}</>;
};

export default Home;
