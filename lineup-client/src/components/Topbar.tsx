import lineupLogo from "@/assets/lineup-full.png";
import { useAuth0 } from "@auth0/auth0-react";
import { Link } from "react-router";

interface Props {
  children: React.ReactNode;
}

const Topbar = ({ children }: Props) => {
  const { isAuthenticated, logout } = useAuth0();

  return (
    <div className="root">
      <div className="topbar">
        <div className="lineUpLogo">
          <Link to="/">
            <img src={lineupLogo} alt="Line Up Logo" height={50} />
          </Link>
        </div>
        <div className="signOutButton">
          {isAuthenticated && (
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
