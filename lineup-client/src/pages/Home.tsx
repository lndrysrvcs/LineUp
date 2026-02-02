import { useAuth0 } from "@auth0/auth0-react/";
import LoggedInHome from "./LoggedInHome";
import LoggedOutHome from "./LoggedOutHome";

const Home = () => {
  const { isAuthenticated, isLoading, error } = useAuth0();

  return (
    <>
      {(!isLoading || error) && (
        <>{isAuthenticated ? <LoggedInHome /> : <LoggedOutHome />}</>
      )}
    </>
  );
};

export default Home;
