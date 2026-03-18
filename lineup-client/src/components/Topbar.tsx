import lineupLogo from "@/assets/lineup-full.png";
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { Link, useNavigation } from "react-router";

interface Props {
  children: React.ReactNode;
}

const Topbar = ({ children }: Props) => {
  const { isAuthenticated, logout, loginWithRedirect } = useAuth0();
  const navigation = useNavigation();

  useEffect(() => {
    if (navigation.state === "loading") {
      toast.loading("Loading...", { id: "loading-navigation", duration: Infinity });
    } else {
      toast.remove("loading-navigation");
    }
  }, [navigation.state]);

  return (
    <div className="root">
      <div className="topbar">
        <div className="lineUpLogo">
          <Link to="/">
            <img src={lineupLogo} alt="LineUp Logo" height={50} />
          </Link>
        </div>
        <div className="signOutButton">
          {isAuthenticated ? (
            <button
              onClick={() =>
                logout({
                  logoutParams: { returnTo: globalThis.location.origin },
                })
              }
              className="inlineButton"
            >
              Log Out
            </button>
          ) : (
            <button onClick={() => loginWithRedirect()} className="inlineButton">
              Sign In
            </button>
          )}
        </div>
      </div>
      <hr
        style={{
          borderColor: "var(--primary)",
          borderWidth: "1px",
          borderStyle: "solid",
        }}
      />
      {children}
    </div>
  );
};

export default Topbar;
