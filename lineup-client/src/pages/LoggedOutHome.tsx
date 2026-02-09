import { useAuth0 } from "@auth0/auth0-react";

const LoggedOutHome = () => {
  const { loginWithRedirect } = useAuth0();

  return (
    <div className="home">
      Welcome to <b>Line Up</b>, your best tool for easily scheduling any shift-based events. To get started,{" "}
      <button className="inlineButton" onClick={() => loginWithRedirect()}>
        sign in
      </button>{" "}
      with your Google account!
    </div>
  );
};

export default LoggedOutHome;
